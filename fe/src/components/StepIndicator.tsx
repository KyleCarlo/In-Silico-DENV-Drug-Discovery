import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Select Files", description: "Choose protein and ligand files" },
    { id: 2, label: "Define Search Space", description: "Set docking parameters" },
    { id: 3, label: "View Results", description: "Analyze docking outcomes" },
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep > step.id
                  ? "bg-molecular-green text-white"
                  : currentStep === step.id
                  ? "bg-molecular-blue text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-4 h-4" />
              ) : currentStep === step.id ? (
                <Clock className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{step.label}</div>
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? "bg-molecular-green" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
