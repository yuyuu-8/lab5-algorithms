// algorithms.js

// Коды положения точки относительно окна
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

// Функция определения кода точки
function computeCode(x, y, clipWindow) {
    let code = INSIDE;
    
    if (x < clipWindow.xmin)
        code |= LEFT;
    else if (x > clipWindow.xmax)
        code |= RIGHT;
    
    if (y < clipWindow.ymin)
        code |= BOTTOM;
    else if (y > clipWindow.ymax)
        code |= TOP;
    
    return code;
}

// Алгоритм Коэна-Сазерленда
export function cohenSutherland(lines, clipWindow) {
    const clippedLines = [];
    
    lines.forEach(line => {
        let x1 = line.x1;
        let y1 = line.y1;
        let x2 = line.x2;
        let y2 = line.y2;
        
        let code1 = computeCode(x1, y1, clipWindow);
        let code2 = computeCode(x2, y2, clipWindow);
        let accept = false;
        
        while (true) {
            if ((code1 === 0) && (code2 === 0)) {
                // Линия полностью внутри окна
                accept = true;
                break;
            } else if (code1 & code2) {
                // Линия полностью снаружи окна
                break;
            } else {
                // Линия частично внутри окна
                let x, y;
                let codeOut = code1 ? code1 : code2;
                
                // Находим точку пересечения
                if (codeOut & TOP) {
                    x = x1 + (x2 - x1) * (clipWindow.ymax - y1) / (y2 - y1);
                    y = clipWindow.ymax;
                } else if (codeOut & BOTTOM) {
                    x = x1 + (x2 - x1) * (clipWindow.ymin - y1) / (y2 - y1);
                    y = clipWindow.ymin;
                } else if (codeOut & RIGHT) {
                    y = y1 + (y2 - y1) * (clipWindow.xmax - x1) / (x2 - x1);
                    x = clipWindow.xmax;
                } else if (codeOut & LEFT) {
                    y = y1 + (y2 - y1) * (clipWindow.xmin - x1) / (x2 - x1);
                    x = clipWindow.xmin;
                }
                
                if (codeOut === code1) {
                    x1 = x;
                    y1 = y;
                    code1 = computeCode(x1, y1, clipWindow);
                } else {
                    x2 = x;
                    y2 = y;
                    code2 = computeCode(x2, y2, clipWindow);
                }
            }
        }
        
        if (accept) {
            clippedLines.push({x1, y1, x2, y2});
        }
    });
    
    return clippedLines;
}

// Алгоритм Сазерленда-Ходжмена
export function sutherlandHodgman(polygon, clipWindow) {
    const { xmin, xmax, ymin, ymax } = clipWindow;
  
    function clipEdge(points, edge) {
      const clipped = [];
      let prev = points[points.length - 1];
  
      points.forEach(curr => {
        const insidePrev = edge(prev);
        const insideCurr = edge(curr);
  
        if (insideCurr) {
          if (!insidePrev) {
            clipped.push(intersect(prev, curr, edge));
          }
          clipped.push(curr);
        } else if (insidePrev) {
          clipped.push(intersect(prev, curr, edge));
        }
  
        prev = curr;
      });
  
      return clipped;
    }
  
    function intersect(p1, p2, edge) {
      const t = (edge(p1) - edge(p2)) / ((p1.x - p2.x) || 1e-6);
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    }
  
    let clippedPolygon = polygon;
  
    clippedPolygon = clipEdge(clippedPolygon, p => p.x >= xmin); // Левая граница
    clippedPolygon = clipEdge(clippedPolygon, p => p.x <= xmax); // Правая граница
    clippedPolygon = clipEdge(clippedPolygon, p => p.y >= ymin); // Нижняя граница
    clippedPolygon = clipEdge(clippedPolygon, p => p.y <= ymax); // Верхняя граница
  
    return clippedPolygon;
}