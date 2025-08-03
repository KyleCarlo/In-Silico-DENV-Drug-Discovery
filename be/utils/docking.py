"""
Molecular docking utilities
"""

import asyncio
import numpy as np
from typing import Dict, Any, List, Callable, Optional
from pathlib import Path
import tempfile
import os
from datetime import datetime

from ..models.database import (
    ProteinModel, 
    LigandModel, 
    DockingParametersModel, 
    DockingResultModel,
    InteractionModel
)


async def perform_molecular_docking(
    protein: ProteinModel,
    ligand: LigandModel,
    parameters: DockingParametersModel,
    progress_callback: Optional[Callable[[float], None]] = None
) -> List[DockingResultModel]:
    """Perform molecular docking simulation"""
    
    try:
        # Initialize progress
        if progress_callback:
            await progress_callback(0.0)
        
        # Step 1: Prepare structures (20% progress)
        await asyncio.sleep(1)  # Simulate preparation time
        if progress_callback:
            await progress_callback(20.0)
        
        # Step 2: Generate grid (40% progress)
        await asyncio.sleep(1)  # Simulate grid generation
        if progress_callback:
            await progress_callback(40.0)
        
        # Step 3: Perform docking search (80% progress)
        await asyncio.sleep(2)  # Simulate docking calculation
        if progress_callback:
            await progress_callback(80.0)
        
        # Step 4: Analyze results (100% progress)
        results = await simulate_docking_results(parameters)
        if progress_callback:
            await progress_callback(100.0)
        
        return results
        
    except Exception as e:
        raise Exception(f"Docking failed: {str(e)}")


async def simulate_docking_results(parameters: DockingParametersModel) -> List[DockingResultModel]:
    """Simulate docking results for demonstration"""
    
    results = []
    
    for mode in range(1, parameters.num_modes + 1):
        # Generate realistic binding affinity (kcal/mol)
        base_affinity = np.random.uniform(-12.0, -6.0)
        affinity_variation = np.random.normal(0, 0.5)
        binding_affinity = base_affinity + affinity_variation
        
        # Generate RMSD values
        rmsd_lb = np.random.uniform(0.0, 2.0)
        rmsd_ub = rmsd_lb + np.random.uniform(0.5, 3.0)
        
        # Generate molecular interactions
        interactions = generate_mock_interactions()
        
        result = DockingResultModel(
            mode=mode,
            binding_affinity=round(binding_affinity, 2),
            rmsd_lower_bound=round(rmsd_lb, 2),
            rmsd_upper_bound=round(rmsd_ub, 2),
            interactions=interactions
        )
        
        results.append(result)
    
    # Sort by binding affinity (most negative = best)
    results.sort(key=lambda x: x.binding_affinity)
    
    return results


def generate_mock_interactions() -> List[InteractionModel]:
    """Generate mock molecular interactions"""
    
    interaction_types = [
        "hydrogen_bond",
        "hydrophobic_contact", 
        "electrostatic",
        "van_der_waals",
        "pi_pi_stacking",
        "pi_cation"
    ]
    
    residues = [
        "ARG123", "ASP156", "PHE189", "LYS234", "TRP267",
        "SER89", "THR112", "LEU145", "VAL178", "GLU201",
        "HIS245", "TYR298", "CYS134", "MET167", "ILE223"
    ]
    
    interactions = []
    num_interactions = np.random.randint(3, 8)
    
    for _ in range(num_interactions):
        interaction_type = np.random.choice(interaction_types)
        residue = np.random.choice(residues)
        
        # Generate realistic distances based on interaction type
        if interaction_type == "hydrogen_bond":
            distance = np.random.uniform(1.8, 3.2)
            angle = np.random.uniform(120, 180)
        elif interaction_type == "hydrophobic_contact":
            distance = np.random.uniform(3.5, 5.0)
            angle = None
        elif interaction_type == "electrostatic":
            distance = np.random.uniform(2.5, 6.0)
            angle = None
        elif interaction_type == "pi_pi_stacking":
            distance = np.random.uniform(3.3, 4.5)
            angle = np.random.uniform(0, 30)
        else:
            distance = np.random.uniform(3.0, 5.5)
            angle = None
        
        # Calculate interaction strength (arbitrary units)
        strength = calculate_interaction_strength(interaction_type, distance)
        
        interaction = InteractionModel(
            interaction_type=interaction_type,
            residue=residue,
            distance=round(distance, 2),
            angle=round(angle, 1) if angle else None,
            strength=round(strength, 2)
        )
        
        interactions.append(interaction)
    
    return interactions


