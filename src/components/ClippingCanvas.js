// ClippingCanvas.js
import React, { useEffect, useRef } from 'react';
import { cohenSutherland, sutherlandHodgman } from './algorithms';

function ClippingCanvas({ lines, clipWindow, algorithm }) {
  const canvasRef = useRef(null);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDING = 50;
  const GRID_STEP = 50; // Шаг сетки

  useEffect(() => {
    if (!lines.length || !clipWindow) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Находим масштаб
    const xValues = lines.flatMap(line => [line.x1, line.x2]);
    const yValues = lines.flatMap(line => [line.y1, line.y2]);
    const minX = Math.min(...xValues, clipWindow.xmin);
    const maxX = Math.max(...xValues, clipWindow.xmax);
    const minY = Math.min(...yValues, clipWindow.ymin);
    const maxY = Math.max(...yValues, clipWindow.ymax);

    const scaleX = (CANVAS_WIDTH - 2 * PADDING) / (maxX - minX);
    const scaleY = (CANVAS_HEIGHT - 2 * PADDING) / (maxY - minY);

    const transformX = x => PADDING + (x - minX) * scaleX;
    const transformY = y => CANVAS_HEIGHT - PADDING - (y - minY) * scaleY;

    // Рисуем сетку
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Вертикальные линии сетки
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
      if (x % (GRID_STEP/scaleX) === 0) {
        ctx.beginPath();
        ctx.moveTo(transformX(x), PADDING);
        ctx.lineTo(transformX(x), CANVAS_HEIGHT - PADDING);
        ctx.stroke();
        
        // Подписи по X
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(x.toFixed(0), transformX(x), CANVAS_HEIGHT - PADDING + 20);
      }
    }

    // Горизонтальные линии сетки
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
      if (y % (GRID_STEP/scaleY) === 0) {
        ctx.beginPath();
        ctx.moveTo(PADDING, transformY(y));
        ctx.lineTo(CANVAS_WIDTH - PADDING, transformY(y));
        ctx.stroke();
        
        // Подписи по Y
        ctx.textAlign = 'right';
        ctx.fillText(y.toFixed(0), PADDING - 10, transformY(y) + 5);
      }
    }

    // Рисуем оси
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    // Ось X
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
    // Стрелка X
    ctx.moveTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(CANVAS_WIDTH - PADDING - 10, CANVAS_HEIGHT - PADDING - 5);
    ctx.moveTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(CANVAS_WIDTH - PADDING - 10, CANVAS_HEIGHT - PADDING + 5);
    // Подпись оси X
    ctx.fillText("X", CANVAS_WIDTH - PADDING + 20, CANVAS_HEIGHT - PADDING + 5);

    // Ось Y
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
    ctx.lineTo(PADDING, PADDING);
    // Стрелка Y
    ctx.moveTo(PADDING, PADDING);
    ctx.lineTo(PADDING - 5, PADDING + 10);
    ctx.moveTo(PADDING, PADDING);
    ctx.lineTo(PADDING + 5, PADDING + 10);
    // Подпись оси Y
    ctx.fillText("Y", PADDING - 5, PADDING - 10);
    ctx.stroke();


    // Рисуем отсекающее окно
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      transformX(clipWindow.xmin),
      transformY(clipWindow.ymax),
      (clipWindow.xmax - clipWindow.xmin) * scaleX,
      (clipWindow.ymax - clipWindow.ymin) * scaleY
    );

    // Рисуем исходные линии
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(transformX(line.x1), transformY(line.y1));
      ctx.lineTo(transformX(line.x2), transformY(line.y2));
      ctx.stroke();
    });

    // Применяем алгоритм отсечения
    const clippedLines = algorithm === 'cohen-sutherland' 
      ? cohenSutherland(lines, clipWindow)
      : sutherlandHodgman(lines, clipWindow);

    // Применяем алгоритм отсечения для получения отсеченных линий
    const clippedPolygon = sutherlandHodgman(lines, clipWindow);

    // Заштриховываем область внутри отсеченного многоугольника
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Полупрозрачный зелёный цвет
ctx.beginPath();
clippedPolygon.forEach((point, index) => {
    const x = transformX(point.x);
    const y = transformY(point.y);
    if (index === 0) {
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
    }
});
ctx.closePath();
ctx.fill();


    // Рисуем отсеченные линии
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    clippedLines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(transformX(line.x1), transformY(line.y1));
      ctx.lineTo(transformX(line.x2), transformY(line.y2));
      ctx.stroke();
    });

    // Рисуем легенду
    const legendX = CANVAS_WIDTH - 200;
    const legendY = 30;
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    
    // Отсекающее окно
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fillText('Отсекающее окно', legendX + 40, legendY + 5);

    // Исходные линии
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 20);
    ctx.lineTo(legendX + 30, legendY + 20);
    ctx.stroke();
    ctx.fillText('Исходные линии', legendX + 40, legendY + 25);

    // Видимые части
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 40);
    ctx.lineTo(legendX + 30, legendY + 40);
    ctx.stroke();
    ctx.fillText('Видимые части', legendX + 40, legendY + 45);

  }, [lines, clipWindow, algorithm]);

  return (
    <div>
      <canvas 
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '1px solid black' }}
      />
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <h3>{algorithm === 'cohen-sutherland' ? 
          'Алгоритм Коэна-Сазерленда' : 
          'Алгоритм Сазерленда-Ходжмена'}</h3>
      </div>
    </div>
  );
}

export default ClippingCanvas;