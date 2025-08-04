/**
 * React hooks for QuantumDock API integration - SIMULATED VERSION
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  ProteinInfo, 
  LigandInfo, 
  DockingJob, 
  AnalysisRequest,
  DockingParameters 
} from '@/lib/api';

// Simulated delay function
const simulateDelay = (min: number = 500, max: number = 2000): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock data
const mockProteins: ProteinInfo[] = [
  {
    id: "protein_001",
    name: "DENV NS3 Protease",
    pdb_id: "2BMF",
    sequence: "MNNQRKKARNTPFNMLKRERNRVISTDSSGGRLKKNLYGTDTGPLTKADYKSFEEPDDKSFGDSYEAIVAGIAGGPSAPLWDQTKNALIGQVKMWAQCCLLLFAATGALIDGRVHPSAASRP",
    molecular_weight: 18500.2,
    resolution: 1.95,
    organism: "Dengue virus",
    classification: "Hydrolase",
    structure_file: "2bmf.pdb",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
];

const mockLigands: LigandInfo[] = [
  {
    id: "ligand_001",
    name: "Compound-X1",
    smiles: "CCCSc1ncc(c(n1)C(=O)Nc2nc3ccc(cc3s2)OC)Cl",
    inchi: "InChI=1S/C18H17ClN4O2S2/c1-3-7-26-16-10-20-9-12(19)15(16)17(24)23-18-21-11-5-4-6-13(25-2)14(11)27-18/h4-6,9-10H,3,7H2,1-2H3,(H,21,23,24)",
    molecular_formula: "C18H17ClN4O2S2",
    molecular_weight: 420.94,
    logp: 3.45,
    hbd: 1,
    hba: 6,
    tpsa: 89.32,
    rotatable_bonds: 5,
    aromatic_rings: 3,
    structure_file: "compound_x1.mol",
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z"
  },
];

const mockJobs: DockingJob[] = [];
let jobCounter = 1;

// Generic API hook with simulation
export function useAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await simulateDelay(300, 1000);
      
      const result = await apiCall();
      
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error };
}

// Proteins hook with simulation
export function useProteins() {
  const [proteins, setProteins] = useState<ProteinInfo[]>([]);
  const { execute, isLoading, error } = useAPI();

  const loadProteins = useCallback(async () => {
    const result = await execute(async () => {
      await simulateDelay(500, 1500);
      return { proteins: [...mockProteins] };
    });
    if (result && result.proteins) {
      setProteins(result.proteins);
    }
  }, [execute]);

  const uploadProtein = useCallback(async (file: File, name?: string) => {
    const result = await execute(
      async () => {
        await simulateDelay(2000, 4000); // Longer delay for file upload
        const newProtein: ProteinInfo = {
          id: `protein_${Date.now()}`,
          name: name || file.name.replace(/\.[^/.]+$/, ""),
          pdb_id: `USR${Math.floor(Math.random() * 1000)}`,
          molecular_weight: Math.floor(Math.random() * 50000) + 10000,
          resolution: Math.round((Math.random() * 2 + 1) * 100) / 100,
          organism: "User uploaded",
          classification: "Unknown",
          structure_file: file.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockProteins.push(newProtein);
        return newProtein;
      },
      'Protein uploaded successfully'
    );
    
    if (result) {
      await loadProteins(); // Refresh list
    }
    
    return result;
  }, [execute, loadProteins]);

  const analyzeProtein = useCallback(async (proteinId: string) => {
    return execute(async () => {
      await simulateDelay(3000, 6000);
      return {
        binding_sites: [
          { residue: "ASP189", coordinates: [-2.68, 23.88, 39.77], confidence: 0.95 },
          { residue: "SER135", coordinates: [-1.2, 25.1, 41.3], confidence: 0.88 }
        ],
        druggability_score: 0.92
      };
    });
  }, [execute]);

  const deleteProtein = useCallback(async (proteinId: string) => {
    const result = await execute(
      async () => {
        await simulateDelay(500, 1000);
        const index = mockProteins.findIndex(p => p.id === proteinId);
        if (index > -1) {
          mockProteins.splice(index, 1);
        }
        return { success: true };
      },
      'Protein deleted successfully'
    );
    
    if (result) {
      await loadProteins(); // Refresh list
    }
    
    return result;
  }, [execute, loadProteins]);

  useEffect(() => {
    loadProteins();
  }, [loadProteins]);

  return {
    proteins,
    uploadProtein,
    analyzeProtein,
    deleteProtein,
    refreshProteins: loadProteins,
    isLoading,
    error,
  };
}

// Ligands hook with simulation
export function useLigands() {
  const [ligands, setLigands] = useState<LigandInfo[]>([]);
  const { execute, isLoading, error } = useAPI();

  const loadLigands = useCallback(async () => {
    const result = await execute(async () => {
      await simulateDelay(500, 1500);
      return { ligands: [...mockLigands] };
    });
    if (result && result.ligands) {
      setLigands(result.ligands);
    }
  }, [execute]);

  const createLigandFromSmiles = useCallback(async (
    smiles: string, 
    name: string = 'Generated Ligand'
  ) => {
    const result = await execute(
      async () => {
        await simulateDelay(2000, 3500); // Longer delay for SMILES processing
        const newLigand: LigandInfo = {
          id: `ligand_${Date.now()}`,
          name,
          smiles,
          molecular_formula: `C${Math.floor(Math.random() * 20 + 10)}H${Math.floor(Math.random() * 30 + 15)}N${Math.floor(Math.random() * 5)}O${Math.floor(Math.random() * 5)}`,
          molecular_weight: Math.round((Math.random() * 400 + 200) * 100) / 100,
          logp: Math.round((Math.random() * 6 - 1) * 100) / 100,
          hbd: Math.floor(Math.random() * 5),
          hba: Math.floor(Math.random() * 8),
          tpsa: Math.round((Math.random() * 150 + 20) * 100) / 100,
          rotatable_bonds: Math.floor(Math.random() * 10),
          aromatic_rings: Math.floor(Math.random() * 4),
          structure_file: `${name.toLowerCase().replace(/\s+/g, '_')}.mol`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockLigands.push(newLigand);
        return { ligand_id: newLigand.id, ...newLigand };
      },
      'Ligand created successfully'
    );
    
    if (result) {
      await loadLigands(); // Refresh list
    }
    
    return result;
  }, [execute, loadLigands]);

  const uploadLigand = useCallback(async (file: File, name?: string) => {
    const result = await execute(
      async () => {
        await simulateDelay(1500, 3000); // File upload delay
        const newLigand: LigandInfo = {
          id: `ligand_${Date.now()}`,
          name: name || file.name.replace(/\.[^/.]+$/, ""),
          molecular_formula: `C${Math.floor(Math.random() * 20 + 10)}H${Math.floor(Math.random() * 30 + 15)}N${Math.floor(Math.random() * 5)}O${Math.floor(Math.random() * 5)}`,
          molecular_weight: Math.round((Math.random() * 400 + 200) * 100) / 100,
          logp: Math.round((Math.random() * 6 - 1) * 100) / 100,
          hbd: Math.floor(Math.random() * 5),
          hba: Math.floor(Math.random() * 8),
          tpsa: Math.round((Math.random() * 150 + 20) * 100) / 100,
          rotatable_bonds: Math.floor(Math.random() * 10),
          aromatic_rings: Math.floor(Math.random() * 4),
          structure_file: file.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockLigands.push(newLigand);
        return newLigand;
      },
      'Ligand uploaded successfully'
    );
    
    if (result) {
      await loadLigands(); // Refresh list
    }
    
    return result;
  }, [execute, loadLigands]);

  const analyzeLigand = useCallback(async (ligandId: string) => {
    return execute(async () => {
      await simulateDelay(2000, 4000);
      return {
        properties: {
          lipinski_violations: Math.floor(Math.random() * 2),
          drug_like: Math.random() > 0.3,
          synthetic_accessibility: Math.round(Math.random() * 10 * 100) / 100
        }
      };
    });
  }, [execute]);

  const getLigandImage = useCallback(async (ligandId: string) => {
    return execute(async () => {
      await simulateDelay(1000, 2000);
      return {
        image_url: `/api/ligands/${ligandId}/image`,
        image_data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      };
    });
  }, [execute]);

  useEffect(() => {
    loadLigands();
  }, [loadLigands]);

  return {
    ligands,
    createLigandFromSmiles,
    uploadLigand,
    analyzeLigand,
    getLigandImage,
    refreshLigands: loadLigands,
    isLoading,
    error,
  };
}

// Docking jobs hook with comprehensive simulation
export function useDocking() {
  const [jobs, setJobs] = useState<DockingJob[]>([]);
  const [activeJob, setActiveJob] = useState<DockingJob | null>(null);
  const { execute, isLoading, error } = useAPI();

  const loadJobs = useCallback(async (status?: string) => {
    const result = await execute(async () => {
      await simulateDelay(300, 800);
      let filteredJobs = [...mockJobs];
      if (status) {
        filteredJobs = mockJobs.filter(job => job.status === status);
      }
      return { jobs: filteredJobs };
    });
    if (result && result.jobs) {
      setJobs(result.jobs);
    }
  }, [execute]);

  const createDockingJob = useCallback(async (request: AnalysisRequest) => {
    const result = await execute(
      async () => {
        await simulateDelay(1000, 2000);
        const jobId = `job_${Date.now()}_${jobCounter++}`;
        const newJob: DockingJob = {
          job_id: jobId,
          id: jobId,
          protein_id: request.protein_id,
          ligand_id: request.ligand_id,
          parameters: request.parameters,
          status: 'pending',
          progress: 0,
          created_at: new Date().toISOString(),
        };
        mockJobs.push(newJob);
        return newJob;
      },
      'Docking job created successfully'
    );
    
    if (result) {
      setActiveJob(result);
      await loadJobs(); // Refresh list
    }
    
    return result;
  }, [execute, loadJobs]);

  const cancelJob = useCallback(async (jobId: string) => {
    const result = await execute(
      async () => {
        await simulateDelay(500, 1000);
        const job = mockJobs.find(j => j.job_id === jobId);
        if (job) {
          job.status = 'cancelled';
        }
        return { success: true };
      },
      'Job cancelled successfully'
    );
    
    if (result) {
      await loadJobs(); // Refresh list
    }
    
    return result;
  }, [execute, loadJobs]);

  const deleteJob = useCallback(async (jobId: string) => {
    const result = await execute(
      async () => {
        await simulateDelay(500, 1000);
        const index = mockJobs.findIndex(j => j.job_id === jobId);
        if (index > -1) {
          mockJobs.splice(index, 1);
        }
        return { success: true };
      },
      'Job deleted successfully'
    );
    
    if (result) {
      await loadJobs(); // Refresh list
      if (activeJob?.id === jobId) {
        setActiveJob(null);
      }
    }
    
    return result;
  }, [execute, loadJobs, activeJob]);

  const getJobResults = useCallback(async (jobId: string) => {
    return execute(async () => {
      await simulateDelay(1000, 2000);
      return {
        poses: [
          {
            mode: 0,
            binding_affinity: -8.2,
            rmsd_lower_bound: 0.0,
            rmsd_upper_bound: 2.1,
            interactions: [
              { interaction_type: "hydrogen_bond", residue: "ASP189", distance: 2.8, strength: 0.92 },
              { interaction_type: "hydrophobic", residue: "PHE130", distance: 3.5, strength: 0.78 }
            ]
          },
          {
            mode: 1,
            binding_affinity: -7.9,
            rmsd_lower_bound: 1.2,
            rmsd_upper_bound: 2.8,
            interactions: [
              { interaction_type: "hydrogen_bond", residue: "SER135", distance: 3.1, strength: 0.85 }
            ]
          }
        ],
        analysis: {
          best_pose: 0,
          confidence: 0.94,
          drug_likeness: 0.88
        }
      };
    });
  }, [execute]);

  const downloadResults = useCallback(async (jobId: string, fileType: string) => {
    return execute(async () => {
      await simulateDelay(2000, 4000);
      return {
        download_url: `/api/jobs/${jobId}/results/${fileType}`,
        filename: `results_${jobId}.${fileType}`
      };
    });
  }, [execute]);

  // Simulate job progress polling
  const pollJobStatus = useCallback(async (jobId: string) => {
    const job = mockJobs.find(j => j.job_id === jobId);
    if (!job) return;

    // Start the job if it's pending
    if (job.status === 'pending') {
      job.status = 'running';
      job.started_at = new Date().toISOString();
      setActiveJob({ ...job });
    }

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const currentJob = mockJobs.find(j => j.job_id === jobId);
      if (!currentJob || currentJob.status !== 'running') {
        clearInterval(progressInterval);
        return;
      }

      // Increment progress and round 2
      currentJob.progress = Math.round(Math.min(currentJob.progress + Math.random() * 50, 99) * 100) / 100;
      
      // Complete the job when progress reaches ~90%
      if (currentJob.progress >= 90) {
        currentJob.progress = 100;
        currentJob.status = 'completed';
        currentJob.completed_at = new Date().toISOString();
        currentJob.results = [
          {
            mode: 0,
            binding_affinity: -8.2,
            rmsd_lower_bound: 0.0,
            rmsd_upper_bound: 2.1,
            interactions: [
              { interaction_type: "hydrogen_bond", residue: "ASP189", distance: 2.8, strength: 0.92 },
              { interaction_type: "hydrophobic", residue: "PHE130", distance: 3.5, strength: 0.78 }
            ]
          }
        ];
        clearInterval(progressInterval);
      }

      setActiveJob({ ...currentJob });
      setJobs(prevJobs => 
        prevJobs.map(j => j.job_id === jobId ? { ...currentJob } : j)
      );
    }, 1000);

    // Cleanup after 30 seconds maximum
    setTimeout(() => {
      clearInterval(progressInterval);
    }, 30000);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    activeJob,
    createDockingJob,
    cancelJob,
    deleteJob,
    getJobResults,
    downloadResults,
    pollJobStatus,
    refreshJobs: loadJobs,
    setActiveJob,
    isLoading,
    error,
  };
}

// Analysis hook for protein and ligand analysis with simulation
export function useAnalysis() {
  const { execute, isLoading, error } = useAPI();

  const predictBindingSite = useCallback(async (proteinId: string) => {
    return execute(async () => {
      await simulateDelay(3000, 5000);
      return {
        binding_sites: [
          {
            id: 1,
            center: { x: -2.68, y: 23.88, z: 39.77 },
            volume: 234.5,
            druggability_score: 0.92,
            residues: ["ASP189", "SER135", "PHE130", "GLY133", "ASN167"]
          },
          {
            id: 2,
            center: { x: 5.12, y: 18.45, z: 35.23 },
            volume: 156.3,
            druggability_score: 0.78,
            residues: ["LEU128", "VAL132", "TRP83", "PHE84"]
          }
        ],
        confidence: 0.94
      };
    });
  }, [execute]);

  const validateDockingParameters = useCallback(async (parameters: DockingParameters) => {
    return execute(async () => {
      await simulateDelay(1000, 2000);
      const warnings = [];
      
      if (parameters.exhaustiveness < 8) {
        warnings.push("Low exhaustiveness may reduce accuracy");
      }
      if (parameters.size_x < 15 || parameters.size_y < 15 || parameters.size_z < 15) {
        warnings.push("Search space might be too small");
      }
      
      return {
        valid: warnings.length === 0,
        warnings,
        estimated_runtime: Math.floor(Math.random() * 300 + 120), // 2-7 minutes
        recommendations: warnings.length > 0 ? [
          "Consider increasing exhaustiveness to 16 for better results",
          "Expand search space to at least 20x20x20 Å"
        ] : []
      };
    });
  }, [execute]);

  const getDockingStats = useCallback(async () => {
    return execute(async () => {
      await simulateDelay(500, 1000);
      return {
        total_jobs: mockJobs.length + Math.floor(Math.random() * 50),
        completed_jobs: Math.floor(mockJobs.filter(j => j.status === 'completed').length + Math.random() * 40),
        success_rate: Math.round((0.85 + Math.random() * 0.1) * 100) / 100,
        average_runtime: Math.floor(Math.random() * 300 + 180), // 3-8 minutes
        queue_length: Math.floor(Math.random() * 5),
        system_load: Math.round(Math.random() * 80 + 10) // 10-90%
      };
    });
  }, [execute]);

  return {
    predictBindingSite,
    validateDockingParameters,
    getDockingStats,
    isLoading,
    error,
  };
}

// System health hook with simulation
export function useHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      // Simulate occasional connection issues (5% chance)
      await simulateDelay(200, 800);
      
      if (Math.random() < 0.05) {
        throw new Error('Simulated connection error');
      }
      
      setIsHealthy(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth,
  };
}