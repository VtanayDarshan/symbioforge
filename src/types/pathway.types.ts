export interface ProcessStep {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  temperatureCelsius: number | null;
  pressureBar: number | null;
}

export interface Equipment {
  name: string;
  specification: string;
  costInr: number;
  supplier: string;
}

export interface ManufacturingPathway {
  id: string;
  opportunityId: string;
  opportunityType: 'match' | 'product';
  title: string;
  steps: ProcessStep[];
  equipment: Equipment[];
  facilitySqft: number;
  powerKw: number;
  waterLitersPerDay: number;
  workers: number;
  setupCapexInr: number;
  setupTimelineMonths: number;
  regulatoryNotes: string[];
  scalingPathway: string;
  designedAt: string;
}
