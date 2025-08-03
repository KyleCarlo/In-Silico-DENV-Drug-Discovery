"""
Molecular docking API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
import asyncio
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from ..models.database import (
    DockingJobModel, 
    DockingParametersModel, 
    DockingResultModel,
    AnalysisRequestModel,
    JobStatus
)
from ..utils.docking import perform_molecular_docking, estimate_completion_time
from ..core.config import get_settings

router = APIRouter(prefix="/docking", tags=["docking"])
settings = get_settings()

# In-memory storage (replace with proper database)
docking_jobs = {}

# Import protein and ligand databases from other modules
from .proteins import proteins_db
from .ligands import ligands_db


@router.post("/jobs/", response_model=DockingJobModel)
async def create_docking_job(
    analysis_request: AnalysisRequestModel,
    background_tasks: BackgroundTasks
):
    """Create a new molecular docking job"""
    
    # Validate protein exists
    if analysis_request.protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    # Validate ligand exists
    if analysis_request.ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    # Generate unique job ID
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    
    # Estimate completion time
    estimated_time = estimate_completion_time(analysis_request.parameters)
    estimated_completion = datetime.now() + timedelta(seconds=estimated_time)
    
    # Create docking job
    job = DockingJobModel(
        id=job_id,
        protein_id=analysis_request.protein_id,
        ligand_id=analysis_request.ligand_id,
        parameters=analysis_request.parameters,
        status=JobStatus.PENDING,
        estimated_completion=estimated_completion
    )
    
    docking_jobs[job_id] = job
    
    # Start background task for docking calculation
    background_tasks.add_task(run_docking_calculation, job_id)
    
    return job


async def run_docking_calculation(job_id: str):
    """Background task to run molecular docking calculation"""
    try:
        job = docking_jobs[job_id]
        job.status = JobStatus.RUNNING
        job.started_at = datetime.now()
        job.progress = 0.0
        
        # Get protein and ligand information
        protein = proteins_db[job.protein_id]
        ligand = ligands_db[job.ligand_id]
        
        # Perform docking calculation with progress updates
        async def progress_callback(progress: float):
            job.progress = progress
        
        results = await perform_molecular_docking(
            protein=protein,
            ligand=ligand,
            parameters=job.parameters,
            progress_callback=progress_callback
        )
        
        # Update job with results
        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.now()
        job.progress = 100.0
        job.results = results
        
    except Exception as e:
        job = docking_jobs.get(job_id)
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.now()
            job.progress = 0.0


@router.get("/jobs/", response_model=List[DockingJobModel])
async def list_docking_jobs(
    status: Optional[JobStatus] = None,
    limit: int = 100,
    offset: int = 0
):
    """List docking jobs with optional filtering"""
    jobs = list(docking_jobs.values())
    
    # Filter by status if provided
    if status:
        jobs = [job for job in jobs if job.status == status]
    
    # Sort by creation time (newest first)
    jobs.sort(key=lambda x: x.created_at, reverse=True)
    
    # Apply pagination
    return jobs[offset:offset + limit]


@router.get("/jobs/{job_id}", response_model=DockingJobModel)
async def get_docking_job(job_id: str):
    """Get specific docking job information"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    return docking_jobs[job_id]


@router.put("/jobs/{job_id}/cancel")
async def cancel_docking_job(job_id: str):
    """Cancel a running docking job"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    job = docking_jobs[job_id]
    
    if job.status not in [JobStatus.PENDING, JobStatus.RUNNING]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel job with status: {job.status}"
        )
    
    job.status = JobStatus.CANCELLED
    job.completed_at = datetime.now()
    job.error_message = "Job cancelled by user"
    
    return {"message": "Job cancelled successfully"}


@router.delete("/jobs/{job_id}")
async def delete_docking_job(job_id: str):
    """Delete a docking job"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    job = docking_jobs[job_id]
    
    # Clean up any result files
    results_dir = Path(settings.results_directory) / job_id
    if results_dir.exists():
        import shutil
        shutil.rmtree(results_dir)
    
    del docking_jobs[job_id]
    return {"message": "Docking job deleted successfully"}


