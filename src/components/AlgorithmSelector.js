// AlgorithmSelector.js
import React from 'react';

function AlgorithmSelector({ algorithm, onAlgorithmChange }) {
  return (
    <select 
      value={algorithm} 
      onChange={(e) => onAlgorithmChange(e.target.value)}
    >
      <option value="cohen-sutherland">Алгоритм Сазерленда-Коэна</option>
      <option value="sutherland-hodgman">Алгоритм отсечения многоугольника</option>
    </select>
  );
}

export default AlgorithmSelector;