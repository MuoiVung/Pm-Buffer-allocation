
export interface GASettings {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  tournamentSize: number;
}

export interface OptimizationParams {
  numStations: number;
  totalBuffers: number;
  w1: number;
  w2: number;
}

export type Chromosome = number[];
export type Population = Chromosome[];

export interface OptimizationResult {
  bestAllocation: Chromosome;
  predictedThroughput: number;
  totalBuffersUsed: number;
  bestFitness: number;
}

export interface ProgressData {
  generation: number;
  bestFitness: number;
  avgFitness: number;
}
