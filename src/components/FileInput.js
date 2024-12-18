// FileInput.js
import React from 'react';

function FileInput({ onFileData }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.trim().split('\n');
      const n = parseInt(lines[0]);
      const lineCoords = lines.slice(1, n + 1).map(line => line.split(' '));
      const windowCoords = lines[n + 1].split(' ');

      onFileData({
        lines: lineCoords,
        window: windowCoords
      });
    };

    reader.readAsText(file);
  };

  return (
    <input 
      type="file" 
      accept=".txt"
      onChange={handleFileChange}
    />
  );
}

export default FileInput;