export const COL = 0.5;
const SLACK = 1e-6;

export function project(positions, e, f, [x, y, s], [nx, ny, nz, constant]) {
  const count = positions.length / 3;
  const w = new Float32Array(count * 2);
  const keep = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    const px = positions[i * 3], py = positions[i * 3 + 1], pz = positions[i * 3 + 2];
    const pw = 1 / (e[3] * px + e[7] * py + e[11] * pz + e[15]);
    const vx = (e[0] * px + e[4] * py + e[8] * pz + e[12]) * pw;
    const vy = (e[1] * px + e[5] * py + e[9] * pz + e[13]) * pw;
    const vz = (e[2] * px + e[6] * py + e[10] * pz + e[14]) * pw;
    w[i * 2] = (vx - x) / s;
    w[i * 2 + 1] = (vy - y) / s;
    const lw = 1 / (f[3] * vx + f[7] * vy + f[11] * vz + f[15]);
    const lx = (f[0] * vx + f[4] * vy + f[8] * vz + f[12]) * lw;
    const ly = (f[1] * vx + f[5] * vy + f[9] * vz + f[13]) * lw;
    const lz = (f[2] * vx + f[6] * vy + f[10] * vz + f[14]) * lw;
    keep[i] = nx * lx + ny * ly + nz * lz + constant >= 0;
  }
  return { w, keep };
}

export function edgesOf(index, count) {
  const seen = new Map(), pairs = [], ways = [];
  for (let t = 0; t < index.length; t += 3) {
    for (let k = 0; k < 3; k++) {
      const i = index[t + k], j = index[t + (k + 1) % 3];
      const key = i < j ? i * count + j : j * count + i;
      let at = seen.get(key);
      if (at === undefined) {
        at = ways.length;
        seen.set(key, at);
        pairs.push(i, j);
        ways.push(0);
      }
      ways[at] |= i === pairs[at * 2] ? 1 : 2;
    }
  }
  return { pairs: Uint32Array.from(pairs), ways: Uint8Array.from(ways) };
}

export function outline(parts) {
  let c0 = Infinity, c1 = -Infinity;
  const boxes = parts.map(({ w }) => {
    let xa = Infinity, xb = -Infinity, ya = Infinity, yb = -Infinity;
    for (let i = 0; i < w.length; i += 2) {
      const c = Math.round(w[i] / COL);
      if (c < c0) c0 = c;
      if (c > c1) c1 = c;
      if (w[i] < xa) xa = w[i];
      if (w[i] > xb) xb = w[i];
      if (w[i + 1] < ya) ya = w[i + 1];
      if (w[i + 1] > yb) yb = w[i + 1];
    }
    return [xa, xb, ya, yb];
  });
  const lo = new Float64Array(c1 - c0 + 1).fill(Infinity);
  const hi = new Float64Array(c1 - c0 + 1).fill(-Infinity);
  const within = ([xa, xb, ya, yb]) => {
    for (let c = Math.round(xa / COL); c <= Math.round(xb / COL); c++) {
      if (!(lo[c - c0] <= ya - SLACK && hi[c - c0] >= yb + SLACK)) return false;
    }
    return true;
  };
  const area = (k) => (boxes[k][1] - boxes[k][0]) * (boxes[k][3] - boxes[k][2]);
  const order = parts.map((_, k) => k).sort((a, b) => area(b) - area(a));
  for (const p of order) {
    if (within(boxes[p])) continue;
    const { w, keep, pairs, ways } = parts[p];
    for (let e = 0; e < ways.length; e++) {
      const i = pairs[e * 2], j = pairs[e * 2 + 1];
      if (!keep[i] && !keep[j]) continue;
      const x0 = w[i * 2], y0 = w[i * 2 + 1], x1 = w[j * 2], y1 = w[j * 2 + 1];
      let k = Math.round(x0 / COL) - c0;
      if (y0 < lo[k]) lo[k] = y0;
      if (y0 > hi[k]) hi[k] = y0;
      k = Math.round(x1 / COL) - c0;
      if (y1 < lo[k]) lo[k] = y1;
      if (y1 > hi[k]) hi[k] = y1;
      const end = Math.max(x0, x1) / COL, way = ways[e];
      for (let c = Math.ceil(Math.min(x0, x1) / COL); c <= end; c++) {
        k = c - c0;
        if (way & 1) {
          const y = y0 + (y1 - y0) * ((c * COL - x0) / (x1 - x0));
          if (y < lo[k]) lo[k] = y;
          if (y > hi[k]) hi[k] = y;
        }
        if (way & 2) {
          const y = y1 + (y0 - y1) * ((c * COL - x1) / (x0 - x1));
          if (y < lo[k]) lo[k] = y;
          if (y > hi[k]) hi[k] = y;
        }
      }
    }
  }
  return { c0, lo, hi };
}
