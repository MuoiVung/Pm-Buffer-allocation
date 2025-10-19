import React from 'react';
import type { OptimizationResult } from '../types';

interface ResultsDisplayProps {
  result: OptimizationResult | null;
}

const ResultItem: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-700">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold text-lg text-green-400">{value}</span>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-white">Optimization Complete</h2>
      <div className="space-y-2">
        <ResultItem label="Best Fitness Score" value={result.bestFitness.toFixed(2)} />
        <ResultItem label="Predicted Throughput" value={result.predictedThroughput.toFixed(2)} />
        <ResultItem label="Total Buffers Used" value={result.totalBuffersUsed} />
        <div className="pt-3">
          <span className="text-gray-400">Best Allocation</span>
          <p className="font-mono text-center mt-2 text-lg bg-gray-900 p-3 rounded-md text-blue-300">
            {`[ ${result.bestAllocation.join(', ')} ]`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
