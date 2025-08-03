"""
Ligand management API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
import aiofiles
import uuid
from pathlib import Path

from ..models.database import LigandModel, LigandAnalysisModel
from ..utils.molecular import (
    calculate_ligand_properties, 
    generate_3d_structure_from_smiles,
    validate_smiles,
    calculate_drug_likeness
)
from ..core.config import get_settings

router = APIRouter(prefix="/ligands", tags=["ligands"])
settings = get_settings()

# In-memory storage (replace with proper database)
ligands_db = {}


@router.post("/", response_model=LigandModel)
async def create_ligand(ligand: LigandModel):
    """Create a new ligand entry"""
    ligand_id = f"ligand_{uuid.uuid4().hex[:8]}"
    ligand.id = ligand_id
    
    # Calculate properties if SMILES provided
    if ligand.smiles:
        if not validate_smiles(ligand.smiles):
            raise HTTPException(status_code=400, detail="Invalid SMILES string")
        
        properties = calculate_ligand_properties(ligand.smiles)
        if "error" not in properties:
            ligand.molecular_weight = properties.get("molecular_weight")
            ligand.logp = properties.get("logp")
            ligand.hbd = properties.get("hbd")
            ligand.hba = properties.get("hba")
            ligand.tpsa = properties.get("tpsa")
            ligand.rotatable_bonds = properties.get("rotatable_bonds")
            ligand.aromatic_rings = properties.get("aromatic_rings")
    
    ligands_db[ligand_id] = ligand
    return ligand


@router.post("/from-smiles/")
async def create_ligand_from_smiles(
    smiles: str, 
    name: str = "Generated Ligand",
    generate_3d: bool = True
):
    """Create ligand from SMILES string"""
    if not validate_smiles(smiles):
        raise HTTPException(status_code=400, detail="Invalid SMILES string")
    
    properties = calculate_ligand_properties(smiles)
    
    if "error" in properties:
        raise HTTPException(status_code=400, detail=f"SMILES processing error: {properties['error']}")
    
    ligand_id = f"ligand_{uuid.uuid4().hex[:8]}"
    
    # Generate 3D structure if requested
    structure_file = None
    if generate_3d:
        try:
            upload_dir = Path(settings.upload_directory)
            upload_dir.mkdir(exist_ok=True)
            
            structure_file_path = upload_dir / f"{ligand_id}.sdf"
            success = generate_3d_structure_from_smiles(smiles, str(structure_file_path))
            
            if success:
                structure_file = str(structure_file_path)
        except Exception as e:
            print(f"Warning: Could not generate 3D structure: {e}")
    
    ligand = LigandModel(
        id=ligand_id,
        name=name,
        smiles=smiles,
        molecular_weight=properties.get("molecular_weight"),
        logp=properties.get("logp"),
        hbd=properties.get("hbd"),
        hba=properties.get("hba"),
        tpsa=properties.get("tpsa"),
        rotatable_bonds=properties.get("rotatable_bonds"),
        aromatic_rings=properties.get("aromatic_rings"),
        structure_file=structure_file
    )
    
    ligands_db[ligand_id] = ligand
    
    return {
        "ligand_id": ligand_id,
        "ligand": ligand,
        "properties": properties,
        "structure_generated": structure_file is not None,
        "message": "Ligand created successfully"
    }


@router.post("/upload/")
async def upload_ligand_file(
    file: UploadFile = File(...),
    name: Optional[str] = None
):
    """Upload ligand structure file (SDF, MOL, etc.)"""
    allowed_extensions = ('.sdf', '.mol', '.mol2', '.pdb')
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=400, 
            detail=f"Only {', '.join(allowed_extensions)} files are allowed"
        )
    
    ligand_id = f"ligand_{uuid.uuid4().hex[:8]}"
    
    # Create upload directory
    upload_dir = Path(settings.upload_directory)
    upload_dir.mkdir(exist_ok=True)
    
    # Save uploaded file
    file_extension = Path(file.filename).suffix.lower()
    file_path = upload_dir / f"{ligand_id}{file_extension}"
    
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Create ligand entry
        ligand_name = name or file.filename
        ligand = LigandModel(
            id=ligand_id,
            name=ligand_name,
            structure_file=str(file_path)
        )
        
        ligands_db[ligand_id] = ligand
        
        return {
            "ligand_id": ligand_id,
            "filename": file.filename,
            "size": len(content),
            "message": "Ligand uploaded successfully"
        }
        
    except Exception as e:
        # Clean up file on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/", response_model=List[LigandModel])
async def list_ligands():
    """List all ligands"""
    return list(ligands_db.values())


@router.get("/{ligand_id}", response_model=LigandModel)
async def get_ligand(ligand_id: str):
    """Get specific ligand information"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    return ligands_db[ligand_id]


