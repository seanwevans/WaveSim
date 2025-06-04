import React from 'react';
import ControlsSidebar from './components/ControlsSidebar.jsx';
import useWaveSimulation from './useWaveSimulation.js';

const App = () => {
  const width = 800;
  const height = 800;
  const gridSize = 200;

  const simulation = useWaveSimulation({ width, height, gridSize });

  return (
    <div className="flex flex-row items-start p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="mr-4">
        <div className="relative">
          <canvas
            ref={simulation.canvasRef}
            width={width}
            height={height}
            onClick={simulation.handleCanvasClick}
            onMouseDown={simulation.handleMouseDown}
            onMouseMove={simulation.handleMouseMove}
            onMouseUp={simulation.handleMouseUp}
            onMouseLeave={simulation.handleMouseUp}
            className="border border-gray-400 bg-blue-400 cursor-pointer"
          />
        </div>
      </div>
      <ControlsSidebar
        isRunning={simulation.isRunning}
        toggleSimulation={simulation.toggleSimulation}
        resetSimulation={simulation.resetSimulation}
        obstacleMode={simulation.obstacleMode}
        setObstacleMode={simulation.setObstacleMode}
        showControls={simulation.showControls}
        setShowControls={simulation.setShowControls}
        damping={simulation.damping}
        setDamping={simulation.setDamping}
        amplitude={simulation.amplitude}
        setAmplitude={simulation.setAmplitude}
        speed={simulation.speed}
        setSpeed={simulation.setSpeed}
        obstacleRadius={simulation.obstacleRadius}
        setObstacleRadius={simulation.setObstacleRadius}
        colorScheme={simulation.colorScheme}
        setColorScheme={simulation.setColorScheme}
        boundaryType={simulation.boundaryType}
        setBoundaryType={simulation.setBoundaryType}
        metrics={simulation.metrics}
      />
    </div>
  );
};

export default App;
