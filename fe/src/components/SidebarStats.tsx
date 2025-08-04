import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Job {
  job_id: string;
  status: string;
  progress?: number;
  completed_at?: string;
}

interface ProteinInfo {
  id?: string;
  name: string;
}

interface LigandInfo {
  id?: string;
  name: string;
}

interface SidebarStatsProps {
  isHealthy: boolean;
  jobs: Job[];
  proteins: ProteinInfo[];
  ligands: LigandInfo[];
}

const SidebarStats: React.FC<SidebarStatsProps> = ({
  isHealthy,
  jobs,
  proteins,
  ligands,
}) => {
  const runningJobs = jobs.filter(
    (job) => job.status === "running" || job.status === "pending"
  );
  const completedJobs = jobs.filter((job) => job.status === "completed");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quick Stats</h3>
          {!isHealthy && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              API Offline
            </Badge>
          )}
          {isHealthy && (
            <Badge variant="default" className="text-xs bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              API Online
            </Badge>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Jobs</span>
            <span className="font-semibold">{jobs.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-semibold text-molecular-teal">
              {completedJobs.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Proteins</span>
            <span className="font-semibold">{proteins.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ligands</span>
            <span className="font-semibold">{ligands.length}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Running Analyses</h3>
        <div className="space-y-3">
          {runningJobs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No active jobs
            </div>
          ) : (
            runningJobs.map((job) => (
              <div key={job.job_id} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    job.status === "running"
                      ? "bg-molecular-blue"
                      : "bg-molecular-teal"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{job.job_id}</div>
                  <div className="text-xs text-muted-foreground">
                    {job.status === "running"
                      ? `${job.progress || 50}% complete`
                      : "Pending"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
        <div className="space-y-3">
          {completedJobs.slice(0, 3).length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No completed jobs
            </div>
          ) : (
            completedJobs.slice(0, 3).map((job) => (
              <div key={job.job_id} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-molecular-green" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{job.job_id}</div>
                  <div className="text-xs text-muted-foreground">
                    Completed •{" "}
                    {job.completed_at
                      ? new Date(job.completed_at).toLocaleDateString()
                      : "Recently"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default SidebarStats;
