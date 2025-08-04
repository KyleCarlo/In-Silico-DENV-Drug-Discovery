/**
 * React hooks for QuantumDock API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import api, { 
  ProteinInfo, 
  LigandInfo, 
  DockingJob, 
  AnalysisRequest,
  DockingParameters 
} from '@/lib/api';

// Generic API hook
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

// Proteins hook
export function useProteins() {
  const [proteins, setProteins] = useState<ProteinInfo[]>([]);
  const { execute, isLoading, error } = useAPI();

  const loadProteins = useCallback(async () => {
    const result = await execute(() => api.getProteins());
    if (result && result.proteins) {
      setProteins(result.proteins);
    }
  }, [execute]);

  const uploadProtein = useCallback(async (file: File, name?: string) => {
    const result = await execute(
      () => api.uploadProteinFile(file, name),
      'Protein uploaded successfully'
    );
    
    if (result) {
      await loadProteins(); // Refresh list
    }
    
    return result;
  }, [execute, loadProteins]);

  const analyzeProtein = useCallback(async (proteinId: string) => {
    return execute(() => api.analyzeProtein(proteinId));
  }, [execute]);

  const deleteProtein = useCallback(async (proteinId: string) => {
    const result = await execute(
      () => api.deleteProteinFile(proteinId),
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

// Ligands hook
export function useLigands() {
  const [ligands, setLigands] = useState<LigandInfo[]>([]);
  const { execute, isLoading, error } = useAPI();

  const loadLigands = useCallback(async () => {
    const result = await execute(() => api.getLigands());
    if (result && result.ligands) {
      setLigands(result.ligands);
    }
  }, [execute]);

  const createLigandFromSmiles = useCallback(async (
    smiles: string, 
    name: string = 'Generated Ligand'
  ) => {
    const result = await execute(
      () => api.createLigandFromSmiles(smiles, name),
      'Ligand created successfully'
    );
    
    if (result) {
      await loadLigands(); // Refresh list
    }
    
    return result;
  }, [execute, loadLigands]);

  const uploadLigand = useCallback(async (file: File, name?: string) => {
    const result = await execute(
      () => api.uploadLigandFile(file, name),
      'Ligand uploaded successfully'
    );
    
    if (result) {
      await loadLigands(); // Refresh list
    }
    
    return result;
  }, [execute, loadLigands]);

  const analyzeLigand = useCallback(async (ligandId: string) => {
    return execute(() => api.analyzeLigand(ligandId));
  }, [execute]);

  const getLigandImage = useCallback(async (ligandId: string) => {
    return execute(() => api.getLigandImage(ligandId));
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

// Docking jobs hook
export function useDocking() {
  const [jobs, setJobs] = useState<DockingJob[]>([]);
  const [activeJob, setActiveJob] = useState<DockingJob | null>(null);
  const { execute, isLoading, error } = useAPI();

  const loadJobs = useCallback(async (status?: string) => {
    const result = await execute(() => api.getDockingJobs(status));
    if (result && result.jobs) {
      setJobs(result.jobs);
    }
  }, [execute]);

  const createDockingJob = useCallback(async (request: AnalysisRequest) => {
    const result = await execute(
      () => api.createDockingJob(request),
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
      () => api.cancelDockingJob(jobId),
      'Job cancelled successfully'
    );
    
    if (result) {
      await loadJobs(); // Refresh list
    }
    
    return result;
  }, [execute, loadJobs]);

  const deleteJob = useCallback(async (jobId: string) => {
    const result = await execute(
      () => api.deleteDockingJob(jobId),
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
    return execute(() => api.getDockingResults(jobId));
  }, [execute]);

  const downloadResults = useCallback(async (jobId: string, fileType: string) => {
    return execute(() => api.downloadResultFile(jobId, fileType));
  }, [execute]);

  // Poll active job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      await api.pollJobStatus(jobId, (updatedJob) => {
        setActiveJob(updatedJob);
        setJobs(prevJobs => 
          prevJobs.map(job => job.job_id === jobId ? updatedJob : job)
        );
      });
    } catch (err) {
      console.error('Error polling job status:', err);
    }
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

// Analysis hook for protein and ligand analysis
export function useAnalysis() {
  const { execute, isLoading, error } = useAPI();

  const predictBindingSite = useCallback(async (proteinId: string) => {
    return execute(() => api.predictBindingSite(proteinId));
  }, [execute]);

  const validateDockingParameters = useCallback(async (parameters: DockingParameters) => {
    return execute(() => api.validateDockingParameters(parameters));
  }, [execute]);

  const getDockingStats = useCallback(async () => {
    return execute(() => api.getDockingStats());
  }, [execute]);

  return {
    predictBindingSite,
    validateDockingParameters,
    getDockingStats,
    isLoading,
    error,
  };
}

// System health hook
export function useHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      await api.healthCheck();
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