@router.get("/jobs/{job_id}/results")
async def get_docking_results(job_id: str):
    """Get detailed docking results"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    job = docking_jobs[job_id]
    
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400, 
            detail=f"Job not completed. Current status: {job.status}"
        )
    
    if not job.results:
        raise HTTPException(status_code=404, detail="No results available")
    
    return {
        "job_id": job_id,
        "results": job.results,
        "protein": proteins_db[job.protein_id],
        "ligand": ligands_db[job.ligand_id],
        "parameters": job.parameters,
        "completed_at": job.completed_at
    }


@router.get("/jobs/{job_id}/download/{file_type}")
async def download_result_file(job_id: str, file_type: str):
    """Download result files (poses, logs, etc.)"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    job = docking_jobs[job_id]
    
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed")
    
    # Define available file types
    file_mapping = {
        "poses": "docked_poses.sdf",
        "log": "docking_log.txt",
        "report": "docking_report.pdf",
        "interactions": "interactions.json"
    }
    
    if file_type not in file_mapping:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Available: {list(file_mapping.keys())}"
        )
    
    # Check if file exists
    results_dir = Path(settings.results_directory) / job_id
    file_path = results_dir / file_mapping[file_type]
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Result file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{job_id}_{file_mapping[file_type]}",
        media_type="application/octet-stream"
    )


@router.post("/jobs/{job_id}/rerun")
async def rerun_docking_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    new_parameters: Optional[DockingParametersModel] = None
):
    """Rerun a docking job with optionally modified parameters"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    original_job = docking_jobs[job_id]
    
    # Create new job ID for the rerun
    new_job_id = f"job_{uuid.uuid4().hex[:12]}"
    
    # Use new parameters if provided, otherwise use original
    parameters = new_parameters or original_job.parameters
    
    # Create new job
    new_job = DockingJobModel(
        id=new_job_id,
        protein_id=original_job.protein_id,
        ligand_id=original_job.ligand_id,
        parameters=parameters,
        status=JobStatus.PENDING
    )
    
    docking_jobs[new_job_id] = new_job
    
    # Start background task
    background_tasks.add_task(run_docking_calculation, new_job_id)
    
    return {
        "original_job_id": job_id,
        "new_job_id": new_job_id,
        "message": "Job rerun initiated"
    }


@router.get("/stats")
async def get_docking_statistics():
    """Get docking system statistics"""
    total_jobs = len(docking_jobs)
    
    status_counts = {}
    for status in JobStatus:
        status_counts[status.value] = sum(1 for job in docking_jobs.values() if job.status == status)
    
    # Calculate average completion time for completed jobs
    completed_jobs = [job for job in docking_jobs.values() if job.status == JobStatus.COMPLETED]
    avg_completion_time = None
    
    if completed_jobs:
        completion_times = []
        for job in completed_jobs:
            if job.started_at and job.completed_at:
                duration = (job.completed_at - job.started_at).total_seconds()
                completion_times.append(duration)
        
        if completion_times:
            avg_completion_time = sum(completion_times) / len(completion_times)
    
    return {
        "total_jobs": total_jobs,
        "status_distribution": status_counts,
        "average_completion_time_seconds": avg_completion_time,
        "active_jobs": status_counts.get("running", 0) + status_counts.get("pending", 0)
    }


@router.post("/validate-parameters")
async def validate_docking_parameters(parameters: DockingParametersModel):
    """Validate docking parameters"""
    validation_results = {
        "valid": True,
        "warnings": [],
        "errors": []
    }
    
    # Check box size
    box_volume = parameters.size_x * parameters.size_y * parameters.size_z
    if box_volume > 100000:  # 100 Å³
        validation_results["warnings"].append(
            "Large docking box may significantly increase computation time"
        )
    
    if box_volume < 1000:  # 10 Å³
        validation_results["warnings"].append(
            "Small docking box may miss important binding sites"
        )
    
    # Check exhaustiveness
    if parameters.exhaustiveness > 16:
        validation_results["warnings"].append(
            "High exhaustiveness values may not improve results significantly"
        )
    
    # Check number of modes
    if parameters.num_modes > 15:
        validation_results["warnings"].append(
            "Large number of modes may produce redundant results"
        )
    
    return validation_results
