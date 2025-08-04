import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Play } from "lucide-react";

interface ProteinInfo {
  id?: string;
  name: string;
}

interface LigandInfo {
  id?: string;
  name: string;
  smiles?: string;
}

interface FileUploadSectionProps {
  proteins: ProteinInfo[];
  ligands: LigandInfo[];
  selectedProtein: string;
  selectedLigand: string;
  proteinsLoading: boolean;
  ligandsLoading: boolean;
  onProteinSelection: (proteinId: string) => void;
  onLigandSelection: (ligandId: string) => void;
  onProteinUpload: () => void;
  onLigandUpload: () => void;
  onNext: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  proteins,
  ligands,
  selectedProtein,
  selectedLigand,
  proteinsLoading,
  ligandsLoading,
  onProteinSelection,
  onLigandSelection,
  onProteinUpload,
  onLigandUpload,
  onNext,
}) => {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold mb-2">New Quantum Analysis</h2>
        <p className="text-muted-foreground">
          Upload your protein and ligand structures for quantum-enhanced
          molecular docking
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Protein Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Protein Structure</h3>
          <div className="space-y-4">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-molecular-blue focus:border-transparent"
              value={selectedProtein}
              onChange={(e) => onProteinSelection(e.target.value)}
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
                  {protein.name}
                </option>
              ))}
            </select>
            <div
              className="border-2 border-dashed border-molecular-blue/20 rounded-lg p-8 text-center hover:border-molecular-blue/40 transition-colors cursor-pointer"
              onClick={onProteinUpload}
            >
              <Upload className="w-8 h-8 text-molecular-blue mx-auto mb-2" />
              <div className="text-sm font-medium">Upload PDB file</div>
              <div className="text-xs text-muted-foreground">
                Or drag and drop here
              </div>
            </div>
          </div>
        </Card>

        {/* Ligand Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ligand Structure</h3>
          <div className="space-y-4">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-molecular-teal focus:border-transparent"
              value={selectedLigand}
              onChange={(e) => onLigandSelection(e.target.value)}
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
            <div
              className="border-2 border-dashed border-molecular-teal/20 rounded-lg p-8 text-center hover:border-molecular-teal/40 transition-colors cursor-pointer"
              onClick={onLigandUpload}
            >
              <Upload className="w-8 h-8 text-molecular-teal mx-auto mb-2" />
              <div className="text-sm font-medium">Upload MOL/SDF file</div>
              <div className="text-xs text-muted-foreground">
                Or drag and drop here
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!selectedProtein || !selectedLigand}
          className="bg-molecular-blue hover:bg-molecular-blue/90"
        >
          <Play className="w-4 h-4 mr-2" />
          Continue to Search Space
        </Button>
      </div>
    </>
  );
};

export default FileUploadSection;
