import React from 'react';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EnergyData {
  pose: number;
  total: number;
  inter: number;
  intra: number;
  torsions: number;
  intraBestPose: number;
}

interface EnergyTableProps {
  energyData: EnergyData[];
}

const EnergyTable: React.FC<EnergyTableProps> = ({ energyData }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Docking Pose Energies (kcal/mol)
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Pose</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Inter</TableHead>
              <TableHead className="text-right">Intra</TableHead>
              <TableHead className="text-right">Torsions</TableHead>
              <TableHead className="text-right">Intra Best Pose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {energyData.map((row) => (
              <TableRow key={row.pose} className={row.pose === 0 ? "bg-molecular-green/5" : ""}>
                <TableCell className="font-medium">{row.pose}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className={row.pose === 0 ? "font-semibold text-molecular-green" : ""}>
                    {row.total.toFixed(3)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{row.inter.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.intra.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.torsions.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.intraBestPose.toFixed(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Note:</strong> Pose 0 represents the best binding pose with the lowest total energy.
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div>
            <strong>Total:</strong> Overall binding energy<br/>
            <strong>Inter:</strong> Intermolecular energy
          </div>
          <div>
            <strong>Intra:</strong> Intramolecular energy<br/>
            <strong>Torsions:</strong> Torsional energy penalty
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnergyTable;
