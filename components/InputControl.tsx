
import React from 'react';

interface InputControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
}

const InputControl: React.FC<InputControlProps> = ({ label, value, onChange, step = 1, min = 0, max = 1000, tooltip }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.valueAsNumber || 0;
    onChange(numValue);
  };

  return (
    <div className="mb-4">
      <label className="flex items-center text-sm font-medium text-gray-300 mb-1" title={tooltip}>
        {label}
        {tooltip && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </label>
      <div className="flex items-center bg-gray-700 rounded-md">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="w-full bg-transparent text-white px-3 py-2 outline-none appearance-none"
          style={{ MozAppearance: 'textfield' }}
        />
      </div>
    </div>
  );
};

export default InputControl;
