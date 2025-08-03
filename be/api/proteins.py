"""
Protein management API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import FileResponse
import aiofiles
import uuid
from pathlib import Path

from ..models.database import ProteinModel, ProteinAnalysisModel
from ..utils.molecular import analyze_protein_structure, validate_pdb_file
from ..core.config import get_settings

router = APIRouter(prefix="/proteins", tags=["proteins"])
settings = get_settings()

# In-memory storage (replace with proper database)
proteins_db = {}


@router.post("/", response_model=ProteinModel)
async def create_protein(protein: ProteinModel):
    """Create a new protein entry"""
    protein_id = f"protein_{uuid.uuid4().hex[:8]}"
    protein.id = protein_id
    proteins_db[protein_id] = protein
    return protein


@router.post("/upload/")
async def upload_protein_file(
    file: UploadFile = File(...),
    name: Optional[str] = None
):
    """Upload protein PDB file"""
    if not file.filename.lower().endswith(('.pdb', '.pdb')):
        raise HTTPException(status_code=400, detail="Only PDB files are allowed")
    
    # Generate unique protein ID
    protein_id = f"protein_{uuid.uuid4().hex[:8]}"
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.upload_directory)
    upload_dir.mkdir(exist_ok=True)
    
    # Save uploaded file
    file_path = upload_dir / f"{protein_id}.pdb"
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Validate PDB file
        pdb_content = content.decode('utf-8')
        if not validate_pdb_file(pdb_content):
            file_path.unlink()  # Delete invalid file
            raise HTTPException(status_code=400, detail="Invalid PDB file format")
        
        # Analyze protein structure
        analysis = analyze_protein_structure(pdb_content)
        
        # Create protein entry
        protein_name = name or file.filename
        protein = ProteinModel(
            id=protein_id,
            name=protein_name,
            structure_file=str(file_path),
            classification="Uploaded protein"
        )
        
        proteins_db[protein_id] = protein
        
        return {
            "protein_id": protein_id,
            "filename": file.filename,
            "size": len(content),
            "analysis": analysis,
            "message": "Protein uploaded and analyzed successfully"
        }
        
    except Exception as e:
        # Clean up file on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=List[ProteinModel])
async def list_proteins():
    """List all proteins"""
    return list(proteins_db.values())


@router.get("/{protein_id}", response_model=ProteinModel)
async def get_protein(protein_id: str):
    """Get specific protein information"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    return proteins_db[protein_id]


@router.put("/{protein_id}", response_model=ProteinModel)
async def update_protein(protein_id: str, protein_update: ProteinModel):
    """Update protein information"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    # Update protein while preserving ID and timestamps
    existing_protein = proteins_db[protein_id]
    protein_update.id = protein_id
    protein_update.created_at = existing_protein.created_at
    
    proteins_db[protein_id] = protein_update
    return protein_update


@router.delete("/{protein_id}")
async def delete_protein(protein_id: str):
    """Delete a protein"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    protein = proteins_db[protein_id]
    
    # Delete associated files
    if protein.structure_file:
        file_path = Path(protein.structure_file)
        if file_path.exists():
            file_path.unlink()
    
    del proteins_db[protein_id]
    return {"message": "Protein deleted successfully"}


@router.get("/{protein_id}/download")
async def download_protein_file(protein_id: str):
    """Download protein PDB file"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    protein = proteins_db[protein_id]
    if not protein.structure_file:
        raise HTTPException(status_code=404, detail="No structure file available")
    
    file_path = Path(protein.structure_file)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Structure file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{protein.name}.pdb",
        media_type="chemical/x-pdb"
    )


@router.get("/{protein_id}/analyze", response_model=ProteinAnalysisModel)
async def analyze_protein(protein_id: str):
    """Analyze protein structure"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    protein = proteins_db[protein_id]
    
    if not protein.structure_file:
        raise HTTPException(status_code=400, detail="No structure file available for analysis")
    
    file_path = Path(protein.structure_file)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Structure file not found")
    
    try:
        async with aiofiles.open(file_path, 'r') as f:
            pdb_content = await f.read()
        
        analysis = analyze_protein_structure(pdb_content)
        
        return ProteinAnalysisModel(
            protein_id=protein_id,
            **analysis
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/{protein_id}/prepare")
async def prepare_protein_for_docking(protein_id: str):
    """Prepare protein for molecular docking"""
    if protein_id not in proteins_db:
        raise HTTPException(status_code=404, detail="Protein not found")
    
    # This would typically involve:
    # - Adding hydrogen atoms
    # - Optimizing structure
    # - Converting to docking format (PDBQT)
    
    return {
        "protein_id": protein_id,
        "status": "prepared",
        "message": "Protein prepared for docking (simulation)"
    }
