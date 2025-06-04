import React from 'react';

const MetricsDisplay = ({ metrics }) => (
  <div className="border-t border-gray-600 pt-3 mt-3">
    <h3 className="text-xs font-medium text-gray-300 mb-2">Metrics</h3>
    <div className="grid grid-cols-1 gap-2">
      <div className="flex justify-between">
        <span className="text-xs text-gray-300">Max Amplitude:</span>
        <span className="text-xs text-gray-300">{metrics.maxAmplitude}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-300">Total Energy:</span>
        <span className="text-xs text-gray-300">{metrics.totalEnergy}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-300">Updates/sec:</span>
        <span className="text-xs text-gray-300">{metrics.updatesPerSecond}</span>
      </div>
    </div>
  </div>
);

export default MetricsDisplay;
