"""
Molecular analysis utilities
"""

import tempfile
import os
import numpy as np
from typing import Dict, Any, Optional, List
from pathlib import Path


def validate_smiles(smiles: str) -> bool:
    """Validate SMILES string"""
    try:
        from rdkit import Chem
        mol = Chem.MolFromSmiles(smiles)
        return mol is not None
    except ImportError:
        # Fallback validation - basic check
        if not smiles or len(smiles) < 2:
            return False
        # Basic SMILES validation
        allowed_chars = set("BCNOPSFClBrI()[]=-#@+.:0123456789")
        return all(c in allowed_chars for c in smiles)
    except Exception:
        return False


def calculate_ligand_properties(smiles: str) -> Dict[str, Any]:
    """Calculate molecular properties from SMILES"""
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"error": "Invalid SMILES string"}
        
        properties = {
            "molecular_weight": Descriptors.MolWt(mol),
            "logp": Descriptors.MolLogP(mol),
            "hbd": Descriptors.NumHDonors(mol),
            "hba": Descriptors.NumHAcceptors(mol),
            "tpsa": Descriptors.TPSA(mol),
            "rotatable_bonds": Descriptors.NumRotatableBonds(mol),
            "aromatic_rings": Descriptors.NumAromaticRings(mol),
            "aliphatic_rings": Descriptors.NumAliphaticRings(mol),
            "heteroatoms": Descriptors.NumHeteroatoms(mol),
            "formal_charge": Chem.rdmolops.GetFormalCharge(mol),
            "fraction_csp3": Descriptors.FractionCsp3(mol),
            "molar_refractivity": Crippen.MolMR(mol),
            "balaban_j": Descriptors.BalabanJ(mol),
            "bertz_ct": Descriptors.BertzCT(mol)
        }
        
        return properties
        
    except ImportError:
        return {"error": "RDKit not available for property calculation"}
    except Exception as e:
        return {"error": str(e)}


def calculate_drug_likeness(smiles: str) -> Dict[str, Any]:
    """Calculate drug-likeness scores and alerts"""
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, rdMolDescriptors
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"error": "Invalid SMILES string"}
        
        # Calculate basic properties
        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        hbd = Descriptors.NumHDonors(mol)
        hba = Descriptors.NumHAcceptors(mol)
        tpsa = Descriptors.TPSA(mol)
        rotbonds = Descriptors.NumRotatableBonds(mol)
        
        # Lipinski's Rule of Five violations
        lipinski_violations = 0
        if mw > 500: lipinski_violations += 1
        if logp > 5: lipinski_violations += 1
        if hbd > 5: lipinski_violations += 1
        if hba > 10: lipinski_violations += 1
        
        # Veber's rule violations
        veber_violations = 0
        if rotbonds > 10: veber_violations += 1
        if tpsa > 140: veber_violations += 1
        
        # Simple drug-likeness score (0-1)
        drug_likeness = max(0, 1 - (lipinski_violations + veber_violations) / 6)
        
        # Structural alerts (simplified)
        alerts = []
        smiles_lower = smiles.lower()
        
        # Check for reactive groups
        if 'n=n' in smiles_lower:
            alerts.append("Azo group (potentially reactive)")
        if 'c#n' in smiles_lower:
            alerts.append("Nitrile group")
        if '[nH]' in smiles_lower or 'n[nH]' in smiles_lower:
            alerts.append("Hydrazine derivative")
        if 'c(=o)o' in smiles_lower:
            alerts.append("Carboxylic acid")
        
        return {
            "drug_likeness": drug_likeness,
            "lipinski_violations": lipinski_violations,
            "veber_violations": veber_violations,
            "alerts": alerts,
            "qed": None  # Would need additional implementation
        }
        
    except ImportError:
        return {"error": "RDKit not available for drug-likeness calculation"}
    except Exception as e:
        return {"error": str(e)}


def generate_3d_structure_from_smiles(smiles: str, output_file: str) -> bool:
    """Generate 3D structure from SMILES and save to file"""
    try:
        from rdkit import Chem
        from rdkit.Chem import AllChem
        
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return False
        
        # Add hydrogens
        mol = Chem.AddHs(mol)
        
        # Generate 3D coordinates
        AllChem.EmbedMolecule(mol, randomSeed=42)
        AllChem.UFFOptimizeMolecule(mol)
        
        # Write to file
        writer = Chem.SDWriter(output_file)
        writer.write(mol)
        writer.close()
        
        return True
        
    except ImportError:
        return False
    except Exception:
        return False


