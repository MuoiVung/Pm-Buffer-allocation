import type { Chromosome, Population, GASettings, OptimizationParams, ProgressData, OptimizationResult } from '../types';

// Mock throughput prediction function (simulating an ML model)
// This function rewards balanced buffer allocations and shows diminishing returns.
const predictThroughput = (buffers: Chromosome): number => {
  if (buffers.length === 0) return 0;
  const totalBuffers = buffers.reduce((sum, b) => sum + b, 0);
  if (totalBuffers === 0) return 50; // Base throughput for no buffers

  const mean = totalBuffers / buffers.length;
  const variance = buffers.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) / buffers.length;
  const stdDev = Math.sqrt(variance);

  // Base throughput with diminishing returns
  const baseThroughput = 1000 * (1 - Math.exp(-0.05 * totalBuffers));

  // Penalty for imbalance (higher std dev -> higher penalty)
  const imbalancePenalty = 1 + stdDev / (mean + 1);

  return baseThroughput / imbalancePenalty;
};

// Calculate fitness based on the combined objective function
const calculateFitness = (chromosome: Chromosome, w1: number, w2: number): number => {
  const throughput = predictThroughput(chromosome);
  const totalBuffers = chromosome.reduce((sum, b) => sum + b, 0);
  return w1 * throughput - w2 * totalBuffers;
};

// Create a single random, valid individual (chromosome)
const createIndividual = (numBufferSlots: number, totalBuffers: number): Chromosome => {
  if (numBufferSlots <= 0) return [];
  const individual: Chromosome = new Array(numBufferSlots).fill(0);
  let remainingBuffers = totalBuffers;
  
  while (remainingBuffers > 0) {
    const slot = Math.floor(Math.random() * numBufferSlots);
    individual[slot]++;
    remainingBuffers--;
  }

  return individual;
};

// Initialize the population
const initializePopulation = (popSize: number, numBufferSlots: number, totalBuffers: number): Population => {
  return Array.from({ length: popSize }, () => createIndividual(numBufferSlots, totalBuffers));
};

// Tournament selection
const tournamentSelection = (population: Population, fitnesses: number[], tournamentSize: number): Chromosome => {
  let best = null;
  let bestFitness = -Infinity;

  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (fitnesses[randomIndex] > bestFitness) {
      bestFitness = fitnesses[randomIndex];
      best = population[randomIndex];
    }
  }
  return best!;
};

// Single-point crossover with repair mechanism to maintain total buffer constraint
const crossover = (parent1: Chromosome, parent2: Chromosome, totalBuffers: number): [Chromosome, Chromosome] => {
    const size = parent1.length;
    if (size <= 1) return [[...parent1], [...parent2]];
    
    const crossoverPoint = Math.floor(Math.random() * (size - 1)) + 1;
    const offspring1: Chromosome = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
    const offspring2: Chromosome = parent2.slice(0, crossoverPoint).concat(parent1.slice(crossoverPoint));

    const repair = (child: Chromosome): Chromosome => {
        let currentSum = child.reduce((a, b) => a + b, 0);
        while(currentSum !== totalBuffers) {
            if (currentSum > totalBuffers) {
                const indexToReduce = child.findIndex(val => val > 0);
                if(indexToReduce !== -1) {
                    child[indexToReduce]--;
                    currentSum--;
                } else { // Should not happen with valid parents, but as a safeguard
                    return createIndividual(size, totalBuffers);
                }
            } else {
                const indexToIncrease = Math.floor(Math.random() * size);
                child[indexToIncrease]++;
                currentSum++;
            }
        }
        return child;
    }

    return [repair(offspring1), repair(offspring2)];
};


// Mutation that preserves the total buffer sum
const mutate = (chromosome: Chromosome): Chromosome => {
  if (chromosome.length <= 1) return chromosome;
  
  const mutated = [...chromosome];
  const idx1 = Math.floor(Math.random() * mutated.length);
  
  if (mutated[idx1] > 0) {
      const idx2 = Math.floor(Math.random() * mutated.length);
      mutated[idx1]--;
      mutated[idx2]++;
  }

  return mutated;
};

// Main function to run the Genetic Algorithm
export async function* runGA(
  params: OptimizationParams,
  settings: GASettings,
): AsyncGenerator<ProgressData, OptimizationResult, void> {
  const { numStations, totalBuffers, w1, w2 } = params;
  const { populationSize, generations, mutationRate, crossoverRate, tournamentSize } = settings;
  const numBufferSlots = numStations - 1;

  if (numBufferSlots <= 0) {
    return {
      bestAllocation: [],
      predictedThroughput: 0,
      totalBuffersUsed: 0,
      bestFitness: -Infinity,
    };
  }

  let population = initializePopulation(populationSize, numBufferSlots, totalBuffers);
  let bestEver: Chromosome = population[0];
  let bestFitnessEver = -Infinity;

  for (let gen = 0; gen < generations; gen++) {
    const fitnesses = population.map(ind => calculateFitness(ind, w1, w2));

    let currentBestFitness = -Infinity;
    let currentBestIndividual: Chromosome | null = null;
    let totalFitness = 0;

    for (let i = 0; i < population.length; i++) {
      totalFitness += fitnesses[i];
      if (fitnesses[i] > currentBestFitness) {
        currentBestFitness = fitnesses[i];
        currentBestIndividual = population[i];
      }
    }
    
    if (currentBestFitness > bestFitnessEver) {
      bestFitnessEver = currentBestFitness;
      bestEver = currentBestIndividual!;
    }
    
    const newPopulation: Population = [];
    
    // Elitism: carry over the best individual
    newPopulation.push(bestEver);
    
    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelection(population, fitnesses, tournamentSize);
      let offspring1 = parent1, offspring2;

      if (Math.random() < crossoverRate) {
        const parent2 = tournamentSelection(population, fitnesses, tournamentSize);
        [offspring1, offspring2] = crossover(parent1, parent2, totalBuffers);
        if (Math.random() < mutationRate) {
            offspring2 = mutate(offspring2);
        }
        if (newPopulation.length < populationSize) {
            newPopulation.push(offspring2);
        }
      }

      if (Math.random() < mutationRate) {
        offspring1 = mutate(offspring1);
      }
      newPopulation.push(offspring1);
    }

    population = newPopulation.slice(0, populationSize);

    yield {
      generation: gen + 1,
      bestFitness: bestFitnessEver,
      avgFitness: totalFitness / population.length,
    };
    
    // Yield to the event loop to prevent freezing the UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return {
    bestAllocation: bestEver,
    predictedThroughput: predictThroughput(bestEver),
    totalBuffersUsed: bestEver.reduce((a, b) => a + b, 0),
    bestFitness: bestFitnessEver,
  };
}
