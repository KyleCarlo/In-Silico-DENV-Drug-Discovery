/**
 * API service for QuantumDock backend integration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface ProteinInfo {
  id?: string;
  name: string;
  pdb_id?: string;
  sequence?: string;
  molecular_weight?: number;
  resolution?: number;
  organism?: string;
  classification?: string;
  structure_file?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LigandInfo {
  id?: string;
  name: string;
  smiles?: string;
  inchi?: string;
  molecular_formula?: string;
  molecular_weight?: number;
  logp?: number;
  hbd?: number;
  hba?: number;
  tpsa?: number;
  rotatable_bonds?: number;
  aromatic_rings?: number;
  structure_file?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DockingParameters {
  center_x: number;
  center_y: number;
  center_z: number;
  size_x: number;
  size_y: number;
  size_z: number;
  exhaustiveness: number;
  num_modes: number;
  energy_range: number;
  seed?: number;
}

export interface DockingJob {
  id: string;
  protein_id: string;
  ligand_id: string;
  parameters: DockingParameters;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  results?: DockingResult[];
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion?: string;
}

export interface DockingResult {
  mode: number;
  binding_affinity: number;
  rmsd_lower_bound: number;
  rmsd_upper_bound: number;
  interactions: Interaction[];
  pose_file?: string;
}

export interface Interaction {
  interaction_type: string;
  residue: string;
  distance: number;
  angle?: number;
  strength?: number;
}

export interface AnalysisRequest {
  protein_id: string;
  ligand_id: string;
  parameters: DockingParameters;
  job_name?: string;
  priority?: number;
}

// API Client Class
class QuantumDockAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Protein APIs
  async getProteins(): Promise<ProteinInfo[]> {
    return this.request('/proteins/');
  }

  async getProtein(proteinId: string): Promise<ProteinInfo> {
    return this.request(`/proteins/${proteinId}`);
  }

  async createProtein(protein: ProteinInfo): Promise<ProteinInfo> {
    return this.request('/proteins/', {
      method: 'POST',
      body: JSON.stringify(protein),
    });
  }

  async uploadProteinFile(file: File, name?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    return this.request('/proteins/upload/', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set boundary
      body: formData,
    });
  }

  async analyzeProtein(proteinId: string): Promise<any> {
    return this.request(`/proteins/${proteinId}/analyze`);
  }

  async downloadProteinFile(proteinId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/proteins/${proteinId}/download`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // Ligand APIs
  async getLigands(): Promise<LigandInfo[]> {
    return this.request('/ligands/');
  }

  async getLigand(ligandId: string): Promise<LigandInfo> {
    return this.request(`/ligands/${ligandId}`);
  }

  async createLigand(ligand: LigandInfo): Promise<LigandInfo> {
    return this.request('/ligands/', {
      method: 'POST',
      body: JSON.stringify(ligand),
    });
  }

  async createLigandFromSmiles(
    smiles: string, 
    name: string = 'Generated Ligand',
    generate3d: boolean = true
  ): Promise<any> {
    return this.request('/ligands/from-smiles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        smiles,
        name,
        generate_3d: generate3d.toString(),
      }),
    });
  }

  async uploadLigandFile(file: File, name?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    return this.request('/ligands/upload/', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set boundary
      body: formData,
    });
  }

  async analyzeLigand(ligandId: string): Promise<any> {
    return this.request(`/ligands/${ligandId}/analyze`);
  }

  async getLigandImage(
    ligandId: string, 
    format: string = 'png', 
    size: number = 300
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/ligands/${ligandId}/image?format=${format}&size=${size}`
    );
    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // Docking APIs
  async createDockingJob(request: AnalysisRequest): Promise<DockingJob> {
    return this.request('/docking/jobs/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDockingJobs(
    status?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<DockingJob[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (status) params.append('status', status);

    return this.request(`/docking/jobs/?${params}`);
  }

  async getDockingJob(jobId: string): Promise<DockingJob> {
    return this.request(`/docking/jobs/${jobId}`);
  }

  async cancelDockingJob(jobId: string): Promise<{ message: string }> {
    return this.request(`/docking/jobs/${jobId}/cancel`, {
      method: 'PUT',
    });
  }

  async deleteDockingJob(jobId: string): Promise<{ message: string }> {
    return this.request(`/docking/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async getDockingResults(jobId: string): Promise<any> {
    return this.request(`/docking/jobs/${jobId}/results`);
  }

  async downloadResultFile(jobId: string, fileType: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/docking/jobs/${jobId}/download/${fileType}`
    );
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }

  async rerunDockingJob(
    jobId: string, 
    newParameters?: DockingParameters
  ): Promise<any> {
    return this.request(`/docking/jobs/${jobId}/rerun`, {
      method: 'POST',
      body: newParameters ? JSON.stringify(newParameters) : undefined,
    });
  }

  async getDockingStats(): Promise<any> {
    return this.request('/docking/stats');
  }

  async validateDockingParameters(parameters: DockingParameters): Promise<any> {
    return this.request('/docking/validate-parameters', {
      method: 'POST',
      body: JSON.stringify(parameters),
    });
  }

  // Analysis APIs
  async predictBindingSite(proteinId: string): Promise<any> {
    return this.request(`/analysis/binding-site/${proteinId}`);
  }

  // Utility method to poll job status
  async pollJobStatus(
    jobId: string,
    onUpdate?: (job: DockingJob) => void,
    intervalMs: number = 2000
  ): Promise<DockingJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getDockingJob(jobId);
          
          if (onUpdate) {
            onUpdate(job);
          }

          if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
            resolve(job);
          } else {
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

// Export singleton instance
export const api = new QuantumDockAPI();

// Export default
export default api;