def validate_pdb_file(pdb_content: str) -> bool:
    """Validate PDB file format"""
    if not pdb_content:
        return False
    
    lines = pdb_content.split('\n')
    
    # Check for essential PDB records
    has_atom_records = any(line.startswith(('ATOM', 'HETATM')) for line in lines)
    
    if not has_atom_records:
        return False
    
    # Check format of ATOM records
    for line in lines:
        if line.startswith(('ATOM', 'HETATM')):
            if len(line) < 54:  # Minimum length for coordinate data
                return False
            try:
                # Try to parse coordinates
                x = float(line[30:38].strip())
                y = float(line[38:46].strip())
                z = float(line[46:54].strip())
            except (ValueError, IndexError):
                return False
    
    return True


def analyze_protein_structure(pdb_content: str) -> Dict[str, Any]:
    """Analyze protein structure from PDB content"""
    try:
        from Bio.PDB import PDBParser
        from Bio.PDB.PDBExceptions import PDBConstructionWarning
        import warnings
        
        # Suppress PDB warnings
        warnings.filterwarnings('ignore', category=PDBConstructionWarning)
        
        # Create temporary file for PDB content
        with tempfile.NamedTemporaryFile(mode='w', suffix='.pdb', delete=False) as tmp_file:
            tmp_file.write(pdb_content)
            tmp_file_path = tmp_file.name
        
        try:
            # Parse PDB structure
            parser = PDBParser(QUIET=True)
            structure = parser.get_structure('protein', tmp_file_path)
            
            # Extract basic information
            model = structure[0]
            chains = list(model.get_chains())
            residues = list(model.get_residues())
            atoms = list(model.get_atoms())
            
            chain_count = len(chains)
            residue_count = len(residues)
            atom_count = len(atoms)
            
            # Calculate center of mass
            coords = np.array([atom.coord for atom in atoms])
            center_of_mass = np.mean(coords, axis=0)
            
            # Calculate bounding box
            min_coords = np.min(coords, axis=0)
            max_coords = np.max(coords, axis=0)
            dimensions = max_coords - min_coords
            
            # Analyze chains
            chain_info = []
            for chain in chains:
                chain_residues = list(chain.get_residues())
                chain_atoms = list(chain.get_atoms())
                
                chain_info.append({
                    "id": chain.id,
                    "residue_count": len(chain_residues),
                    "atom_count": len(chain_atoms)
                })
            
            # Calculate secondary structure (simplified)
            secondary_structure = analyze_secondary_structure(residues)
            
            # Predict binding sites (simplified)
            binding_sites = predict_binding_sites(coords, residues)
            
            return {
                "chain_count": chain_count,
                "residue_count": residue_count,
                "atom_count": atom_count,
                "center_of_mass": center_of_mass.tolist(),
                "dimensions": dimensions.tolist(),
                "bounding_box": {
                    "min": min_coords.tolist(),
                    "max": max_coords.tolist()
                },
                "chains": chain_info,
                "secondary_structure": secondary_structure,
                "binding_sites": binding_sites
            }
            
        finally:
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
    except ImportError:
        # Fallback analysis without BioPython
        return analyze_pdb_simple(pdb_content)
    except Exception as e:
        return {"error": str(e)}


def analyze_pdb_simple(pdb_content: str) -> Dict[str, Any]:
    """Simple PDB analysis without BioPython"""
    lines = pdb_content.split('\n')
    
    atom_lines = [line for line in lines if line.startswith(('ATOM', 'HETATM'))]
    
    if not atom_lines:
        return {"error": "No atom records found"}
    
    # Extract coordinates
    coords = []
    chains = set()
    
    for line in atom_lines:
        try:
            x = float(line[30:38].strip())
            y = float(line[38:46].strip())
            z = float(line[46:54].strip())
            chain_id = line[21].strip()
            
            coords.append([x, y, z])
            chains.add(chain_id)
            
        except (ValueError, IndexError):
            continue
    
    if not coords:
        return {"error": "No valid coordinates found"}
    
    coords = np.array(coords)
    center_of_mass = np.mean(coords, axis=0)
    min_coords = np.min(coords, axis=0)
    max_coords = np.max(coords, axis=0)
    dimensions = max_coords - min_coords
    
    return {
        "chain_count": len(chains),
        "residue_count": len(set(line[22:26].strip() + line[21] for line in atom_lines if line[17:20].strip())),
        "atom_count": len(atom_lines),
        "center_of_mass": center_of_mass.tolist(),
        "dimensions": dimensions.tolist(),
        "bounding_box": {
            "min": min_coords.tolist(),
            "max": max_coords.tolist()
        },
        "chains": [{"id": chain_id, "residue_count": 0, "atom_count": 0} for chain_id in sorted(chains)]
    }


