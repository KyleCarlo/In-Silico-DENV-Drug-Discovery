import { Card } from "@/components/ui/card";
import { X, CheckCircle, Clock, AlertTriangle, Target } from "lucide-react";

export const Problem = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Classical Docking
            <span className="text-destructive"> Limitations</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SwissDock and classical methods hit accuracy barriers at ~85-90%. 
            Quantum tunneling effects and complex conformational changes remain unsolved.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before - The Problem */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <X className="w-4 h-4" />
                The Old Way
              </div>
              <h3 className="text-2xl font-bold mb-4">Classical Accuracy Ceiling</h3>
            </div>

            <div className="space-y-4">
              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-destructive mt-1" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">85-90% Accuracy Ceiling</h4>
                    <p className="text-sm text-muted-foreground">
                      Classical force fields cannot model quantum effects essential for accurate predictions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-destructive mt-1" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">72 Hours Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      SwissDock requires days for complex molecules, bottlenecking drug discovery pipelines.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/20 bg-destructive/5">
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 text-destructive mt-1" />
                  <div>
                    <h4 className="font-semibold text-destructive mb-2">$2.8B Failed Predictions</h4>
                    <p className="text-sm text-muted-foreground">
                      Industry loses billions annually due to inaccurate classical docking predictions.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* After - The Solution */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-molecular-green/10 text-molecular-green px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <CheckCircle className="w-4 h-4" />
                The Quantum Way
              </div>
              <h3 className="text-2xl font-bold mb-4">Quantum Breakthrough</h3>
            </div>

            <div className="space-y-4">
              <Card className="p-6 border-molecular-green/20 bg-molecular-green/5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-molecular-green mt-1" />
                  <div>
                    <h4 className="font-semibold text-molecular-green mb-2">2 Minutes Quantum Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantum algorithms simulate electron correlations impossible for classical computers.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-molecular-blue/20 bg-molecular-blue/5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-molecular-blue mt-1" />
                  <div>
                    <h4 className="font-semibold text-molecular-blue mb-2">99.2% Quantum Accuracy</h4>
                    <p className="text-sm text-muted-foreground">
                      Breaking through classical barriers with quantum mechanical precision modeling.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-molecular-teal/20 bg-molecular-teal/5">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-molecular-teal mt-1" />
                  <div>
                    <h4 className="font-semibold text-molecular-teal mb-2">Starting at $29/month</h4>
                    <p className="text-sm text-muted-foreground">
                      No setup costs, no hardware requirements. Just upload your molecules and get results.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-molecular-blue/10 to-molecular-teal/10 p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Join 500+ quantum pioneers advancing drug discovery
            </h3>
            <p className="text-lg text-muted-foreground">
              "We thought SwissDock was state-of-the-art until we tried quantum docking. 
              The 99%+ accuracy has revolutionized our lead compound identification."
            </p>
            <div className="mt-4 font-semibold text-molecular-blue">
              - Dr. Sarah Chen, Lead Researcher at QuantumPharma Labs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};