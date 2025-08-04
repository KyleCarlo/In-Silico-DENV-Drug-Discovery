import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Upload,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Atom,
  Settings,
  User,
  LogOut,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// API Integration
import {
  useProteins,
  useLigands,
  useDocking,
  useHealth,
} from "@/hooks/use-api";
import { DockingParameters } from "@/lib/api";

// Assets
import pharmtomLogo from "@/assets/pharmtom_tp.png";

import * as $3Dmol from "3dmol";
import Viewer3D from "@/components/Viewer3D";
import LigandViewer from "@/components/LigandViewer";
import ProteinSearchSpaceViewer from "@/components/ProteinSearchSpaceViewer";
import EnergyTable from "@/components/EnergyTable";
import SidebarStats from "@/components/SidebarStats";
import StepIndicator from "@/components/StepIndicator";

export const Dashboard = () => {
  const navigate = useNavigate();

  // API Hooks
  const { proteins, uploadProtein, isLoading: proteinsLoading } = useProteins();
  const {
    ligands,
    createLigandFromSmiles,
    uploadLigand,
    isLoading: ligandsLoading,
  } = useLigands();
  const {
    jobs = [],
    activeJob,
    createDockingJob,
    pollJobStatus,
    getJobResults,
    isLoading: dockingLoading,
  } = useDocking();
  const { isHealthy } = useHealth();

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState("");
  const [selectedLigand, setSelectedLigand] = useState("");
  const [showProteinImage, setShowProteinImage] = useState(false);
  const [showLigandImage, setShowLigandImage] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  // Form State
  const [customSmiles, setCustomSmiles] = useState("");
  const [ligandName, setLigandName] = useState("");
  const [dockingParams, setDockingParams] = useState<DockingParameters>({
    center_x: -2.68,
    center_y: 23.88,
    center_z: 39.77,
    size_x: 25.0,
    size_y: 25.0,
    size_z: 25.0,
    exhaustiveness: 8,
    num_modes: 9,
    energy_range: 3.0,
  });

  // File upload refs
  const proteinFileRef = useRef<HTMLInputElement>(null);
  const ligandFileRef = useRef<HTMLInputElement>(null);

  // Job progress state
  const [jobProgress, setJobProgress] = useState(0);
  const [jobResults, setJobResults] = useState<Record<string, unknown> | null>(
    null
  );
  const [progress, setProgress] = useState(0);

  // Sync progress with active job
  useEffect(() => {
    if (activeJob) {
      setProgress(activeJob.progress || 0);
      setJobProgress(activeJob.progress || 0);
    }
  }, [activeJob]);

  // Search space coordinates
  const [searchSpaceX, setSearchSpaceX] = useState(
    dockingParams.center_x.toString()
  );
  const [searchSpaceY, setSearchSpaceY] = useState(
    dockingParams.center_y.toString()
  );
  const [searchSpaceZ, setSearchSpaceZ] = useState(
    dockingParams.center_z.toString()
  );

  // Search space sizes
  const [searchSpaceSizeX, setSearchSpaceSizeX] = useState(
    dockingParams.size_x.toString()
  );
  const [searchSpaceSizeY, setSearchSpaceSizeY] = useState(
    dockingParams.size_y.toString()
  );
  const [searchSpaceSizeZ, setSearchSpaceSizeZ] = useState(
    dockingParams.size_z.toString()
  );

  // Handle keyboard events for closing enlarged image
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && enlargedImage) {
        setEnlargedImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enlargedImage]);

  // Poll active job progress
  useEffect(() => {
    if (
      activeJob &&
      (activeJob.status === "running" || activeJob.status === "pending")
    ) {
      const interval = setInterval(() => {
        setJobProgress(activeJob.progress);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeJob]);

  // Handle job completion
  useEffect(() => {
    if (activeJob && activeJob.status === "completed") {
      setCurrentStep(3);
      setJobProgress(100);

      // Load results
      getJobResults(activeJob.id).then((results) => {
        setJobResults(results);
      });
    }
  }, [activeJob, getJobResults]);

  const handleImageClick = (src: string, alt: string) => {
    setEnlargedImage({ src, alt });
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const handleProteinSelection = (proteinId: string) => {
    setSelectedProtein(proteinId);
    setShowProteinImage(false);
    if (proteinId) {
      setTimeout(() => {
        setShowProteinImage(true);
      }, 10);
    }
  };

  const handleLigandSelection = (ligandId: string) => {
    setSelectedLigand(ligandId);
    // $3Dmol.download(
    //   "pdb:4N8T",
    //   viewer,
    //   { multimodel: true, frames: true },
    //   function () {
    //     viewer.setStyle({}, { cartoon: { color: "spectrum" } });
    //     viewer.render();
    //   }
    // );

    setShowLigandImage(false);
    if (ligandId) {
      setTimeout(() => {
        setShowLigandImage(true);
      }, 10);
    }
  };

  const handleProteinUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadProtein(file, file.name);
    }
  };

  const handleLigandUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadLigand(file, file.name);
    }
  };

  const handleCreateLigandFromSmiles = async () => {
    if (customSmiles && ligandName) {
      const result = await createLigandFromSmiles(customSmiles, ligandName);
      if (result) {
        setSelectedLigand(result.ligand_id);
        setCustomSmiles("");
        setLigandName("");
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedProtein || !selectedLigand) {
      toast({
        title: "Missing Selection",
        description:
          "Please select both protein and ligand before starting analysis",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(2);
    setJobProgress(0);

    try {
      const job = await createDockingJob({
        protein_id: selectedProtein,
        ligand_id: selectedLigand,
        parameters: dockingParams,
      });

      if (job) {
        // Start polling job status
        pollJobStatus(job.job_id);
      }
    } catch (error) {
      console.error("Failed to start docking job:", error);
      setCurrentStep(1);
    }
  };

  // Update docking parameters when search space values change
  const updateDockingParams = useCallback(() => {
    setDockingParams(prev => ({
      ...prev,
      center_x: parseFloat(searchSpaceX) || prev.center_x,
      center_y: parseFloat(searchSpaceY) || prev.center_y,
      center_z: parseFloat(searchSpaceZ) || prev.center_z,
      size_x: parseFloat(searchSpaceSizeX) || prev.size_x,
      size_y: parseFloat(searchSpaceSizeY) || prev.size_y,
      size_z: parseFloat(searchSpaceSizeZ) || prev.size_z,
    }));
  }, [searchSpaceX, searchSpaceY, searchSpaceZ, searchSpaceSizeX, searchSpaceSizeY, searchSpaceSizeZ]);

  // Update docking params when search space values change
  useEffect(() => {
    updateDockingParams();
  }, [updateDockingParams]);

  // Mock energy data for docking poses
  const energyData = [
    { pose: 0, total: -5.817, inter: -7.857, intra: -0.531, torsions: 2.040, intraBestPose: -0.531 },
    { pose: 1, total: -5.611, inter: -7.785, intra: -0.325, torsions: 1.968, intraBestPose: -0.531 },
    { pose: 2, total: -5.488, inter: -7.354, intra: -0.590, torsions: 1.925, intraBestPose: -0.531 },
    { pose: 3, total: -5.451, inter: -7.811, intra: -0.083, torsions: 1.912, intraBestPose: -0.531 },
    { pose: 4, total: -5.434, inter: -7.391, intra: -0.481, torsions: 1.906, intraBestPose: -0.531 },
    { pose: 5, total: -5.311, inter: -7.467, intra: -0.238, torsions: 1.863, intraBestPose: -0.531 },
    { pose: 6, total: -5.301, inter: -7.545, intra: -0.146, torsions: 1.859, intraBestPose: -0.531 },
    { pose: 7, total: -5.286, inter: -7.027, intra: -0.644, torsions: 1.854, intraBestPose: -0.531 },
    { pose: 8, total: -5.282, inter: -7.142, intra: -0.523, torsions: 1.853, intraBestPose: -0.531 },
  ];

  // var viewer = $3Dmol.createViewer('div-lig');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 hover:cursor-pointer"
                onClick={() => navigate("/")}
              >
                <img
                  src={pharmtomLogo}
                  alt="Pharmtom Labs"
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold">QuantumDock</span>
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <Button variant="ghost" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="ghost" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <SidebarStats
            isHealthy={isHealthy}
            jobs={jobs}
            proteins={proteins}
            ligands={ligands}
          />

          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="new-analysis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-analysis">New Analysis</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="new-analysis" className="space-y-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Step Indicator */}
                    <StepIndicator currentStep={currentStep} />

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            New Quantum Analysis
                          </h2>
                          <p className="text-muted-foreground">
                            Upload your protein and ligand structures for
                            quantum-enhanced molecular docking
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Label htmlFor="protein">Protein Structure</Label>
                            <div className="space-y-3">
                              <select
                                className="w-full p-3 border border-molecular-blue/20 rounded-lg bg-background hover:border-molecular-blue/40 transition-colors"
                                value={selectedProtein}
                                onChange={(e) =>
                                  handleProteinSelection(e.target.value)
                                }
                                disabled={proteinsLoading}
                              >
                                <option value="">
                                  {proteinsLoading
                                    ? "Loading proteins..."
                                    : "Select protein structure..."}
                                </option>
                                {proteins.map((protein) => (
                                  <option
                                    key={protein.id || protein.name}
                                    value={protein.id || protein.name}
                                  >
                                    {protein.name} -{" "}
                                    {protein.pdb_id ||
                                      protein.classification ||
                                      "Protein Structure"}
                                  </option>
                                ))}
                              </select>
                              <div className="border-2 border-dashed border-molecular-blue/20 rounded-lg p-8 text-center hover:border-molecular-blue/40 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-molecular-blue mx-auto mb-2" />
                                <div className="text-sm font-medium">
                                  Upload PDB file
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Or drag and drop here
                                </div>
                              </div>
                            </div>
                            {showProteinImage && selectedProtein && (
                              <Viewer3D pdbId="2BMF" />
                            )}
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="ligand">Ligand Structure</Label>
                            <div className="space-y-3">
                              <select
                                className="w-full p-3 border border-molecular-teal/20 rounded-lg bg-background hover:border-molecular-teal/40 transition-colors"
                                value={selectedLigand}
                                onChange={(e) =>
                                  handleLigandSelection(e.target.value)
                                }
                                disabled={ligandsLoading}
                              >
                                <option value="">
                                  {ligandsLoading
                                    ? "Loading ligands..."
                                    : "Select ligand structure..."}
                                </option>
                                {ligands.map((ligand) => (
                                  <option
                                    key={ligand.id || ligand.name}
                                    value={ligand.id || ligand.name}
                                  >
                                    {ligand.name} -{" "}
                                    {ligand.smiles && ligand.smiles.length > 20
                                      ? `${ligand.smiles.substring(0, 20)}...`
                                      : ligand.smiles || "Ligand Structure"}
                                  </option>
                                ))}
                              </select>
                              <div className="border-2 border-dashed border-molecular-teal/20 rounded-lg p-8 text-center hover:border-molecular-teal/40 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-molecular-teal mx-auto mb-2" />
                                <div className="text-sm font-medium">
                                  Upload MOL/SDF file
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Or drag and drop here
                                </div>
                              </div>
                            </div>
                            {showLigandImage && selectedLigand && (
                              <LigandViewer
                                data={`https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(
                                  "CCCSc1ncc(c(n1)C(=O)Nc2nc3ccc(cc3s2)OC)Cl"
                                )}/file?format=mol`}
                                format="mol"
                                fromUrl={true}
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Define Search Space</Label>
                          
                          {/* 3D Visualization */}
                          {selectedProtein && (
                            <div className="space-y-2">
                              <Label>3D Visualization - Protein & Search Space</Label>
                              <ProteinSearchSpaceViewer
                                pdbId="2BMF"
                                searchSpace={{
                                  center_x: parseFloat(searchSpaceX) || dockingParams.center_x,
                                  center_y: parseFloat(searchSpaceY) || dockingParams.center_y,
                                  center_z: parseFloat(searchSpaceZ) || dockingParams.center_z,
                                  size_x: parseFloat(searchSpaceSizeX) || dockingParams.size_x,
                                  size_y: parseFloat(searchSpaceSizeY) || dockingParams.size_y,
                                  size_z: parseFloat(searchSpaceSizeZ) || dockingParams.size_z,
                                }}
                              />
                            </div>
                          )}

                          {/* Center Coordinates */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Search Center (Coordinates)</Label>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="searchX" className="text-xs">X Coordinate</Label>
                                <Input
                                  type="number"
                                  id="searchX"
                                  placeholder="0.0"
                                  value={searchSpaceX}
                                  onChange={(e) =>
                                    setSearchSpaceX(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="searchY" className="text-xs">Y Coordinate</Label>
                                <Input
                                  type="number"
                                  id="searchY"
                                  placeholder="0.0"
                                  value={searchSpaceY}
                                  onChange={(e) =>
                                    setSearchSpaceY(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="searchZ" className="text-xs">Z Coordinate</Label>
                                <Input
                                  type="number"
                                  id="searchZ"
                                  placeholder="0.0"
                                  value={searchSpaceZ}
                                  onChange={(e) =>
                                    setSearchSpaceZ(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* Size Dimensions */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Search Space Size (Dimensions)</Label>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="searchSizeX" className="text-xs">Width (X)</Label>
                                <Input
                                  type="number"
                                  id="searchSizeX"
                                  placeholder="25.0"
                                  value={searchSpaceSizeX}
                                  onChange={(e) =>
                                    setSearchSpaceSizeX(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="searchSizeY" className="text-xs">Height (Y)</Label>
                                <Input
                                  type="number"
                                  id="searchSizeY"
                                  placeholder="25.0"
                                  value={searchSpaceSizeY}
                                  onChange={(e) =>
                                    setSearchSpaceSizeY(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="searchSizeZ" className="text-xs">Depth (Z)</Label>
                                <Input
                                  type="number"
                                  id="searchSizeZ"
                                  placeholder="25.0"
                                  value={searchSpaceSizeZ}
                                  onChange={(e) =>
                                    setSearchSpaceSizeZ(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* <Button
                            onClick={handleShowInteraction}
                            disabled={
                              isShowingInteraction ||
                              !selectedProtein ||
                              !selectedLigand
                            }
                            className="w-full"
                            variant="outline"
                            size="lg"
                          >
                            {isShowingInteraction ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Calculating Interactions...
                              </>
                            ) : (
                              "Show Interaction"
                            )}
                          </Button> */}
                        </div>

                        <Button
                          onClick={handleStartAnalysis}
                          disabled={!selectedProtein || !selectedLigand}
                          className="w-full"
                          variant="hero"
                          size="lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Start Quantum Analysis
                        </Button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-molecular-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Atom className="w-8 h-8 text-molecular-blue animate-spin" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">
                            Quantum Processing
                          </h2>
                          <p className="text-muted-foreground">
                            Running quantum algorithms to predict molecular
                            interactions...
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-molecular-blue" />
                              <div>
                                <div className="font-medium">
                                  Processing Time
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ~2 minutes remaining
                                </div>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-molecular-teal" />
                              <div>
                                <div className="font-medium">
                                  Quantum States
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Exploring 1,024 configurations
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-molecular-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-molecular-green" />
                          </div>
                          <h2 className="text-2xl font-bold mb-2">
                            Analysis Complete
                          </h2>
                          <p className="text-muted-foreground">
                            Quantum molecular docking completed with high
                            confidence
                          </p>
                        </div>

                        {/* Energy Table */}
                        <EnergyTable energyData={energyData} />

                        <div className="flex gap-4">
                          <Button variant="hero" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download Results
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                          >
                            New Analysis
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Analysis History
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: "#246",
                        protein: "1ABC",
                        ligand: "Compound-X1",
                        confidence: "99.4%",
                        status: "Completed",
                      },
                      {
                        id: "#245",
                        protein: "2XYZ",
                        ligand: "Compound-Y2",
                        confidence: "98.9%",
                        status: "Completed",
                      },
                      {
                        id: "#244",
                        protein: "3DEF",
                        ligand: "Compound-Z3",
                        confidence: "99.1%",
                        status: "Completed",
                      },
                    ].map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{analysis.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {analysis.protein} + {analysis.ligand}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            variant="outline"
                            className="text-molecular-green"
                          >
                            {analysis.confidence}
                          </Badge>
                          <Badge>{analysis.status}</Badge>
                          <Button size="sm" variant="ghost">
                            View Results
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeEnlargedImage}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={closeEnlargedImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={enlargedImage.src}
              alt={enlargedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