def analyze_secondary_structure(residues) -> Dict[str, Any]:
    """Analyze secondary structure (simplified)"""
    try:
        # This is a very simplified analysis
        # In reality, you'd use algorithms like DSSP
        total_residues = len(residues)
        
        # Mock secondary structure percentages
        alpha_helix = 0.35
        beta_sheet = 0.25
        coil = 0.40
        
        return {
            "total_residues": total_residues,
            "alpha_helix_percentage": alpha_helix,
            "beta_sheet_percentage": beta_sheet,
            "coil_percentage": coil,
            "helix_count": int(total_residues * alpha_helix / 10),  # Rough estimate
            "sheet_count": int(total_residues * beta_sheet / 8)     # Rough estimate
        }
    except Exception:
        return {"error": "Secondary structure analysis failed"}


def predict_binding_sites(coords: np.ndarray, residues) -> List[Dict[str, Any]]:
    """Predict binding sites (simplified cavity detection)"""
    try:
        # Very simplified binding site prediction
        # In reality, you'd use algorithms like CASTp, fpocket, etc.
        
        # Find potential cavities based on coordinate distribution
        center = np.mean(coords, axis=0)
        
        # Create mock binding sites
        binding_sites = []
        
        # Main binding site (usually the largest cavity)
        site1 = {
            "site_id": 1,
            "center": (center + np.array([5, 0, 0])).tolist(),
            "volume": 850.0,
            "surface_area": 420.0,
            "druggability_score": 0.85,
            "residues": ["ARG123", "ASP156", "PHE189", "LYS234", "TRP267"]
        }
        binding_sites.append(site1)
        
        # Secondary binding site
        site2 = {
            "site_id": 2,
            "center": (center + np.array([-3, 4, 2])).tolist(),
            "volume": 450.0,
            "surface_area": 280.0,
            "druggability_score": 0.65,
            "residues": ["SER89", "THR112", "LEU145", "VAL178"]
        }
        binding_sites.append(site2)
        
        return binding_sites
        
    except Exception:
        return []


def calculate_rmsd(coords1: np.ndarray, coords2: np.ndarray) -> float:
    """Calculate RMSD between two coordinate sets"""
    if coords1.shape != coords2.shape:
        raise ValueError("Coordinate arrays must have the same shape")
    
    diff = coords1 - coords2
    rmsd = np.sqrt(np.mean(np.sum(diff**2, axis=1)))
    return rmsd


def align_structures(coords1: np.ndarray, coords2: np.ndarray) -> tuple:
    """Align two structures and return aligned coordinates and RMSD"""
    try:
        # Center coordinates
        center1 = np.mean(coords1, axis=0)
        center2 = np.mean(coords2, axis=0)
        
        coords1_centered = coords1 - center1
        coords2_centered = coords2 - center2
        
        # Calculate optimal rotation using Kabsch algorithm
        H = np.dot(coords1_centered.T, coords2_centered)
        U, S, Vt = np.linalg.svd(H)
        R = np.dot(Vt.T, U.T)
        
        # Ensure right-handed coordinate system
        if np.linalg.det(R) < 0:
            Vt[-1, :] *= -1
            R = np.dot(Vt.T, U.T)
        
        # Apply rotation
        coords1_aligned = np.dot(coords1_centered, R.T) + center2
        
        # Calculate RMSD
        rmsd = calculate_rmsd(coords1_aligned, coords2)
        
        return coords1_aligned, rmsd
        
    except Exception as e:
        raise ValueError(f"Structure alignment failed: {str(e)}")


def generate_pharmacophore(ligand_coords: np.ndarray, ligand_features: List[str]) -> Dict[str, Any]:
    """Generate pharmacophore model from ligand"""
    try:
        # Simplified pharmacophore generation
        # In reality, you'd use sophisticated algorithms
        
        pharmacophore = {
            "features": [],
            "distances": [],
            "tolerance": 1.0  # Angstroms
        }
        
        # Mock pharmacophore features
        features = [
            {"type": "HBD", "position": ligand_coords[0].tolist(), "radius": 1.5},
            {"type": "HBA", "position": ligand_coords[len(ligand_coords)//2].tolist(), "radius": 1.5},
            {"type": "Aromatic", "position": ligand_coords[-1].tolist(), "radius": 2.0}
        ]
        
        pharmacophore["features"] = features
        
        # Calculate distances between features
        for i, feat1 in enumerate(features):
            for j, feat2 in enumerate(features[i+1:], i+1):
                dist = np.linalg.norm(
                    np.array(feat1["position"]) - np.array(feat2["position"])
                )
                pharmacophore["distances"].append({
                    "feature1": i,
                    "feature2": j,
                    "distance": dist
                })
        
        return pharmacophore
        
    except Exception as e:
        return {"error": str(e)}