def calculate_interaction_strength(interaction_type: str, distance: float) -> float:
    """Calculate interaction strength based on type and distance"""
    
    # Simplified strength calculation
    strength_factors = {
        "hydrogen_bond": 5.0,
        "electrostatic": 4.0,
        "pi_pi_stacking": 3.0,
        "pi_cation": 3.5,
        "hydrophobic_contact": 2.0,
        "van_der_waals": 1.0
    }
    
    base_strength = strength_factors.get(interaction_type, 1.0)
    
    # Distance penalty (closer = stronger)
    distance_factor = 1.0 / (1.0 + distance * 0.5)
    
    return base_strength * distance_factor


def estimate_completion_time(parameters: DockingParametersModel) -> float:
    """Estimate docking completion time in seconds"""
    
    # Base time (seconds)
    base_time = 30
    
    # Factor in exhaustiveness
    exhaustiveness_factor = parameters.exhaustiveness / 8.0
    
    # Factor in number of modes
    modes_factor = parameters.num_modes / 9.0
    
    # Factor in box size
    box_volume = parameters.size_x * parameters.size_y * parameters.size_z
    volume_factor = box_volume / 8000.0  # Normalize to typical box size
    
    estimated_time = base_time * exhaustiveness_factor * modes_factor * volume_factor
    
    # Add some randomness
    variation = np.random.uniform(0.8, 1.2)
    
    return estimated_time * variation


async def prepare_protein_for_docking(protein: ProteinModel) -> bool:
    """Prepare protein structure for docking"""
    try:
        # This would typically involve:
        # 1. Adding hydrogen atoms
        # 2. Optimizing side chain conformations
        # 3. Converting to PDBQT format
        # 4. Defining binding site
        
        # Simulate preparation time
        await asyncio.sleep(2)
        
        return True
        
    except Exception:
        return False


async def prepare_ligand_for_docking(ligand: LigandModel) -> bool:
    """Prepare ligand structure for docking"""
    try:
        # This would typically involve:
        # 1. Generate 3D structure from SMILES
        # 2. Add hydrogen atoms
        # 3. Generate multiple conformers
        # 4. Convert to PDBQT format
        
        # Simulate preparation time
        await asyncio.sleep(1)
        
        return True
        
    except Exception:
        return False


def validate_docking_parameters(parameters: DockingParametersModel) -> Dict[str, Any]:
    """Validate docking parameters"""
    
    validation = {
        "valid": True,
        "errors": [],
        "warnings": []
    }
    
    # Check box size
    box_volume = parameters.size_x * parameters.size_y * parameters.size_z
    
    if box_volume < 1000:
        validation["warnings"].append(
            "Small search space may miss important binding sites"
        )
    elif box_volume > 50000:
        validation["warnings"].append(
            "Large search space will significantly increase computation time"
        )
    
    # Check exhaustiveness
    if parameters.exhaustiveness < 1:
        validation["errors"].append("Exhaustiveness must be at least 1")
        validation["valid"] = False
    elif parameters.exhaustiveness > 32:
        validation["warnings"].append(
            "Very high exhaustiveness may not improve results"
        )
    
    # Check number of modes
    if parameters.num_modes < 1:
        validation["errors"].append("Number of modes must be at least 1")
        validation["valid"] = False
    elif parameters.num_modes > 20:
        validation["warnings"].append(
            "Large number of modes may generate redundant results"
        )
    
    # Check energy range
    if parameters.energy_range < 1.0:
        validation["warnings"].append(
            "Small energy range may miss relevant binding modes"
        )
    elif parameters.energy_range > 10.0:
        validation["warnings"].append(
            "Large energy range may include poor binding modes"
        )
    
    return validation


def calculate_binding_efficiency(
    binding_affinity: float, 
    ligand_efficiency_metrics: Dict[str, float]
) -> Dict[str, float]:
    """Calculate binding efficiency metrics"""
    
    molecular_weight = ligand_efficiency_metrics.get("molecular_weight", 300.0)
    heavy_atoms = ligand_efficiency_metrics.get("heavy_atoms", 20)
    
    # Ligand Efficiency (LE)
    le = -binding_affinity / heavy_atoms if heavy_atoms > 0 else 0
    
    # Lipophilic Ligand Efficiency (LLE)
    logp = ligand_efficiency_metrics.get("logp", 2.0)
    lle = -binding_affinity - logp
    
    # Size-Independent Ligand Efficiency (SILE)
    sile = -binding_affinity / (molecular_weight ** 0.3) if molecular_weight > 0 else 0
    
    # Binding Efficiency Index (BEI)
    bei = -binding_affinity / molecular_weight * 1000 if molecular_weight > 0 else 0
    
    return {
        "ligand_efficiency": round(le, 3),
        "lipophilic_ligand_efficiency": round(lle, 3),
        "size_independent_ligand_efficiency": round(sile, 3),
        "binding_efficiency_index": round(bei, 3)
    }


