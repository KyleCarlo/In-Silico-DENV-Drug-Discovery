import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Play, Atom } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import demoImage from "@/assets/demo-visual.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-molecular-blue/20 via-background to-molecular-teal/20" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-molecular-blue">
                <Atom className="w-6 h-6" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Pharmtom™ Labs
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                First
                <span className="bg-gradient-to-r from-molecular-blue to-molecular-teal bg-clip-text text-transparent">
                  {" "}Quantum-Powered
                </span>
                <br />
                Molecular Docking
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Revolutionary quantum computing platform that predicts protein-ligand interactions 
                with unprecedented 99.2% accuracy. Beyond classical methods like SwissDock.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate('/dashboard')}
              >
                Start Free Analysis
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")}
                >
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-molecular-blue">10M+</div>
                <div className="text-sm text-muted-foreground">Predictions Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-molecular-teal">99.2%</div>
                <div className="text-sm text-muted-foreground">Quantum Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-molecular-purple">24/7</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
            </div>
          </div>

          {/* Right side - Interactive Demo */}
          <div className="relative">
            <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-molecular-blue/20 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Live Demo</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-molecular-green rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">Processing</span>
                  </div>
                </div>
                
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <img 
                    src={demoImage} 
                    alt="Molecular docking visualization"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm font-medium">Protein: 2XYZ</div>
                    <div className="text-xs opacity-80">Ligand: Compound-A47</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-molecular-blue font-semibold">Quantum Score</div>
                    <div className="text-lg font-bold">-12.4 kcal/mol</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-molecular-teal font-semibold">Q-Confidence</div>
                    <div className="text-lg font-bold">99.2%</div>
                  </div>
                </div>

                <Button variant="molecular" className="w-full">
                  Try Your Own Molecule
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};