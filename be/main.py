"""
FastAPI Backend for In-Silico DENV Drug Discovery
Protein-Ligand Interaction and Molecular Docking Platform
"""

import os
import asyncio
import tempfile
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
import aiofiles
import numpy as np

# Molecular libraries
try:
    from rdkit import Chem
    from rdkit.Chem import Draw, AllChem, Descriptors
except ImportError:
    print("Warning: RDKit not available. Install with: pip install rdkit-pypi")

try:
    from Bio.PDB import PDBParser, PDBIO, Select
    from Bio.SeqUtils.ProtParam import ProteinAnalysis
except ImportError:
    print("Warning: BioPython not available. Install with: pip install biopython")

# FastAPI app initialization
app = FastAPI(
    title="QuantumDock API",
    description="In-Silico DENV Drug Discovery Platform - Protein-Ligand Interaction Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ProteinInfo(BaseModel):
    """Protein information model"""
    name: str
    pdb_id: Optional[str] = None
    sequence: Optional[str] = None
    molecular_weight: Optional[float] = None
    resolution: Optional[float] = None
    organism: Optional[str] = None
    classification: Optional[str] = None

class LigandInfo(BaseModel):
    """Ligand information model"""
    name: str
    smiles: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    logp: Optional[float] = None
    hbd: Optional[int] = None  # Hydrogen bond donors
    hba: Optional[int] = None  # Hydrogen bond acceptors
    tpsa: Optional[float] = None  # Topological polar surface area

class DockingParameters(BaseModel):
    """Molecular docking parameters"""
    center_x: float = Field(default=0.0, description="Docking box center X coordinate")
    center_y: float = Field(default=0.0, description="Docking box center Y coordinate") 
    center_z: float = Field(default=0.0, description="Docking box center Z coordinate")
    size_x: float = Field(default=20.0, description="Docking box size X dimension")
    size_y: float = Field(default=20.0, description="Docking box size Y dimension")
    size_z: float = Field(default=20.0, description="Docking box size Z dimension")
    exhaustiveness: int = Field(default=8, description="Exhaustiveness parameter (1-32)")
    num_modes: int = Field(default=9, description="Number of binding modes to generate")
    energy_range: float = Field(default=3.0, description="Energy range for binding modes")

class DockingJob(BaseModel):
    """Docking job model"""
    job_id: str
    protein_file: str
    ligand_file: str
    parameters: DockingParameters
    status: str = "pending"  # pending, running, completed, failed
    created_at: datetime
    completed_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class DockingResult(BaseModel):
    """Docking result model"""
    job_id: str
    binding_affinity: float
    rmsd_lower_bound: float
    rmsd_upper_bound: float
    pose_count: int
    interaction_data: Dict[str, Any]
    visualization_files: List[str]

class AnalysisRequest(BaseModel):
    """Analysis request model"""
    protein_id: str
    ligand_id: str
    parameters: DockingParameters

# In-memory storage (in production, use a proper database)
proteins_db: Dict[str, ProteinInfo] = {}
ligands_db: Dict[str, LigandInfo] = {}
docking_jobs: Dict[str, DockingJob] = {}
upload_directory = Path("uploads")
results_directory = Path("results")

# Create directories
upload_directory.mkdir(exist_ok=True)
results_directory.mkdir(exist_ok=True)

# Utility functions
def generate_job_id() -> str:
    """Generate unique job ID"""
    return str(uuid.uuid4())

def calculate_ligand_properties(smiles: str) -> Dict[str, Any]:
    """Calculate molecular properties from SMILES"""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            raise ValueError("Invalid SMILES string")
        
        properties = {
            "molecular_weight": Descriptors.MolWt(mol),
            "logp": Descriptors.MolLogP(mol),
            "hbd": Descriptors.NumHDonors(mol),
            "hba": Descriptors.NumHAcceptors(mol),
            "tpsa": Descriptors.TPSA(mol),
            "rotatable_bonds": Descriptors.NumRotatableBonds(mol),
            "aromatic_rings": Descriptors.NumAromaticRings(mol)
        }
        return properties
    except Exception as e:
        return {"error": str(e)}

def analyze_protein_structure(pdb_content: str) -> Dict[str, Any]:
    """Analyze protein structure from PDB content"""
    try:
        # Create temporary file for PDB content
        with tempfile.NamedTemporaryFile(mode='w', suffix='.pdb', delete=False) as tmp_file:
            tmp_file.write(pdb_content)
            tmp_file_path = tmp_file.name
        
        # Parse PDB structure
        parser = PDBParser(QUIET=True)
        structure = parser.get_structure('protein', tmp_file_path)
        
        # Extract basic information
        model = structure[0]
        chain_count = len(list(model.get_chains()))
        residue_count = len(list(model.get_residues()))
        atom_count = len(list(model.get_atoms()))
        
        # Calculate center of mass
        atoms = list(model.get_atoms())
        coords = np.array([atom.coord for atom in atoms])
        center_of_mass = np.mean(coords, axis=0)
        
        # Calculate bounding box
        min_coords = np.min(coords, axis=0)
        max_coords = np.max(coords, axis=0)
        dimensions = max_coords - min_coords
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return {
            "chain_count": chain_count,
            "residue_count": residue_count,
            "atom_count": atom_count,
            "center_of_mass": center_of_mass.tolist(),
            "dimensions": dimensions.tolist(),
            "bounding_box": {
                "min": min_coords.tolist(),
                "max": max_coords.tolist()
            }
        }
    except Exception as e:
        return {"error": str(e)}

async def simulate_docking_calculation(job: DockingJob) -> DockingResult:
    """Simulate molecular docking calculation"""
    try:
        # Simulate calculation time
        await asyncio.sleep(5)
        
        # Generate mock results
        binding_affinity = np.random.uniform(-12.0, -6.0)
        rmsd_lb = np.random.uniform(0.0, 2.0)
        rmsd_ub = np.random.uniform(rmsd_lb, rmsd_lb + 3.0)
        pose_count = job.parameters.num_modes
        
        interaction_data = {
            "hydrogen_bonds": np.random.randint(1, 6),
            "hydrophobic_contacts": np.random.randint(3, 15),
            "aromatic_interactions": np.random.randint(0, 3),
            "binding_site_residues": ["ARG123", "ASP456", "PHE789", "LYS234"]
        }
        
        result = DockingResult(
            job_id=job.job_id,
            binding_affinity=binding_affinity,
            rmsd_lower_bound=rmsd_lb,
            rmsd_upper_bound=rmsd_ub,
            pose_count=pose_count,
            interaction_data=interaction_data,
            visualization_files=[]
        )
        
        return result
        
    except Exception as e:
        raise Exception(f"Docking calculation failed: {str(e)}")

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "QuantumDock API - In-Silico DENV Drug Discovery Platform",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

# Protein endpoints
@app.post("/proteins/", response_model=ProteinInfo)
async def create_protein(protein: ProteinInfo):
    """Create a new protein entry"""
    protein_id = f"protein_{len(proteins_db) + 1}"
    proteins_db[protein_id] = protein
    return protein

@app.post("/proteins/upload/")
async def upload_protein_file(file: UploadFile = File(...)):
    """Upload protein PDB file"""
    if not file.filename.endswith(('.pdb', '.PDB')):
        raise HTTPException(status_code=400, detail="Only PDB files are allowed")
    
    protein_id = f"protein_{uuid.uuid4().hex[:8]}"
    file_path = upload_directory / f"{protein_id}.pdb"
    
    # Save uploaded file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Analyze protein structure
    pdb_content = content.decode('utf-8')
    analysis = analyze_protein_structure(pdb_content)
    
    # Create protein info
    protein_info = ProteinInfo(
        name=file.filename,
        molecular_weight=analysis.get('molecular_weight'),
        classification="Uploaded protein"
    )
    
    proteins_db[protein_id] = protein_info
    
    return {
        "protein_id": protein_id,
        "filename": file.filename,
        "analysis": analysis,
        "message": "Protein uploaded successfully"
    }

@app.get("/proteins/")
async def list_proteins():
    """List all proteins"""
    return {
        "proteins": [
            {"id": k, **v.dict()} for k, v in proteins_db.items()
        ]
    }

@app.get("/proteins/{protein_id}")
async def get_protein(protein_id: str):
    """Get specific protein information"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    return proteins_db[protein_id]

@app.delete("/proteins/{protein_id}")
async def delete_protein(protein_id: str):
    """Delete a specific protein"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    del proteins_db[protein_id]
    return {"message": "Protein deleted successfully"}

# Ligand endpoints
@app.post("/ligands/", response_model=LigandInfo)
async def create_ligand(ligand: LigandInfo):
    """Create a new ligand entry"""
    ligand_id = f"ligand_{len(ligands_db) + 1}"
    
    # Calculate properties if SMILES provided
    if ligand.smiles:
        properties = calculate_ligand_properties(ligand.smiles)
        if "error" not in properties:
            ligand.molecular_weight = properties.get("molecular_weight")
            ligand.logp = properties.get("logp")
            ligand.hbd = properties.get("hbd")
            ligand.hba = properties.get("hba")
            ligand.tpsa = properties.get("tpsa")
    
    ligands_db[ligand_id] = ligand
    return ligand

@app.post("/ligands/from-smiles/")
async def create_ligand_from_smiles(smiles: str, name: str = "Generated Ligand"):
    """Create ligand from SMILES string"""
    properties = calculate_ligand_properties(smiles)
    
    if "error" in properties:
        raise HTTPException(status_code=400, detail=f"Invalid SMILES: {properties['error']}")
    
    ligand_id = f"ligand_{uuid.uuid4().hex[:8]}"
    
    ligand_info = LigandInfo(
        name=name,
        smiles=smiles,
        molecular_weight=properties.get("molecular_weight"),
        logp=properties.get("logp"),
        hbd=properties.get("hbd"),
        hba=properties.get("hba"),
        tpsa=properties.get("tpsa")
    )
    
    ligands_db[ligand_id] = ligand_info
    
    return {
        "ligand_id": ligand_id,
        "ligand_info": ligand_info,
        "properties": properties,
        "message": "Ligand created successfully"
    }

@app.get("/ligands/")
async def list_ligands():
    """List all ligands"""
    return {
        "ligands": [
            {"id": k, **v.dict()} for k, v in ligands_db.items()
        ]
    }

@app.get("/ligands/{ligand_id}")
async def get_ligand(ligand_id: str):
    """Get specific ligand information"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    return ligands_db[ligand_id]

# Docking endpoints
@app.post("/docking/jobs/")
async def create_docking_job(
    analysis_request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """Create a new docking job"""
    # Validate protein and ligand exist
    if analysis_request.protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    if analysis_request.ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    job_id = generate_job_id()
    
    # Create docking job
    job = DockingJob(
        job_id=job_id,
        protein_file=analysis_request.protein_id,
        ligand_file=analysis_request.ligand_id,
        parameters=analysis_request.parameters,
        status="pending",
        created_at=datetime.now()
    )
    
    docking_jobs[job_id] = job
    
    # Start background task for docking calculation
    background_tasks.add_task(run_docking_calculation, job_id)
    
    return {
        "job_id": job_id,
        "status": "created",
        "message": "Docking job created and queued for processing"
    }

async def run_docking_calculation(job_id: str):
    """Background task to run docking calculation"""
    try:
        job = docking_jobs[job_id]
        job.status = "running"
        
        # Perform docking calculation
        result = await simulate_docking_calculation(job)
        
        # Update job with results
        job.status = "completed"
        job.completed_at = datetime.now()
        job.results = result.model_dump()
        
    except Exception as e:
        job = docking_jobs[job_id]
        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.now()

@app.get("/docking/jobs/{job_id}")
async def get_docking_job(job_id: str):
    """Get docking job status and results"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    return docking_jobs[job_id]

@app.get("/docking/jobs/")
async def list_docking_jobs():
    """List all docking jobs"""
    return {
        "jobs": [
            {"id": k, **v.dict()} for k, v in docking_jobs.items()
        ]
    }

@app.delete("/docking/jobs/{job_id}")
async def delete_docking_job(job_id: str):
    """Delete a docking job"""
    if job_id not in docking_jobs:
        raise HTTPException(status_code=404, detail="Docking job not found")
    
    del docking_jobs[job_id]
    return {"message": "Docking job deleted successfully"}

# Analysis endpoints
@app.get("/analysis/protein-properties/{protein_id}")
async def analyze_protein_properties(protein_id: str):
    """Analyze protein properties"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    # Try to read PDB file if it exists
    pdb_file = upload_directory / f"{protein_id}.pdb"
    if pdb_file.exists():
        async with aiofiles.open(pdb_file, 'r') as f:
            pdb_content = await f.read()
        
        analysis = analyze_protein_structure(pdb_content)
        return {
            "protein_id": protein_id,
            "analysis": analysis
        }
    else:
        return {
            "protein_id": protein_id,
            "message": "PDB file not available for analysis"
        }

@app.get("/analysis/ligand-properties/{ligand_id}")
async def analyze_ligand_properties(ligand_id: str):
    """Analyze ligand properties"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    ligand = ligands_db[ligand_id]
    
    if ligand.smiles:
        properties = calculate_ligand_properties(ligand.smiles)
        return {
            "ligand_id": ligand_id,
            "properties": properties
        }
    else:
        return {
            "ligand_id": ligand_id,
            "message": "SMILES string not available for analysis"
        }

@app.get("/analysis/binding-site/{protein_id}")
async def predict_binding_site(protein_id: str):
    """Predict protein binding sites"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    # Mock binding site prediction
    binding_sites = [
        {
            "site_id": 1,
            "center": [10.5, 20.3, 15.7],
            "volume": 850.2,
            "druggability_score": 0.85,
            "residues": ["ARG123", "ASP456", "PHE789", "LYS234", "TRP567"]
        },
        {
            "site_id": 2,
            "center": [5.2, 15.8, 22.1],
            "volume": 650.7,
            "druggability_score": 0.72,
            "residues": ["SER345", "THR678", "LEU901", "VAL234"]
        }
    ]
    
    return {
        "protein_id": protein_id,
        "binding_sites": binding_sites,
        "predicted_at": datetime.now()
    }

# Default DENV protein data
@app.on_event("startup")
async def startup_event():
    """Initialize default protein and ligand data"""
    # Default DENV NS3 helicase protein
    default_protein = ProteinInfo(
        name="DENV2 NS3 Helicase",
        pdb_id="2BMF",
        molecular_weight=48500.0,
        resolution=2.4,
        organism="Dengue virus serotype 2",
        classification="Viral helicase"
    )
    proteins_db["denv_ns3_helicase"] = default_protein
    
    # Default ligand from research
    default_ligand = LigandInfo(
        name="Lead Compound",
        smiles="CCOc1ccc2c(c1)sc(n2)NC(=O)c3c(cnc(n3)SC)Br",
        molecular_formula="C15H13BrN4O2S2"
    )
    
    # Calculate properties for default ligand
    if default_ligand.smiles:
        properties = calculate_ligand_properties(default_ligand.smiles)
        if "error" not in properties:
            default_ligand.molecular_weight = properties.get("molecular_weight")
            default_ligand.logp = properties.get("logp")
            default_ligand.hbd = properties.get("hbd")
            default_ligand.hba = properties.get("hba")
            default_ligand.tpsa = properties.get("tpsa")
    
    ligands_db["default_ligand"] = default_ligand

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