def analyze_binding_site_similarity(
    site1_residues: List[str], 
    site2_residues: List[str]
) -> float:
    """Calculate similarity between binding sites"""
    
    set1 = set(site1_residues)
    set2 = set(site2_residues)
    
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    # Jaccard similarity
    similarity = intersection / union if union > 0 else 0.0
    
    return similarity


def generate_pharmacophore_from_poses(poses: List[DockingResultModel]) -> Dict[str, Any]:
    """Generate pharmacophore model from docking poses"""
    
    # This is a simplified implementation
    # In reality, you'd analyze common interaction patterns
    
    common_interactions = {}
    total_poses = len(poses)
    
    # Count interaction types across poses
    for pose in poses:
        for interaction in pose.interactions:
            interaction_type = interaction.interaction_type
            if interaction_type not in common_interactions:
                common_interactions[interaction_type] = 0
            common_interactions[interaction_type] += 1
    
    # Identify pharmacophore features (>50% occurrence)
    pharmacophore_features = []
    for interaction_type, count in common_interactions.items():
        if count / total_poses > 0.5:
            pharmacophore_features.append({
                "type": interaction_type,
                "frequency": count / total_poses,
                "importance": "high" if count / total_poses > 0.8 else "medium"
            })
    
    return {
        "features": pharmacophore_features,
        "total_poses_analyzed": total_poses,
        "consensus_threshold": 0.5
    }


async def cluster_docking_poses(
    poses: List[DockingResultModel], 
    rmsd_threshold: float = 2.0
) -> List[List[int]]:
    """Cluster docking poses by RMSD similarity"""
    
    # Simplified clustering based on RMSD values
    # In reality, you'd use actual 3D coordinates
    
    clusters = []
    assigned = set()
    
    for i, pose1 in enumerate(poses):
        if i in assigned:
            continue
        
        cluster = [i]
        assigned.add(i)
        
        for j, pose2 in enumerate(poses[i+1:], i+1):
            if j in assigned:
                continue
            
            # Use RMSD lower bound as similarity metric
            rmsd_diff = abs(pose1.rmsd_lower_bound - pose2.rmsd_lower_bound)
            
            if rmsd_diff < rmsd_threshold:
                cluster.append(j)
                assigned.add(j)
        
        clusters.append(cluster)
    
    return clusters


def calculate_drug_score(
    binding_affinity: float,
    ligand_properties: Dict[str, float],
    interactions: List[InteractionModel]
) -> Dict[str, float]:
    """Calculate composite drug score"""
    
    # Binding affinity score (0-1, higher is better)
    affinity_score = max(0, min(1, (-binding_affinity - 6) / 6))
    
    # Drug-likeness score based on Lipinski's rule
    mw = ligand_properties.get("molecular_weight", 300)
    logp = ligand_properties.get("logp", 2)
    hbd = ligand_properties.get("hbd", 2)
    hba = ligand_properties.get("hba", 4)
    
    lipinski_violations = 0
    if mw > 500: lipinski_violations += 1
    if logp > 5: lipinski_violations += 1
    if hbd > 5: lipinski_violations += 1
    if hba > 10: lipinski_violations += 1
    
    druglike_score = max(0, (4 - lipinski_violations) / 4)
    
    # Interaction quality score
    favorable_interactions = ["hydrogen_bond", "electrostatic", "pi_pi_stacking"]
    quality_interactions = sum(1 for i in interactions if i.interaction_type in favorable_interactions)
    interaction_score = min(1, quality_interactions / 5)
    
    # Composite score (weighted average)
    composite_score = (
        0.4 * affinity_score + 
        0.3 * druglike_score + 
        0.3 * interaction_score
    )
    
    return {
        "composite_score": round(composite_score, 3),
        "affinity_score": round(affinity_score, 3),
        "druglike_score": round(druglike_score, 3),
        "interaction_score": round(interaction_score, 3)
    }
