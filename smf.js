let globalTransitions = {};
let globalInitial = "";
let globalFinals = [];

document.getElementById("automatonForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const states = document.getElementById("states").value.split(",").map(s => s.trim());
  const alphabet = document.getElementById("alphabet").value.split(",").map(s => s.trim());
  const initial = document.getElementById("initial").value.trim();
  const finals = document.getElementById("finals").value.split(",").map(s => s.trim());
  const rawTransitions = document.getElementById("transitions").value.trim().split("\n");

    const transitions = {};
    const stransitions = {};
    rawTransitions.forEach(line => {
        const [from, symbolStr, to] = line.split(";").map(s => s.trim());
        if (!transitions[from]) transitions[from] = {};
        if (!transitions[from][symbolStr]) transitions[from][symbolStr] = [];
        transitions[from][symbolStr].push(to);
        
        const symbols = symbolStr.split(",").map(s => s.trim());
        if (!stransitions[from]) stransitions[from] = {};
        symbols.forEach(symbol => {
          if (!stransitions[from][symbol]) {
            stransitions[from][symbol] = [to];
          } else if (!stransitions[from][symbol].includes(to)) {
            stransitions[from][symbol].push(to);
          }
        });
      });
    

    
    
    
    
  drawAutomaton(states, alphabet, initial, finals, transitions);
    globalTransitions = stransitions;
    globalInitial = initial;
    globalFinals = finals;
    
    // Limpiar resultado de cadena previa si lo hubiera
    const resDiv = document.getElementById("resultado");
    if (resDiv) resDiv.textContent = "";
    
});

function drawAutomaton(states, alphabet, initialState, aceptStates, transitions) {
  const svg = document.getElementById("canvas");
  svg.innerHTML = "";

  // Definición del marcador - debe ir antes de usarlo
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7"
        refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
    `;
  svg.appendChild(defs);

  const centerX = 300;
  const centerY = 300;
  const radius = 200;
  const radiusCircle = 30;
  const angleStep = (2* Math.PI) / states.length;

  const positions = {};

  // Dibujar estados en círculo y guardar posiciones
  states.forEach((state, i) => {
    const angle = Math.PI + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions[state] = { x, y };

    // Estado
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radiusCircle);
    circle.setAttribute("class", "state");
    svg.appendChild(circle);
      
      // Segundo círculo si es estado final
      if (aceptStates.includes(state)) {
        const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        innerCircle.setAttribute("cx", x);
        innerCircle.setAttribute("cy", y);
        innerCircle.setAttribute("r", radiusCircle - 5);
        innerCircle.setAttribute("stroke", "black");
        innerCircle.setAttribute("fill", "none");
        innerCircle.setAttribute("stroke-width", "2");
        svg.appendChild(innerCircle);
      }
      
    // Nombre del estado
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "label");
    text.textContent = state;
    svg.appendChild(text);
  });

  // Flecha de entrada al estado inicial
    if (positions[initialState]) {
      const svg = document.getElementById("canvas");
      const entry = positions[initialState];
      const radiusCircle = 30; // radio del círculo del estado

      // Punto inicial (fuera del círculo, a la izquierda)
      const startX = entry.x - 100;
      const startY = entry.y;

      // Punto final (en el borde del círculo)
      const endX = entry.x - radiusCircle;
      const endY = entry.y;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${startX} ${startY} L ${endX} ${endY}`;  // línea recta desde start a end
      path.setAttribute("d", d);
      path.setAttribute("class", "arrow");
      path.setAttribute("marker-end", "url(#arrowhead)");
      path.setAttribute("stroke", "black");
      path.setAttribute("fill", "none");

      svg.appendChild(path);
    }



  
  const drawnPairs = new Set();

  // Dibujar transiciones
  for (const from in transitions) {
    for (const symbol in transitions[from]) {
      for (const to of transitions[from][symbol]) {
        const fromPos = positions[from];
        const toPos = positions[to];
        if (!fromPos || !toPos) continue;

        // Detectar si es loop
        if (from === to) {
          drawLoop(fromPos, symbol);
          continue;
        }

        // Detectar si hay transición opuesta
        const reverseExists = transitions[to] && Object.values(transitions[to]).some(arr => arr.includes(from));

        const pairKey = [from, to].sort().join("|");

        if (reverseExists && !drawnPairs.has(pairKey)) {
          // Doble curva
          const label1 = symbol;
          // Buscar símbolo inverso
          let label2 = "";
          for (const sym in transitions[to]) {
            if (transitions[to][sym].includes(from)) {
              label2 = sym;
              break;
            }
          }
          drawDoubleCurve(fromPos, toPos, label1, label2);
          drawnPairs.add(pairKey);
        } else if (!reverseExists) {
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const angle = Math.atan2(dy, dx);
            const offset = radiusCircle;
            const startX = fromPos.x + offset * Math.cos(angle);
            const startY = fromPos.y + offset * Math.sin(angle);
            const endX = toPos.x - offset * Math.cos(angle);
            const endY = toPos.y - offset * Math.sin(angle);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const d = `M ${startX} ${startY} L ${endX} ${endY}`;
            path.setAttribute("d", d);
            path.setAttribute("stroke", "black");
            path.setAttribute("fill", "none");
            path.setAttribute("marker-end", "url(#arrow)");
            path.setAttribute("class", "arrow");
            svg.appendChild(path);

            // Etiqueta en la mitad
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const labelX = (startX + endX) / 2 + 5;
            const labelY = (startY + endY) / 2 - 5;
            label.setAttribute("x", labelX);
            label.setAttribute("y", labelY);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-size", "14");
            label.textContent = symbol;
            svg.appendChild(label);

        }
      }
    }
  }
}

