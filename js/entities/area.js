import { worldToScreen } from '../canvas/coords.js';

export function detectAreas(nodes, walls) {
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);

  for (const w of walls) {
    if (adj.has(w.from) && adj.has(w.to)) {
      adj.get(w.from).push(w.to);
      adj.get(w.to).push(w.from);
    }
  }

  const cycles = [];
  const nodeIds = nodes.map(n => n.id);

  for (let si = 0; si < nodeIds.length; si++) {
    const start = nodeIds[si];
    const neighbors = adj.get(start) ?? [];

    for (const second of neighbors) {
      const path = [start, second];
      const visited = new Set(path);

      let found = dfs(adj, path, visited, start, 6);
      if (found) {
        const normalized = normalizeCycle(found);
        if (!hasDuplicate(cycles, normalized)) {
          cycles.push(normalized);
        }
      }
    }
  }

  return cycles;
}

function dfs(adj, path, visited, target, maxDepth) {
  if (path.length > maxDepth) return null;

  const current = path[path.length - 1];
  const neighbors = adj.get(current) ?? [];

  for (const next of neighbors) {
    if (next === target && path.length >= 3) {
      return [...path];
    }
    if (!visited.has(next)) {
      visited.add(next);
      path.push(next);
      const result = dfs(adj, path, visited, target, maxDepth);
      if (result) return result;
      path.pop();
      visited.delete(next);
    }
  }

  return null;
}

function normalizeCycle(cycle) {
  const minId = cycle.reduce((min, id) => id < min ? id : min, cycle[0]);
  const idx = cycle.indexOf(minId);
  const rotated = [...cycle.slice(idx), ...cycle.slice(0, idx)];
  const reversed = [rotated[0], ...[...rotated.slice(1)].reverse()];
  return rotated[1] < reversed[1] ? rotated : reversed;
}

function hasDuplicate(cycles, candidate) {
  const key = candidate.join(',');
  return cycles.some(c => c.join(',') === key);
}

export function drawAreaOverlay(ctx, area, nodes, camera) {
  if (!area.nodeIds || area.nodeIds.length < 3) return;

  const points = area.nodeIds.map(id => {
    const n = nodes.find(n => n.id === id);
    if (!n) return null;
    return worldToScreen(n.x, n.y, camera);
  }).filter(Boolean);

  if (points.length < 3) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = area.color;
  ctx.fill();

  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(area.name, cx, cy);
  ctx.restore();
}

export function drawAreasOverlay(ctx, areas, nodes, camera, showAreas) {
  if (!showAreas) return;
  for (const area of areas) {
    drawAreaOverlay(ctx, area, nodes, camera);
  }
}
