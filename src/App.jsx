import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const width = 800;
  const height = 800;  
  const gridSize = 200;
  const cellSize = width / gridSize;
  
  const [isRunning, setIsRunning] = useState(true);
  const [obstacleMode, setObstacleMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const [damping, setDamping] = useState(0.99);
  const [amplitude, setAmplitude] = useState(5);
  const [speed, setSpeed] = useState(0.5);
  const [obstacleRadius, setObstacleRadius] = useState(1);
  
  const [colorScheme, setColorScheme] = useState('neon');
  const [boundaryType, setBoundaryType] = useState('reflecting');
    
  const [obstacles, setObstacles] = useState([]);  
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [metrics, setMetrics] = useState({
    maxAmplitude: 0,
    totalEnergy: 0,
    updatesPerSecond: 0
  });
  
  const fpsRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0
  });
  
  const waveArrayRef = useRef({
    current: Array(gridSize).fill().map(() => Array(gridSize).fill(0)),
    previous: Array(gridSize).fill().map(() => Array(gridSize).fill(0)),
    next: Array(gridSize).fill().map(() => Array(gridSize).fill(0))
  });
    
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  const hsvToRgb = (h, s, v) => {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }; 
  
  const createRipple = (x, y) => {
    const waveData = waveArrayRef.current;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const posX = gridX + i;
        const posY = gridY + j;
        
        if (posX >= 0 && posX < gridSize && posY >= 0 && posY < gridSize) {
          const distance = Math.sqrt(i * i + j * j);
          const intensity = amplitude * Math.max(0, 1 - distance / 3);
          waveData.current[posY][posX] = intensity;
        }
      }
    }
  };
  
  const createObstacle = (x, y) => {
    setObstacles(prev => [...prev, { x, y, radius: obstacleRadius }]);
  };
  
  const removeObstacle = (x, y) => {
    const clickedObstacleIndex = obstacles.findIndex(obstacle => {
      const dx = x - obstacle.x;
      const dy = y - obstacle.y;
      return dx * dx + dy * dy <= obstacle.radius * obstacle.radius;
    });
    
    if (clickedObstacleIndex !== -1) {
      setObstacles(prev => {
        const newObstacles = [...prev];
        newObstacles.splice(clickedObstacleIndex, 1);
        return newObstacles;
      });
      return true;
    }
    
    return false;
  };
  
  const isInsideObstacle = (i, j) => {
    const x = j * cellSize;
    const y = i * cellSize;
    
    for (const obstacle of obstacles) {
      const dx = x - obstacle.x;
      const dy = y - obstacle.y;
      if (dx * dx + dy * dy <= obstacle.radius * obstacle.radius) {
        return true;
      }
    }
    
    return false;
  };
  
  const handleMouseDown = (e) => {
    if (!obstacleMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
        
    if (e.shiftKey) {
      removeObstacle(x, y);
    } else {
      createObstacle(x, y);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!obstacleMode || !isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
        
    if (e.shiftKey) {
      removeObstacle(x, y);
    } else {
      createObstacle(x, y);
    }
  };
  
  const handleMouseUp = () => {
    setIsDrawing(false);
  };
    
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (obstacleMode) {
      if (e.shiftKey) {
        const removed = removeObstacle(x, y);
        if (!removed) {
          createObstacle(x, y);
        }
      } else {
        createObstacle(x, y);
      }
    } else {      
      const insideObstacle = obstacles.some(obstacle => {
        const dx = x - obstacle.x;
        const dy = y - obstacle.y;
        return dx * dx + dy * dy <= obstacle.radius * obstacle.radius;
      });
      
      if (!insideObstacle) {
        createRipple(x, y);
      }
    }
  };
    
  const applyBoundaryConditions = (grid) => {
    const type = boundaryType;
    switch (type) {
      case 'absorbing':
        for (let i = 0; i < gridSize; i++) {
          grid[i][0] = 0;
          grid[i][gridSize-1] = 0;
          grid[0][i] = 0;
          grid[gridSize-1][i] = 0;
        }
        break;
        
      case 'reflecting':
        for (let i = 1; i < gridSize - 1; i++) {
          grid[i][0] = grid[i][1];
          grid[i][gridSize-1] = grid[i][gridSize-2];
          grid[0][i] = grid[1][i];
          grid[gridSize-1][i] = grid[gridSize-2][i];
        }        
        grid[0][0] = (grid[0][1] + grid[1][0]) / 2;
        grid[0][gridSize-1] = (grid[0][gridSize-2] + grid[1][gridSize-1]) / 2;
        grid[gridSize-1][0] = (grid[gridSize-2][0] + grid[gridSize-1][1]) / 2;
        grid[gridSize-1][gridSize-1] = (grid[gridSize-2][gridSize-1] + grid[gridSize-1][gridSize-2]) / 2;
        break;
        
      case 'periodic':        
        for (let i = 1; i < gridSize - 1; i++) {
          grid[i][0] = grid[i][gridSize-2];
          grid[i][gridSize-1] = grid[i][1];
          grid[0][i] = grid[gridSize-2][i];
          grid[gridSize-1][i] = grid[1][i];
        }        
        grid[0][0] = grid[gridSize-2][gridSize-2];
        grid[0][gridSize-1] = grid[gridSize-2][1];
        grid[gridSize-1][0] = grid[1][gridSize-2];
        grid[gridSize-1][gridSize-1] = grid[1][1];
        break;
        
      default:        
        for (let i = 0; i < gridSize; i++) {
          grid[i][0] = 0;
          grid[i][gridSize-1] = 0;
          grid[0][i] = 0;
          grid[gridSize-1][i] = 0;
        }
    }
  };
    
  useEffect(() => {
    if (!isRunning) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const waveData = waveArrayRef.current;
      const fps = fpsRef.current;
            
      fps.frameCount++;
      const now = performance.now();
      const elapsed = now - fps.lastTime;
      
      if (elapsed >= 1000) {
        fps.fps = Math.round((fps.frameCount * 1000) / elapsed);
        fps.frameCount = 0;
        fps.lastTime = now;
      }
            
      let maxAmp = 0;
      let energy = 0;
      
      for (let i = 1; i < gridSize - 1; i++) {
        for (let j = 1; j < gridSize - 1; j++) {      
          if (isInsideObstacle(i, j)) {
            waveData.next[i][j] = 0;
            continue;
          }
         
          const laplacian = 
              waveData.current[i+1][j] +
              waveData.current[i-1][j] +
              waveData.current[i][j+1] +
              waveData.current[i][j-1] -
              4 * waveData.current[i][j];
            
            waveData.next[i][j] = 
              2 * waveData.current[i][j] - waveData.previous[i][j] +
              (speed * speed) * laplacian;
                    
          waveData.next[i][j] *= damping;
                    
          const value = Math.abs(waveData.next[i][j]);
          maxAmp = Math.max(maxAmp, value);
          energy += value * value;
        }
      }
            
      applyBoundaryConditions(waveData.next);
            
      setMetrics({
        maxAmplitude: maxAmp.toFixed(2),
        totalEnergy: energy.toFixed(2),
        updatesPerSecond: fps.fps
      });
            
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {          
          const value = waveData.next[i][j];                    
          let r, g, b;
          const normalized = Math.min(1, Math.max(-1, value));
          const mappedValue = Math.floor(128 + normalized * 128);
          
          switch (colorScheme) {
            case 'ocean': // Blue to white
              r = g = mappedValue;
              b = 255;
              break;
            case 'fire': // Red to yellow
              r = 255;
              g = mappedValue;
              b = Math.floor(mappedValue / 2);
              break;
            case 'monochrome': // Black to white
              r = g = b = mappedValue;
              break;
            case 'rainbow': { // Full spectrum
              const hue = (mappedValue / 255) * 360;
              [r, g, b] = hsvToRgb(hue, 0.8, 0.9);
              break;
            }
            case 'emerald': // Green to white
              r = mappedValue;
              g = 255;
              b = mappedValue;
              break;
            case 'violet': // Purple to white
              r = mappedValue;
              g = Math.floor(mappedValue / 2);
              b = 255;
              break;
            case 'sunset': // Orange to purple
              r = 255;
              g = Math.floor(128 + (normalized * -128));
              b = Math.floor(128 + (normalized * 128));
              break;
            case 'thermal':
              // Cold (blue) to hot (red)
              r = Math.min(255, Math.floor(mappedValue * 2));
              g = Math.min(255, Math.max(0, Math.floor(128 - Math.abs(mappedValue - 128))));
              b = Math.max(0, Math.floor(255 - mappedValue * 2));
              break;
            case 'neon': {
              // Bright neon colors
              const hue2 = (mappedValue / 255) * 360;
              [r, g, b] = hsvToRgb(hue2, 1.0, normalized > 0 ? 1.0 : 0.5);
              break;
            }
            default:
              r = g = mappedValue;
              b = 255;
          }
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
            
      ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      
      for (const obstacle of obstacles) {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      
      [waveData.previous, waveData.current, waveData.next] = [waveData.current, waveData.next, waveData.previous];
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, damping, speed, cellSize, colorScheme, boundaryType, amplitude, obstacles]);
    
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
    
  const resetSimulation = () => {
    const waveData = waveArrayRef.current;
    waveData.current = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    waveData.previous = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    waveData.next = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
    if (obstacles.length > 0 && confirm("Clear obstacles too?")) {
      setObstacles([]);
    }
  };
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  return (
    <div className="flex flex-row items-start p-4 bg-gray-100 rounded-lg shadow-md">
      <div className="mr-4">
                
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border border-gray-400 bg-blue-400 cursor-pointer"
          />
        </div>
        
      </div>
      
      <div className="w-64 bg-gray-800 p-3 rounded-lg text-white">
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-2">
            <button
              onClick={toggleSimulation}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? "⏸" : "▶️"}
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
              className={`w-8 h-8 flex items-center justify-center ${obstacleMode ? 'bg-green-500' : 'bg-gray-600'} text-white rounded hover:bg-green-600 text-sm`}
              title={obstacleMode ? "Exit Obstacle Mode" : "Enter Obstacle Mode"}
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
            ? "Click to add obstacles, Shift+Click to remove" 
            : "Click anywhere to create waves"}
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
          </>
        )}
      </div>
    </div>
  );
};

export default App;