// Función que calcula punto en curva cuadrática
function quadBezierPoint(t, p0, p1, p2) {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
  return { x, y };
}

function drawDoubleCurve(from, to, label1 = "", label2 = "") {
  const svg = document.getElementById("canvas");
  const radiusCircle = 30;

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

  const endVuelta = {
    x: to.x - nx * radiusCircle - px * offset,
    y: to.y - ny * radiusCircle - py * offset
  };
  const startVuelta = {
    x: from.x + nx * radiusCircle - px * offset,
    y: from.y + ny * radiusCircle - py * offset
  };

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

  // Primer flecha
  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", `M ${endIda.x} ${endIda.y} Q ${cxIda} ${cyIda} ${startIda.x} ${startIda.y}`);
  path1.setAttribute("class", "arrow");
  path1.setAttribute("marker-end", "url(#arrow)");
  svg.appendChild(path1);

  if (label1) {
    const p0 = { x: startX, y: startY };
    const p1 = { x: cx1, y: cy1 };
    const p2 = { x: endX, y: endY };
    const mid = quadBezierPoint(0.5, p0, p1, p2);
    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text1.setAttribute("x", mid.x);
    text1.setAttribute("y", mid.y + 2);
    text1.setAttribute("class", "arrow-label");
    text1.textContent = label1;
    svg.appendChild(text1);
  }

  // Segunda flecha
  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", `M ${startVuelta.x} ${startVuelta.y} Q ${cxVuelta} ${cyVuelta} ${endVuelta.x} ${endVuelta.y}`);
  path2.setAttribute("class", "arrow");
  path2.setAttribute("marker-end", "url(#arrow)");
  svg.appendChild(path2);

  if (label2) {
    const p0 = { x: endX, y: endY };
    const p1 = { x: cx2, y: cy2 };
    const p2 = { x: startX, y: startY };
    const mid = quadBezierPoint(0.5, p0, p1, p2);
    const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text2.setAttribute("x", mid.x);
    text2.setAttribute("y", mid.y + 2);
    text2.setAttribute("class", "arrow-label");
    text2.textContent = label2;
    svg.appendChild(text2);
  }
}

function drawLoop(state, label = "") {
  const svg = document.getElementById("canvas");
  const radiusCircle = 30;

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
  path.setAttribute("marker-end", "url(#arrow)");
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











document.getElementById("checkStringBtn").addEventListener("click", () => {
  const cadena = document.getElementById("inputString").value.trim();

  if (!globalInitial || !globalTransitions || !globalFinals.length) {
    alert("Primero define el automata y visualízalo");
    return;
  }

  const resultado = aceptaCadenaAFN(cadena, globalTransitions, globalInitial, globalFinals);

  const divResultado = document.getElementById("resultado");
  if (resultado.aceptada) {
    divResultado.textContent = `La cadena "${cadena}" es aceptada por el automata.`;
  } else {
    divResultado.textContent = `La cadena "${cadena}" NO es aceptada. ${resultado.razon}`;
  }
});

// Función epsilon
const EPSILON = "ε";

function epsilonClosure(states, transitions) {
  const stack = [...states];
  const closure = new Set(states);

  while (stack.length > 0) {
    const state = stack.pop();
    const epsilons = transitions[state]?.[EPSILON] || [];
    for (const s of epsilons) {
      if (!closure.has(s)) {
        closure.add(s);
        stack.push(s);
      }
    }
  }

  return [...closure];
}

function aceptaCadenaAFN(cadena, transitions, initialState, finals) {
  let estadosActuales = epsilonClosure([initialState], transitions);
  let rutas = estadosActuales.map(s => [s]);

  for (let i = 0; i < cadena.length; i++) {
    let simbolo = cadena[i];
    let nuevasRutas = [];

    for (let ruta of rutas) {
      const ultimo = ruta[ruta.length - 1];
      const siguientes = transitions[ultimo]?.[simbolo] || [];

      for (let sig of siguientes) {
        const cierre = epsilonClosure([sig], transitions);
        for (const est of cierre) {
          nuevasRutas.push([...ruta, est]);
        }
      }
    }

    if (nuevasRutas.length === 0) {
      return {
        aceptada: false,
        rutas,
        razon: ``
      };
    }

    rutas = nuevasRutas;
  }

  const rutasAceptadas = rutas.filter(r => finals.includes(r[r.length - 1]));

  return {
    aceptada: rutasAceptadas.length > 0,
    rutas: rutasAceptadas.length > 0 ? rutasAceptadas : rutas,
    razon: rutasAceptadas.length > 0 ? "" : ""
  };
}
