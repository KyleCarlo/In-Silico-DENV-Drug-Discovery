"""
Database models for protein-ligand interaction system
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ProteinModel(BaseModel):
    """Protein data model"""
    id: Optional[str] = None
    name: str = Field(..., description="Protein name")
    pdb_id: Optional[str] = Field(None, description="PDB database ID")
    sequence: Optional[str] = Field(None, description="Amino acid sequence")
    molecular_weight: Optional[float] = Field(None, description="Molecular weight in Da")
    resolution: Optional[float] = Field(None, description="Crystal structure resolution in Å")
    organism: Optional[str] = Field(None, description="Source organism")
    classification: Optional[str] = Field(None, description="Protein classification")
    structure_file: Optional[str] = Field(None, description="Path to structure file")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class LigandModel(BaseModel):
    """Ligand data model"""
    id: Optional[str] = None
    name: str = Field(..., description="Ligand name")
    smiles: Optional[str] = Field(None, description="SMILES representation")
    inchi: Optional[str] = Field(None, description="InChI representation")
    molecular_formula: Optional[str] = Field(None, description="Molecular formula")
    molecular_weight: Optional[float] = Field(None, description="Molecular weight in Da")
    logp: Optional[float] = Field(None, description="Partition coefficient")
    hbd: Optional[int] = Field(None, description="Hydrogen bond donors")
    hba: Optional[int] = Field(None, description="Hydrogen bond acceptors")
    tpsa: Optional[float] = Field(None, description="Topological polar surface area")
    rotatable_bonds: Optional[int] = Field(None, description="Number of rotatable bonds")
    aromatic_rings: Optional[int] = Field(None, description="Number of aromatic rings")
    structure_file: Optional[str] = Field(None, description="Path to 3D structure file")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DockingParametersModel(BaseModel):
    """Molecular docking parameters model"""
    center_x: float = Field(0.0, description="Docking box center X coordinate")
    center_y: float = Field(0.0, description="Docking box center Y coordinate")
    center_z: float = Field(0.0, description="Docking box center Z coordinate")
    size_x: float = Field(20.0, ge=5.0, le=100.0, description="Docking box size X")
    size_y: float = Field(20.0, ge=5.0, le=100.0, description="Docking box size Y")
    size_z: float = Field(20.0, ge=5.0, le=100.0, description="Docking box size Z")
    exhaustiveness: int = Field(8, ge=1, le=32, description="Search exhaustiveness")
    num_modes: int = Field(9, ge=1, le=20, description="Number of binding modes")
    energy_range: float = Field(3.0, ge=1.0, le=10.0, description="Energy range")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")


class InteractionModel(BaseModel):
    """Molecular interaction model"""
    interaction_type: str = Field(..., description="Type of interaction")
    residue: str = Field(..., description="Interacting residue")
    distance: float = Field(..., description="Interaction distance in Å")
    angle: Optional[float] = Field(None, description="Interaction angle in degrees")
    strength: Optional[float] = Field(None, description="Interaction strength")


class DockingResultModel(BaseModel):
    """Docking result model"""
    mode: int = Field(..., description="Binding mode number")
    binding_affinity: float = Field(..., description="Binding affinity in kcal/mol")
    rmsd_lower_bound: float = Field(..., description="RMSD lower bound")
    rmsd_upper_bound: float = Field(..., description="RMSD upper bound")
    interactions: List[InteractionModel] = Field(default=[], description="Molecular interactions")
    pose_file: Optional[str] = Field(None, description="Path to pose structure file")


class DockingJobModel(BaseModel):
    """Docking job model"""
    id: str = Field(..., description="Unique job identifier")
    protein_id: str = Field(..., description="Protein identifier")
    ligand_id: str = Field(..., description="Ligand identifier")
    parameters: DockingParametersModel = Field(..., description="Docking parameters")
    status: JobStatus = Field(JobStatus.PENDING, description="Job status")
    progress: float = Field(0.0, ge=0.0, le=100.0, description="Job progress percentage")
    results: List[DockingResultModel] = Field(default=[], description="Docking results")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = Field(None, description="Job start time")
    completed_at: Optional[datetime] = Field(None, description="Job completion time")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AnalysisRequestModel(BaseModel):
    """Analysis request model"""
    protein_id: str = Field(..., description="Protein identifier")
    ligand_id: str = Field(..., description="Ligand identifier")
    parameters: DockingParametersModel = Field(default_factory=DockingParametersModel)
    job_name: Optional[str] = Field(None, description="Custom job name")
    priority: int = Field(1, ge=1, le=10, description="Job priority (1=low, 10=high)")


class BindingSiteModel(BaseModel):
    """Binding site prediction model"""
    site_id: int = Field(..., description="Binding site identifier")
    center: List[float] = Field(..., description="Binding site center coordinates [x, y, z]")
    volume: float = Field(..., description="Binding site volume in Å³")
    surface_area: Optional[float] = Field(None, description="Binding site surface area in Å²")
    druggability_score: float = Field(..., ge=0.0, le=1.0, description="Druggability score")
    residues: List[str] = Field(..., description="Binding site residues")
    properties: Dict[str, Any] = Field(default={}, description="Additional site properties")


class ProteinAnalysisModel(BaseModel):
    """Protein structure analysis model"""
    protein_id: str = Field(..., description="Protein identifier")
    chain_count: int = Field(..., description="Number of protein chains")
    residue_count: int = Field(..., description="Number of residues")
    atom_count: int = Field(..., description="Number of atoms")
    center_of_mass: List[float] = Field(..., description="Center of mass coordinates")
    dimensions: List[float] = Field(..., description="Protein dimensions [x, y, z]")
    bounding_box: Dict[str, List[float]] = Field(..., description="Bounding box coordinates")
    binding_sites: List[BindingSiteModel] = Field(default=[], description="Predicted binding sites")
    secondary_structure: Optional[Dict[str, Any]] = Field(None, description="Secondary structure analysis")


class LigandAnalysisModel(BaseModel):
    """Ligand analysis model"""
    ligand_id: str = Field(..., description="Ligand identifier")
    lipinski_violations: int = Field(..., description="Number of Lipinski rule violations")
    veber_violations: int = Field(..., description="Number of Veber rule violations")
    drug_likeness: float = Field(..., ge=0.0, le=1.0, description="Drug-likeness score")
    synthetic_accessibility: Optional[float] = Field(None, description="Synthetic accessibility score")
    alerts: List[str] = Field(default=[], description="Structural alerts")
    pharmacophore: Optional[Dict[str, Any]] = Field(None, description="Pharmacophore features")


class SystemStatusModel(BaseModel):
    """System status model"""
    status: str = Field(..., description="System status")
    version: str = Field(..., description="API version")
    uptime: float = Field(..., description="System uptime in seconds")
    active_jobs: int = Field(..., description="Number of active jobs")
    completed_jobs: int = Field(..., description="Number of completed jobs")
    failed_jobs: int = Field(..., description="Number of failed jobs")
    system_load: Optional[float] = Field(None, description="System load average")
    memory_usage: Optional[float] = Field(None, description="Memory usage percentage")
    disk_usage: Optional[float] = Field(None, description="Disk usage percentage")
