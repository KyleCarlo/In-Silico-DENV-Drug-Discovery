import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  LogOut
} from "lucide-react";

export const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartAnalysis = () => {
    setIsProcessing(true);
    setCurrentStep(2);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentStep(3);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Atom className="w-6 h-6 text-molecular-blue" />
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
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Analyses</span>
                  <span className="font-semibold">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-molecular-teal">99.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Processing</span>
                  <span className="font-semibold">2.3 min</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Running Analyses</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-molecular-blue rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Protein-ABC123</div>
                    <div className="text-xs text-muted-foreground">Started 3 min ago</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-molecular-teal rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Ligand-XYZ789</div>
                    <div className="text-xs text-muted-foreground">Started 8 min ago</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Results</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-molecular-green" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Analysis #246</div>
                    <div className="text-xs text-muted-foreground">Completed • 99.4% confidence</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-molecular-green" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Analysis #245</div>
                    <div className="text-xs text-muted-foreground">Completed • 98.9% confidence</div>
                  </div>
                </div>
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
                            <div className="border-2 border-dashed border-molecular-blue/20 rounded-lg p-8 text-center hover:border-molecular-blue/40 transition-colors cursor-pointer">
                              <Upload className="w-8 h-8 text-molecular-blue mx-auto mb-2" />
                              <div className="text-sm font-medium">Upload PDB file</div>
                              <div className="text-xs text-muted-foreground">Or drag and drop here</div>
                            </div>
                            <Input type="text" placeholder="Or enter PDB ID (e.g., 1ABC)" />
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="ligand">Ligand Structure</Label>
                            <div className="border-2 border-dashed border-molecular-teal/20 rounded-lg p-8 text-center hover:border-molecular-teal/40 transition-colors cursor-pointer">
                              <Upload className="w-8 h-8 text-molecular-teal mx-auto mb-2" />
                              <div className="text-sm font-medium">Upload MOL/SDF file</div>
                              <div className="text-xs text-muted-foreground">Or drag and drop here</div>
                            </div>
                            <Input type="text" placeholder="Or enter SMILES string" />
                          </div>
                        </div>

                        <div className="space-y-4">
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
                        </div>

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

                        <div className="grid md:grid-cols-3 gap-4">
                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-blue">-12.4</div>
                            <div className="text-sm text-muted-foreground">Binding Affinity (kcal/mol)</div>
                          </Card>
                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-teal">99.2%</div>
                            <div className="text-sm text-muted-foreground">Quantum Confidence</div>
                          </Card>
                          <Card className="p-4 text-center">
                            <div className="text-2xl font-bold text-molecular-purple">2.1 min</div>
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
    </div>
  );
};