@router.put("/{ligand_id}", response_model=LigandModel)
async def update_ligand(ligand_id: str, ligand_update: LigandModel):
    """Update ligand information"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    # Update ligand while preserving ID and timestamps
    existing_ligand = ligands_db[ligand_id]
    ligand_update.id = ligand_id
    ligand_update.created_at = existing_ligand.created_at
    
    ligands_db[ligand_id] = ligand_update
    return ligand_update


@router.delete("/{ligand_id}")
async def delete_ligand(ligand_id: str):
    """Delete a ligand"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    ligand = ligands_db[ligand_id]
    
    # Delete associated files
    if ligand.structure_file:
        file_path = Path(ligand.structure_file)
        if file_path.exists():
            file_path.unlink()
    
    del ligands_db[ligand_id]
    return {"message": "Ligand deleted successfully"}


@router.get("/{ligand_id}/download")
async def download_ligand_file(ligand_id: str):
    """Download ligand structure file"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    ligand = ligands_db[ligand_id]
    if not ligand.structure_file:
        raise HTTPException(status_code=404, detail="No structure file available")
    
    file_path = Path(ligand.structure_file)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Structure file not found")
    
    return FileResponse(
        path=file_path,
        filename=f"{ligand.name}{file_path.suffix}",
        media_type="chemical/x-mdl-sdfile"
    )


@router.get("/{ligand_id}/analyze", response_model=LigandAnalysisModel)
async def analyze_ligand(ligand_id: str):
    """Analyze ligand properties"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    ligand = ligands_db[ligand_id]
    
    if not ligand.smiles:
        raise HTTPException(status_code=400, detail="SMILES string required for analysis")
    
    try:
        # Calculate drug-likeness and violations
        drug_likeness = calculate_drug_likeness(ligand.smiles)
        
        # Count Lipinski violations
        lipinski_violations = 0
        if ligand.molecular_weight and ligand.molecular_weight > 500:
            lipinski_violations += 1
        if ligand.logp and ligand.logp > 5:
            lipinski_violations += 1
        if ligand.hbd and ligand.hbd > 5:
            lipinski_violations += 1
        if ligand.hba and ligand.hba > 10:
            lipinski_violations += 1
        
        # Count Veber violations
        veber_violations = 0
        if ligand.rotatable_bonds and ligand.rotatable_bonds > 10:
            veber_violations += 1
        if ligand.tpsa and ligand.tpsa > 140:
            veber_violations += 1
        
        return LigandAnalysisModel(
            ligand_id=ligand_id,
            lipinski_violations=lipinski_violations,
            veber_violations=veber_violations,
            drug_likeness=drug_likeness.get("drug_likeness", 0.5),
            synthetic_accessibility=drug_likeness.get("synthetic_accessibility"),
            alerts=drug_likeness.get("alerts", [])
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/{ligand_id}/image")
async def get_ligand_image(ligand_id: str, format: str = "png", size: int = 300):
    """Generate 2D image of ligand structure"""
    if ligand_id not in ligands_db:
        raise HTTPException(status_code=404, detail="Ligand not found")
    
    ligand = ligands_db[ligand_id]
    
    if not ligand.smiles:
        raise HTTPException(status_code=400, detail="SMILES string required for image generation")
    
    try:
        from rdkit import Chem
        from rdkit.Chem import Draw
        from io import BytesIO
        
        mol = Chem.MolFromSmiles(ligand.smiles)
        if mol is None:
            raise HTTPException(status_code=400, detail="Invalid SMILES string")
        
        # Generate image
        img = Draw.MolToImage(mol, size=(size, size))
        
        # Convert to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format=format.upper())
        img_bytes.seek(0)
        
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            BytesIO(img_bytes.getvalue()),
            media_type=f"image/{format.lower()}"
        )
        
    except ImportError:
        raise HTTPException(status_code=500, detail="RDKit not available for image generation")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
