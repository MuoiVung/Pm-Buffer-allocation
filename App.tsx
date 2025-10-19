import React, { useState, useCallback, useEffect } from 'react';
import { runGA } from './services/geneticAlgorithm';
import InputControl from './components/InputControl';
import ResultsDisplay from './components/ResultsDisplay';
import { OptimizationChart, BufferAllocationChart } from './components/Charts';
import type { GASettings, OptimizationParams, OptimizationResult, ProgressData } from './types';

const App: React.FC = () => {
  const [params, setParams] = useState<OptimizationParams>(() => {
    try {
      const savedParams = localStorage.getItem('bap_params');
      return savedParams ? JSON.parse(savedParams) : {
        numStations: 5,
        totalBuffers: 20,
        w1: 1.0,
        w2: 2.0,
      };
    } catch (error) {
      console.error("Failed to load params from localStorage", error);
      return {
        numStations: 5,
        totalBuffers: 20,
        w1: 1.0,
        w2: 2.0,
      };
    }
  });

  const [gaSettings, setGaSettings] = useState<GASettings>(() => {
    try {
      const savedGaSettings = localStorage.getItem('bap_gaSettings');
      return savedGaSettings ? JSON.parse(savedGaSettings) : {
        populationSize: 50,
        generations: 100,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        tournamentSize: 5,
      };
    } catch (error) {
      console.error("Failed to load GA settings from localStorage", error);
      return {
        populationSize: 50,
        generations: 100,
        mutationRate: 0.1,
        crossoverRate: 0.8,
        tournamentSize: 5,
      };
    }
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('bap_params', JSON.stringify(params));
    } catch (error) {
      console.error("Failed to save params to localStorage", error);
    }
  }, [params]);

  useEffect(() => {
    try {
      localStorage.setItem('bap_gaSettings', JSON.stringify(gaSettings));
    } catch (error) {
      console.error("Failed to save GA settings to localStorage", error);
    }
  }, [gaSettings]);


  const handleParamChange = useCallback((field: keyof OptimizationParams, value: number) => {
    setParams(p => ({ ...p, [field]: value }));
  }, []);

  const handleSettingChange = useCallback((field: keyof GASettings, value: number) => {
    setGaSettings(s => ({ ...s, [field]: value }));
  }, []);

  const handleRunOptimization = async () => {
    setIsRunning(true);
    setResult(null);
    setProgress([]);
    setCurrentGeneration(0);
    
    const progressUpdates: ProgressData[] = [];
    const gaRunner = runGA(params, gaSettings);

    // FIX: The original loop structure was causing issues with TypeScript's type inference
    // for the async generator's result. This revised loop structure helps the compiler
    // correctly narrow the type of `iteration.value` based on the `iteration.done` property.
    let iteration = await gaRunner.next();
    while (!iteration.done) {
      progressUpdates.push(iteration.value);
      setProgress([...progressUpdates]);
      setCurrentGeneration(iteration.value.generation);
      iteration = await gaRunner.next();
    }

    setResult(iteration.value);
    setIsRunning(false);
  };

  const MemoizedBufferAllocationChart = React.memo(BufferAllocationChart);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500">
            Buffer Allocation Optimizer
          </h1>
          <p className="text-gray-400 mt-2">
            Using a Genetic Algorithm to solve the Buffer Allocation Problem (BAP)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700">
            <div>
              <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Problem Parameters</h2>
              <InputControl label="Number of Stations (K)" value={params.numStations} onChange={v => handleParamChange('numStations', v)} min={2} max={20} tooltip="Total stations in the production line."/>
              <InputControl label="Total Available Buffers (B_Total)" value={params.totalBuffers} onChange={v => handleParamChange('totalBuffers', v)} min={1} max={500} tooltip="The maximum number of buffers to distribute."/>
              <InputControl label="Throughput Weight (w1)" value={params.w1} onChange={v => handleParamChange('w1', v)} step={0.1} min={0.1} max={10} tooltip="Importance of maximizing throughput."/>
              <InputControl label="Buffer Cost Weight (w2)" value={params.w2} onChange={v => handleParamChange('w2', v)} step={0.1} min={0.1} max={10} tooltip="Cost or importance of minimizing total buffers."/>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Genetic Algorithm Settings</h2>
              <InputControl label="Population Size" value={gaSettings.populationSize} onChange={v => handleSettingChange('populationSize', v)} min={10} max={200} step={10} tooltip="Number of solutions in each generation."/>
              <InputControl label="Generations" value={gaSettings.generations} onChange={v => handleSettingChange('generations', v)} min={10} max={1000} step={10} tooltip="Number of iterations for the algorithm to run."/>
              <InputControl label="Crossover Rate" value={gaSettings.crossoverRate} onChange={v => handleSettingChange('crossoverRate', v)} step={0.05} min={0} max={1} tooltip="Probability of two parents creating offspring."/>
              <InputControl label="Mutation Rate" value={gaSettings.mutationRate} onChange={v => handleSettingChange('mutationRate', v)} step={0.05} min={0} max={1} tooltip="Probability of random changes in a solution."/>
            </div>
            <button
              onClick={handleRunOptimization}
              disabled={isRunning}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-500 to-green-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-green-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running... (Gen: {currentGeneration}/{gaSettings.generations})
                </>
              ) : "Run Optimization"}
            </button>
          </div>

          {/* Results and Charts Column */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700">
            {isRunning && <OptimizationChart data={progress} />}
            {!isRunning && !result && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Set parameters and run the optimization to see results.</p>
              </div>
            )}
            {result && (
              <div>
                <ResultsDisplay result={result} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <OptimizationChart data={progress} />
                  <MemoizedBufferAllocationChart data={result.bestAllocation} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;