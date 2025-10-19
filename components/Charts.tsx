"use client";

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProgressData, Chromosome } from '../types';

interface OptimizationChartProps {
  data: ProgressData[];
}

export const OptimizationChart: React.FC<OptimizationChartProps> = ({ data }) => {
  return (
    <div className="w-full h-64 mt-4">
      <h3 className="text-lg font-semibold text-center mb-2">Fitness over Generations</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="generation" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
          <Legend />
          <Line type="monotone" dataKey="bestFitness" stroke="#48BB78" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="avgFitness" stroke="#4299E1" strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BufferAllocationChartProps {
  data: Chromosome;
}

export const BufferAllocationChart: React.FC<BufferAllocationChartProps> = ({ data }) => {
  const chartData = data.map((value, index) => ({
    name: `Station ${index + 1}-${index + 2}`,
    buffers: value,
  }));

  return (
    <div className="w-full h-64 mt-6">
      <h3 className="text-lg font-semibold text-center mb-2">Optimal Buffer Allocation</h3>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="name" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
          <Bar dataKey="buffers" fill="#63B3ED" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
