// App.js
import React, { useState } from 'react';
import './App.css';
import ClippingCanvas from './components/ClippingCanvas';
import FileInput from './components/FileInput';
import AlgorithmSelector from './components/AlgorithmSelector';

function App() {
  const [lines, setLines] = useState([]);
  const [clipWindow, setClipWindow] = useState(null);
  const [algorithm, setAlgorithm] = useState('cohen-sutherland');

  const handleFileData = (data) => {
    const lines = data.lines.map(line => ({
      x1: parseFloat(line[0]),
      y1: parseFloat(line[1]),
      x2: parseFloat(line[2]),
      y2: parseFloat(line[3])
    }));
    
    setLines(lines);
    setClipWindow({
      xmin: parseFloat(data.window[0]),
      ymin: parseFloat(data.window[1]),
      xmax: parseFloat(data.window[2]),
      ymax: parseFloat(data.window[3])
    });
  };

  return (
    <div className="App">
      <h1>Алгоритмы отсечения</h1>
      <div className="controls">
        <FileInput onFileData={handleFileData} />
        <AlgorithmSelector 
          algorithm={algorithm} 
          onAlgorithmChange={setAlgorithm}
        />
      </div>
      <ClippingCanvas 
        lines={lines}
        clipWindow={clipWindow}
        algorithm={algorithm}
      />
    </div>
  );
}

export default App;