import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Atom,
  Zap,
  History,
  Settings,
  User,
  LogOut,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// API Integration
import { useProteins, useLigands, useDocking, useHealth } from "@/hooks/use-api";
import { DockingParameters } from "@/lib/api";

// Assets
import pharmtomLogo from "@/assets/pharmtom_tp.png";
import proteinImage from "@/assets/2BMF.png";
import ligandImage from "@/assets/CCCSc1ncc(c(n1)C(=O)Nc2nc3ccc(cc3s2)OC)Cl.png";
import interaction2D from "@/assets/interaction.png";
import interaction3D from "@/assets/interaction_3d.png";
import resultImage from "@/assets/result.png";

export const Dashboard = () => {
  const navigate = useNavigate();
  
  // API Hooks
  const { proteins, uploadProtein, isLoading: proteinsLoading } = useProteins();
  const { ligands, createLigandFromSmiles, uploadLigand, isLoading: ligandsLoading } = useLigands();
  const { jobs, activeJob, createDockingJob, pollJobStatus, getJobResults, isLoading: dockingLoading } = useDocking();
  const { isHealthy } = useHealth();

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState("");
  const [selectedLigand, setSelectedLigand] = useState("");
  const [showProteinImage, setShowProteinImage] = useState(false);
  const [showLigandImage, setShowLigandImage] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);
  const [showInteractionImages, setShowInteractionImages] = useState(false);

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
    energy_range: 3.0
  });

  // File upload refs
  const proteinFileRef = useRef<HTMLInputElement>(null);
  const ligandFileRef = useRef<HTMLInputElement>(null);

  // Job progress state
  const [jobProgress, setJobProgress] = useState(0);
  const [jobResults, setJobResults] = useState<Record<string, unknown> | null>(null);
  const [progress, setProgress] = useState(0);
  const [isShowingInteraction, setIsShowingInteraction] = useState(false);
  
  // Sync progress with active job
  useEffect(() => {
    if (activeJob) {
      setProgress(activeJob.progress || 0);
      setJobProgress(activeJob.progress || 0);
    }
  }, [activeJob]);

  // Search space coordinates
  const [searchSpaceX, setSearchSpaceX] = useState(dockingParams.center_x.toString());
  const [searchSpaceY, setSearchSpaceY] = useState(dockingParams.center_y.toString());
  const [searchSpaceZ, setSearchSpaceZ] = useState(dockingParams.center_z.toString());

  // Handle keyboard events for closing enlarged image
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && enlargedImage) {
        setEnlargedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enlargedImage]);

  // Poll active job progress
  useEffect(() => {
    if (activeJob && (activeJob.status === 'running' || activeJob.status === 'pending')) {
      const interval = setInterval(() => {
        setJobProgress(activeJob.progress);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeJob]);

  // Handle job completion
  useEffect(() => {
    if (activeJob && activeJob.status === 'completed') {
      setCurrentStep(3);
      setJobProgress(100);
      
      // Load results
      getJobResults(activeJob.id).then(results => {
        setJobResults(results);
        setShowInteractionImages(true);
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
      }, 1000);
    }
  };

  const handleLigandSelection = (ligandId: string) => {
    setSelectedLigand(ligandId);
    setShowLigandImage(false);
    if (ligandId) {
      setTimeout(() => {
        setShowLigandImage(true);
      }, 1000);
    }
  };

  const handleProteinUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadProtein(file, file.name);
    }
  };

  const handleLigandUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        description: "Please select both protein and ligand before starting analysis",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(2);
    setJobProgress(0);

    try {
      const job = await createDockingJob({
        protein_id: selectedProtein,
        ligand_id: selectedLigand,
        parameters: dockingParams
      });

      if (job) {
        // Start polling job status
        pollJobStatus(job.id);
      }
    } catch (error) {
      console.error('Failed to start docking job:', error);
      setCurrentStep(1);
    }
  };

  const handleShowInteraction = () => {
    setIsShowingInteraction(true);
    setShowInteractionImages(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 hover:cursor-pointer" onClick={() => navigate('/')}>
                {/* <Atom className="w-6 h-6 text-molecular-blue" /> */}
                <img src={pharmtomLogo} alt="Pharmtom Labs" className="w-10 h-10" />
                <span className="text-xl font-bold">QuantumDock</span>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <Button variant="ghost" className="gap-2">
                <Zap className="w-4 h-4" />
                New Analysis
              </Button>
              <Button variant="ghost" className="gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
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
                    {jobs.filter(job => job.status === 'completed').length}
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
                {jobs.filter(job => job.status === 'running' || job.status === 'pending').length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No active jobs
                  </div>
                ) : (
                  jobs.filter(job => job.status === 'running' || job.status === 'pending').map(job => (
                    <div key={job.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        job.status === 'running' ? 'bg-molecular-blue' : 'bg-molecular-teal'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{job.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {job.status === 'running' ? `${job.progress}% complete` : 'Pending'}
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
                {jobs.filter(job => job.status === 'completed').slice(0, 3).length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No completed jobs
                  </div>
                ) : (
                  jobs.filter(job => job.status === 'completed').slice(0, 3).map(job => (
                    <div key={job.id} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-molecular-green" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{job.id}</div>
                        <div className="text-xs text-muted-foreground">
                          Completed • {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="new-analysis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="new-analysis">New Analysis</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="queue">Queue</TabsTrigger>
              </TabsList>

              <TabsContent value="new-analysis" className="space-y-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-molecular-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                        1
                      </div>
                      <div className={`flex-1 h-1 ${currentStep > 1 ? 'bg-molecular-blue' : 'bg-muted'}`} />
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-molecular-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                        2
                      </div>
                      <div className={`flex-1 h-1 ${currentStep > 2 ? 'bg-molecular-blue' : 'bg-muted'}`} />
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-molecular-green text-white' : 'bg-muted text-muted-foreground'}`}>
                        3
                      </div>
                    </div>

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">New Quantum Analysis</h2>
                          <p className="text-muted-foreground">
                            Upload your protein and ligand structures for quantum-enhanced molecular docking
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Label htmlFor="protein">Protein Structure</Label>
                            <div className="space-y-3">
                              <select 
                                className="w-full p-3 border border-molecular-blue/20 rounded-lg bg-background hover:border-molecular-blue/40 transition-colors"
                                value={selectedProtein}
                                onChange={(e) => handleProteinSelection(e.target.value)}
                                disabled={proteinsLoading}
                              >
                                <option value="">{proteinsLoading ? 'Loading proteins...' : 'Select protein structure...'}</option>
                                {proteins.map(protein => (
                                  <option key={protein.id || protein.name} value={protein.id || protein.name}>
                                    {protein.name} - {protein.pdb_id || protein.classification || 'Protein Structure'}
                                  </option>
                                ))}
                              </select>
                              <div className="border-2 border-dashed border-molecular-blue/20 rounded-lg p-8 text-center hover:border-molecular-blue/40 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-molecular-blue mx-auto mb-2" />
                                <div className="text-sm font-medium">Upload PDB file</div>
                                <div className="text-xs text-muted-foreground">Or drag and drop here</div>
                              </div>
                            </div>
                            {showProteinImage && selectedProtein && (
                              <div className="mt-4">
                                <img 
                                  src={proteinImage} 
                                  alt="2BMF Protein Structure" 
                                  className="w-full h-48 object-contain bg-muted rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageClick(proteinImage, "2BMF Protein Structure")}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="ligand">Ligand Structure</Label>
                            <div className="space-y-3">
                              <select 
                                className="w-full p-3 border border-molecular-teal/20 rounded-lg bg-background hover:border-molecular-teal/40 transition-colors"
                                value={selectedLigand}
                                onChange={(e) => handleLigandSelection(e.target.value)}
                                disabled={ligandsLoading}
                              >
                                <option value="">{ligandsLoading ? 'Loading ligands...' : 'Select ligand structure...'}</option>
                                {ligands.map(ligand => (
                                  <option key={ligand.id || ligand.name} value={ligand.id || ligand.name}>
                                    {ligand.name} - {ligand.smiles && ligand.smiles.length > 20 ? `${ligand.smiles.substring(0, 20)}...` : ligand.smiles || 'Ligand Structure'}
                                  </option>
                                ))}
                              </select>
                              <div className="border-2 border-dashed border-molecular-teal/20 rounded-lg p-8 text-center hover:border-molecular-teal/40 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-molecular-teal mx-auto mb-2" />
                                <div className="text-sm font-medium">Upload MOL/SDF file</div>
                                <div className="text-xs text-muted-foreground">Or drag and drop here</div>
                              </div>
                            </div>
                            {showLigandImage && selectedLigand && (
                              <div className="mt-4">
                                <img 
                                  src={ligandImage} 
                                  alt="Ligand Structure" 
                                  className="w-full h-48 object-contain bg-muted rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageClick(ligandImage, "Ligand Structure")}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Define Search Space</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="searchX">X Coordinate</Label>
                              <Input
                                type="number"
                                id="searchX"
                                placeholder="0.0"
                                value={searchSpaceX}
                                onChange={(e) => setSearchSpaceX(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="searchY">Y Coordinate</Label>
                              <Input
                                type="number"
                                id="searchY"
                                placeholder="0.0"
                                value={searchSpaceY}
                                onChange={(e) => setSearchSpaceY(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="searchZ">Z Coordinate</Label>
                              <Input
                                type="number"
                                id="searchZ"
                                placeholder="0.0"
                                value={searchSpaceZ}
                                onChange={(e) => setSearchSpaceZ(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleShowInteraction}
                            disabled={isShowingInteraction || !selectedProtein || !selectedLigand}
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
                          </Button>
                        </div>

                        {showInteractionImages && (
                          <div className="space-y-4">
                            <Label>2D/3D Interaction Visualization</Label>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>2D Interaction</Label>
                                <img 
                                  src={interaction2D} 
                                  alt="2D Molecular Interaction" 
                                  className="w-full h-48 object-contain bg-muted rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageClick(interaction2D, "2D Molecular Interaction")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>3D Interaction</Label>
                                <img 
                                  src={interaction3D} 
                                  alt="3D Molecular Interaction" 
                                  className="w-full h-48 object-contain bg-muted rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => handleImageClick(interaction3D, "3D Molecular Interaction")}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* <div className="space-y-4">
                          <Label>Quantum Algorithm Settings</Label>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="algorithm">Algorithm</Label>
                              <select className="w-full p-2 border rounded-md">
                                <option>Quantum Variational Eigensolver</option>
                                <option>Quantum Approximate Optimization</option>
                                <option>Hybrid Classical-Quantum</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="precision">Precision Level</Label>
                              <select className="w-full p-2 border rounded-md">
                                <option>Ultra High (99%+)</option>
                                <option>High (95-99%)</option>
                                <option>Standard (90-95%)</option>
                              </select>
                            </div>
                          </div>
                        </div> */}

                        <Button 
                          onClick={handleStartAnalysis}
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
                          <h2 className="text-2xl font-bold mb-2">Quantum Processing</h2>
                          <p className="text-muted-foreground">
                            Running quantum algorithms to predict molecular interactions...
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
                                <div className="font-medium">Processing Time</div>
                                <div className="text-sm text-muted-foreground">~2 minutes remaining</div>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-molecular-teal" />
                              <div>
                                <div className="font-medium">Quantum States</div>
                                <div className="text-sm text-muted-foreground">Exploring 1,024 configurations</div>
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
                          <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                          <p className="text-muted-foreground">
                            Quantum molecular docking completed with high confidence
                          </p>
                        </div>

                        {/* Result Image */}
                        <div className="space-y-4">
                          <Label>Analysis Result</Label>
                          <img 
                            src={resultImage} 
                            alt="Docking Analysis Result" 
                            className="w-full h-64 object-contain bg-muted rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(resultImage, "Docking Analysis Result")}
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {/* <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-blue">-12.4</div>
                            <div className="text-sm text-muted-foreground">Binding Affinity (kcal/mol)</div>
                          </Card> */}
                          <Card className="p-4 text-center">
                            <div className="text-lg font-bold text-molecular-green">-47120.104</div>
                            <div className="text-xs text-muted-foreground">Hartree-Fock Energy (kcal/mol)</div>
                          </Card>
                          <Card className="p-4 text-center">
                            <div className="text-lg font-bold text-molecular-orange">-47401.946</div>
                            <div className="text-xs text-muted-foreground">DFT Energy (kcal/mol)</div>
                          </Card>
                          {/* <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-teal">99.2%</div>
                            <div className="text-sm text-muted-foreground">Quantum Confidence</div>
                          </Card> */}
                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-purple">5 min</div>
                            <div className="text-sm text-muted-foreground">Processing Time</div>
                          </Card>
                        </div>

                        <Card className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Interaction Details</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Primary Binding Site</span>
                              <Badge variant="outline">Site A (Cavity 1)</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Key Interactions</span>
                              <span className="text-sm">3 H-bonds, 2 π-π stacking</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantum Effects</span>
                              <span className="text-sm">Tunneling: 12%, Correlation: 8%</span>
                            </div>
                          </div>
                        </Card>

                        <div className="flex gap-4">
                          <Button variant="hero" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download Results
                          </Button>
                          <Button variant="outline" onClick={() => setCurrentStep(1)}>
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
                  <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
                  <div className="space-y-4">
                    {[
                      { id: "#246", protein: "1ABC", ligand: "Compound-X1", confidence: "99.4%", status: "Completed" },
                      { id: "#245", protein: "2XYZ", ligand: "Compound-Y2", confidence: "98.9%", status: "Completed" },
                      { id: "#244", protein: "3DEF", ligand: "Compound-Z3", confidence: "99.1%", status: "Completed" },
                    ].map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{analysis.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {analysis.protein} + {analysis.ligand}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-molecular-green">
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

              <TabsContent value="queue" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Analysis Queue</h3>
                  <div className="space-y-4">
                    {[
                      { id: "#247", protein: "4GHI", ligand: "Compound-A4", status: "Processing", progress: 75 },
                      { id: "#248", protein: "5JKL", ligand: "Compound-B5", status: "Queued", progress: 0 },
                      { id: "#249", protein: "6MNO", ligand: "Compound-C6", status: "Queued", progress: 0 },
                    ].map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{analysis.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {analysis.protein} + {analysis.ligand}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {analysis.status === "Processing" ? (
                            <div className="flex items-center gap-2">
                              <Progress value={analysis.progress} className="w-20" />
                              <Badge variant="outline" className="text-molecular-blue">
                                {analysis.progress}%
                              </Badge>
                            </div>
                          ) : (
                            <Badge variant="secondary">{analysis.status}</Badge>
                          )}
                          <Button size="sm" variant="ghost">
                            <AlertCircle className="w-4 h-4" />
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