import React from 'react';
import MetricsDisplay from './MetricsDisplay.jsx';

const ControlsSidebar = ({
  isRunning,
  toggleSimulation,
  resetSimulation,
  obstacleMode,
  setObstacleMode,
  showControls,
  setShowControls,
  damping,
  setDamping,
  amplitude,
  setAmplitude,
  speed,
  setSpeed,
  obstacleRadius,
  setObstacleRadius,
  colorScheme,
  setColorScheme,
  boundaryType,
  setBoundaryType,
  metrics,
}) => (
  <div className="w-64 bg-gray-800 p-3 rounded-lg text-white">
    <div className="flex justify-between items-center mb-3">
      <div className="flex space-x-2">
        <button
          onClick={toggleSimulation}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          title={isRunning ? 'Pause' : 'Play'}
        >
          {isRunning ? '⏸' : '▶️'}
        </button>

        <button
          onClick={resetSimulation}
          className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          title="Reset"
        >
          ↺
        </button>

        <button
          onClick={() => setObstacleMode(!obstacleMode)}
          className={`w-8 h-8 flex items-center justify-center rounded text-sm ${obstacleMode ? 'bg-red-500' : 'bg-gray-500'} text-white`}
          title="Toggle Obstacles"
        >
          ◯
        </button>
      </div>
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-gray-700 rounded-full p-1 w-8 h-8 flex items-center justify-center"
      >
        {showControls ? '−' : '+'}
      </button>
    </div>

    <div className="text-xs text-gray-300 mb-3">
      {obstacleMode
        ? 'Click to add obstacles, Shift+Click to remove'
        : 'Click anywhere to create waves'}
    </div>

    {showControls && (
      <>
        <div className="space-y-3">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-300">Damping</label>
              <span className="text-xs text-gray-300">{damping.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.9"
              max="1.1"
              step="0.001"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full h-4"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-300">Amplitude</label>
              <span className="text-xs text-gray-300">{amplitude.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min=".1"
              max="10"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
              className="w-full h-4"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-300">Speed</label>
              <span className="text-xs text-gray-300">{speed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-4"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-300">Obstacle Radius</label>
              <span className="text-xs text-gray-300">{obstacleRadius}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={obstacleRadius}
              onChange={(e) => setObstacleRadius(parseInt(e.target.value))}
              className="w-full h-4"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1 text-gray-300">Color Scheme</label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value)}
              className="text-xs p-1 border rounded bg-gray-700 text-white border-gray-600"
            >
              <option value="ocean">Ocean</option>
              <option value="fire">Fire</option>
              <option value="monochrome">Monochrome</option>
              <option value="rainbow">Rainbow</option>
              <option value="emerald">Emerald</option>
              <option value="violet">Violet</option>
              <option value="sunset">Sunset</option>
              <option value="thermal">Thermal</option>
              <option value="neon">Neon</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium mb-1 text-gray-300">Boundary Conditions</label>
            <select
              value={boundaryType}
              onChange={(e) => setBoundaryType(e.target.value)}
              className="text-xs p-1 border rounded bg-gray-700 text-white border-gray-600"
            >
              <option value="absorbing">Absorbing</option>
              <option value="reflecting">Reflecting</option>
              <option value="periodic">Periodic</option>
            </select>
          </div>
        </div>

        <MetricsDisplay metrics={metrics} />
      </>
    )}
  </div>
);

export default ControlsSidebar;
