
document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("canvas");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <marker id="arrowhead" markerWidth="10" markerHeight="7"
      refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="black" />
    </marker>
  `;
  svg.appendChild(defs);

  const centerX = 300;
  const centerY = 250;
  const radiusCircle = 30;
  const radiusTriangle = 150;
    
    // Función para calcular posiciones circulares
    function computeStatePositions(numStates, centerX, centerY, radius) {
      const positions = [];
      for (let i = 0; i < numStates; i++) {
        const angle = (2 * Math.PI * i) / numStates;
        positions.push({
          id: `q${i + 1}`,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }
      return positions;
    }

    // Función para dibujar un estado (círculo + etiqueta)
    function drawState(svg, state, radius) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", state.x);
      circle.setAttribute("cy", state.y);
      circle.setAttribute("r", radius);
      circle.setAttribute("class", "state");
      svg.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", state.x);
      label.setAttribute("y", state.y + 5); // +5 para centrar verticalmente el texto
      label.setAttribute("text-anchor", "middle"); // centrar horizontalmente
      label.setAttribute("class", "label");
      label.textContent = state.id;
      svg.appendChild(label);
    }
/*
  const states = [0, 1, 2].map(i => {
    const angle = (i * 120) * Math.PI / 180;
    return {
      id: `q${i + 1}`,
      x: centerX + radiusTriangle * Math.cos(angle),
      y: centerY + radiusTriangle * Math.sin(angle)
    };
  });

  states.forEach(state => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", state.x);
    circle.setAttribute("cy", state.y);
    circle.setAttribute("r", radiusCircle);
    circle.setAttribute("class", "state");
    svg.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", state.x);
    label.setAttribute("y", state.y);
    label.setAttribute("class", "label");
    label.textContent = state.id;
    svg.appendChild(label);
  });
 */

  // Función que calcula punto en curva cuadrática para t (0<=t<=1)
  function quadBezierPoint(t, p0, p1, p2) {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  }

  function drawDoubleCurve(from, to, label1 = "", label2 = "") {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / dist;
    const ny = dy / dist;

    const startX = from.x + nx * radiusCircle;
    const startY = from.y + ny * radiusCircle;
    const endX = to.x - nx * radiusCircle;
    const endY = to.y - ny * radiusCircle;
      

    const mx = (startX + endX) / 2;
    const my = (startY + endY) / 2;

    const px = -ny;
    const py = nx;
    
    const curvature = 40;
    const offset = 9;
      
    const startIda = {
        x: from.x + nx * radiusCircle + px * offset,
        y: from.y + ny * radiusCircle + py * offset
    };
    const endIda = {
        x: to.x - nx * radiusCircle + px * offset,
        y: to.y - ny * radiusCircle + py * offset
    };
    
      // Punto inicial y final para vuelta (to → from), desplazados lateralmente (opuesto)
      const endVuelta = {
        x: to.x - nx * radiusCircle - px * offset,
        y: to.y - ny * radiusCircle - py * offset
      };
      const startVuelta = {
        x: from.x + nx * radiusCircle - px * offset,
        y: from.y + ny * radiusCircle - py * offset
      };
      
    
      
      // Mismo lado de curvatura para ambas
      const mx1 = (startVuelta.x + endVuelta.x) / 2;
      const my1 = (startVuelta.y + endVuelta.y) / 2;
      const cxVuelta = mx1 - px * curvature;
      const cyVuelta = my1 - py * curvature;
      
    const mx2 = (startIda.x + endIda.x) / 2;
    const my2 = (startIda.y + endIda.y) / 2;
    const cxIda = mx2 + px * curvature;
    const cyIda = my2 + py * curvature;
      
    

    const cx1 = mx + px * curvature;
    const cy1 = my + py * curvature;

    const cx2 = mx - px * curvature;
    const cy2 = my - py * curvature;

    // Primer camino curva positiva
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", `M ${endIda.x} ${endIda.y} Q ${cxIda} ${cyIda} ${startIda.x} ${startIda.y}`);
    path1.setAttribute("class", "arrow");
    path1.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(path1);

    if(label1) {
      const p0 = { x: startX, y: startY };
      const p1 = { x: cx1, y: cy1 };
      const p2 = { x: endX, y: endY };
      const mid = quadBezierPoint(0.5, p0, p1, p2);
      const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text1.setAttribute("x", mid.x);
      text1.setAttribute("y", mid.y+2); // un poco arriba
      text1.setAttribute("class", "arrow-label");
      text1.textContent = label1;
      svg.appendChild(text1);
    }

    // Segundo camino curva negativa
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", `M ${startVuelta.x} ${startVuelta.y} Q ${cxVuelta} ${cyVuelta} ${endVuelta.x} ${endVuelta.y}`);
    path2.setAttribute("class", "arrow");
    path2.setAttribute("marker-end", "url(#arrowhead)");
    svg.appendChild(path2);

    if(label2) {
      const p0 = { x: endX, y: endY };
      const p1 = { x: cx2, y: cy2 };
      const p2 = { x: startX, y: startY };
      const mid = quadBezierPoint(0.5, p0, p1, p2);
      const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text2.setAttribute("x", mid.x);
      text2.setAttribute("y", mid.y+2);
      text2.setAttribute("class", "arrow-label");
      text2.textContent = label2;
      svg.appendChild(text2);
    }
  }

    
    function drawLoop(state, label = "") {
      const offset = 12;
      const majorRadius = 60; // vertical
      const minorRadius = 40;  // horizontal
      const angle = -90 * Math.PI / 180;

      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const tx = -ny;
      const ty = nx;

      const start = {
        x: state.x + nx * radiusCircle + tx * offset,
        y: state.y + ny * radiusCircle + ty * offset,
      };
      const end = {
        x: state.x + nx * radiusCircle - tx * offset,
        y: state.y + ny * radiusCircle - ty * offset,
      };

      // Control points para curva C (Bezier cúbica)
      const cp1 = {
        x: state.x + tx * minorRadius,
        y: state.y - radiusCircle - majorRadius,
      };
      const cp2 = {
        x: state.x - tx * minorRadius,
        y: state.y - radiusCircle - majorRadius,
      };

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${start.x} ${start.y} 
                 C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "arrow");
      path.setAttribute("marker-end", "url(#arrowhead)");
      svg.appendChild(path);

      if (label) {
        const midX = (cp1.x + cp2.x) / 2;
        const midY = (cp1.y + cp2.y) / 2;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY);
        text.setAttribute("class", "arrow-label");
        text.textContent = label;
        svg.appendChild(text);
      }
    }



    const transitions = [
      { from: "q1", to: "q3" },
      { from: "q3", to: "q1" }, // loop
      { from: "q1", to: "q2" },
      { from: "q2", to: "q1" }, // loop
      { from: "q2", to: "q3" },
      { from: "q3", to: "q2" }, // loop
    ];
    
    const states = computeStatePositions(6, centerX, centerY, radiusTriangle);

    // Dibujar estados
    states.forEach(state => {
      drawState(svg, state, radiusCircle);
    });

  drawDoubleCurve(states[0], states[1], "a", "b");
  drawDoubleCurve(states[2], states[4], "c", "d");
  drawDoubleCurve(states[3], states[5], "e", "f");

  drawLoop(states[1], "x");
  drawLoop(states[3], "y");
  drawLoop(states[5], "z");
    //drawLoop(states[0], "a");
});

