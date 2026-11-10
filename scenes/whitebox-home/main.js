import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { palette, lineMaterial, depthMaterial, creaseLines } from '../../hero/src/edges.js';
import { orbit } from '../shared/orbit.js';
import { breathe, weld } from '../shared/breathe.js';

const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
const W = num('w', 1250), H = num('h', 610);
const TOWN = q.get('town') ?? 'naarden';
const MODE = q.get('g') ?? 'base';
const VIEW = {
  el: num('el', 34), az: num('az', 200), zoom: num('zoom', 2.4), cx: num('cx', 30),
  cz: num('cz', 0), fx: num('fx', 0.5), fy: num('fy', 0.5), radius: num('r', 330),
};
const capture = q.has('capture');
const FOCUS = q.has('focus'), HOLD = 6;
if (capture) document.body.dataset.capture = '';

palette.ink.set('#111');
palette.light.set('#a8a8a8');
palette.faint.set('#d6d6d6');
palette.accent.set('#d02020');

const stage = document.querySelector('.stage');
stage.style.width = `${W}px`;
stage.style.height = `${H}px`;
const canvas = stage.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const pr = capture ? num('dpr', 2) : Math.min(devicePixelRatio, 2);
renderer.setPixelRatio(pr);
renderer.setSize(W, H, false);
renderer.setClearColor(0xffffff, 1);
const material = (tone, width = 1) => {
  const m = lineMaterial({ tone, msaa: false });
  m.resolution.set(W * pr, H * pr);
  m.linewidth = width;
  return m;
};

const plan = await fetch(`../city/data/${TOWN}.plan.json`).then((r) => r.json());
const near = ([x, z], r = VIEW.radius) => Math.hypot(x - VIEW.cx, z - VIEW.cz) < r;
const TOWNS = {
  bourtange: {
    fort: [30, -3], inner: 175, scale: 1, share: 0.45, jewel: 53965827, bastion: [164, -91],
    gates: { friesche: [59, -80], munsterse: [55, 72] },
  },
  naarden: {
    fort: [24, -8], inner: 280, scale: 1.6, share: 0.1, jewel: 52631240, bastion: [234, -360],
    gates: { utrechtse: [221, 19], amsterdamse: [-200, -40] }, ring: [0, 2, 1],
  },
};
const TC = TOWNS[TOWN];
const FORT = TC.fort, S = TC.scale;
const inFort = ([x, z], r) => Math.hypot(x - FORT[0], z - FORT[1]) < r;
const centroid = (ring) =>
  ring.reduce(([ax, az], [x, z]) => [ax + x / ring.length, az + z / ring.length], [0, 0]);

const EXAG = num('exag', 2);
const G = plan.terrain;
const heights = new Float32Array(await fetch(`../city/data/${G.file}`).then((r) => r.arrayBuffer()));
function ground(x, z) {
  const fx = THREE.MathUtils.clamp((x - G.origin) / G.cell - 0.5, 0, G.n - 1.001);
  const fz = THREE.MathUtils.clamp((z - G.origin) / G.cell - 0.5, 0, G.n - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const h = (a, b) => heights[(j + b) * G.n + i + a];
  return ((h(0, 0) * (1 - u) + h(1, 0) * u) * (1 - v) + (h(0, 1) * (1 - u) + h(1, 1) * u) * v)
    * EXAG;
}
const onGround = ([x, z], lift = 0.4) => new THREE.Vector3(x, ground(x, z) + lift, z);

const world = new THREE.Group();
const relief = new THREE.Group();
world.add(relief);

function extrude(b) {
  const shape = new THREE.Shape(b.ring.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: b.h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  for (const k of Object.keys(g.attributes)) if (k !== 'position') g.deleteAttribute(k);
  return mergeVertices(g, 1e-3);
}
const ink = material('ink');
function block(geo, m = ink) {
  const mesh = new THREE.Mesh(geo, depthMaterial(1.5));
  mesh.renderOrder = -1;
  mesh.add(creaseLines(geo, 30, m));
  return mesh;
}
const blocks = plan.buildings.filter((b) => near(b.ring[0]) || inFort(b.ring[0], TC.inner + 25 * S));
const floor = (b) => Math.min(...b.ring.map(([x, z]) => ground(x, z)));
const KRUITHUIS = TC.jewel;
const inside = (b) => inFort(centroid(b.ring), TC.inner);
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const own = new Map();
for (const b of blocks) {
  if ((b.id === KRUITHUIS && MODE !== 'whitebox') || (MODE === 'review' && inside(b) && rand() < TC.share)) own.set(b.id, b);
}
const merged = [];
for (const b of blocks.filter((b) => !own.has(b.id) && !(MODE === 'whitebox' && inside(b)))) {
  await breathe();
  merged.push(extrude(b).translate(0, floor(b), 0));
}
await breathe();
const mergedTown = await weld(mergeGeometries(merged), 1e-3);
await breathe();
relief.add(block(mergedTown));
if (MODE === 'whitebox') {
  const hidden = [];
  for (const b of blocks.filter(inside)) {
    await breathe();
    hidden.push(extrude(b).translate(0, floor(b), 0));
  }
  await breathe();
  const occluder = new THREE.Mesh(await weld(mergeGeometries(hidden), 1e-3), depthMaterial(1.5));
  occluder.renderOrder = -1;
  relief.add(occluder);
}
const meshes = new Map();
for (const b of own.values()) {
  await breathe();
  const m = material('ink');
  const mesh = block(extrude(b), m);
  mesh.position.y = floor(b);
  mesh.userData.lines = m;
  meshes.set(b.id, mesh);
  relief.add(mesh);
}

async function contours(step, hot) {
  const n = G.n, grey = [], red = [];
  const P = (i, j) =>
    [G.origin + (i + 0.5) * G.cell, heights[j * n + i], G.origin + (j + 0.5) * G.cell];
  const cut = (a, b, lv) => {
    const f = (lv - a[1]) / (b[1] - a[1]);
    return [a[0] + (b[0] - a[0]) * f, lv * EXAG, a[2] + (b[2] - a[2]) * f];
  };
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    if (i === 0) await breathe();
    const mid = [G.origin + (i + 1) * G.cell, G.origin + (j + 1) * G.cell];
    if (!near(mid)) continue;
    const into = hot && Math.hypot(mid[0] - hot.at[0], mid[1] - hot.at[1]) < hot.r ? red : grey;
    const c = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
    const lo = Math.min(...c.map((p) => p[1])), hi = Math.max(...c.map((p) => p[1]));
    for (let lv = Math.ceil(lo / step) * step; lv < hi; lv += step) {
      const hits = [];
      for (let e = 0; e < 4; e++) {
        const a = c[e], b = c[(e + 1) % 4];
        if ((a[1] < lv) !== (b[1] < lv)) hits.push(cut(a, b, lv));
      }
      for (let k = 0; k + 1 < hits.length; k += 2) into.push(...hits[k], ...hits[k + 1]);
    }
  }
  const make = (pts) =>
    new LineSegments2(new LineSegmentsGeometry().setPositions(pts), material('light'));
  return { grey: make(grey), red: make(red) };
}
const BASTION = TC.bastion;
const FACE = 40 * S, HOT = 26 * S;
const FACES = (() => {
  const d = [FORT[0] - BASTION[0], FORT[1] - BASTION[1]], l = Math.hypot(...d);
  const u = [d[0] / l, d[1] / l], a = THREE.MathUtils.degToRad(50);
  return [a, -a].map((t) => [u[0] * Math.cos(t) - u[1] * Math.sin(t), u[0] * Math.sin(t) + u[1] * Math.cos(t)]);
})();
const BREACH = [BASTION[0] + FACES[0][0] * FACE * 0.45, BASTION[1] + FACES[0][1] * FACE * 0.45];
const terrain = await (async () => {
  const n = G.n, pos = [], idx = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    if (i === 0) await breathe();
    pos.push(G.origin + (i + 0.5) * G.cell, heights[j * n + i] * EXAG,
      G.origin + (j + 0.5) * G.cell);
  }
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    if (i === 0) await breathe();
    if (!near([G.origin + (i + 1) * G.cell, G.origin + (j + 1) * G.cell])) continue;
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const mesh = new THREE.Mesh(geo, depthMaterial(2));
  mesh.renderOrder = -1;
  const lines = await contours(num('step', 1), MODE === 'redteam' ? { at: BREACH, r: HOT } : null);
  mesh.add(lines.grey, lines.red);
  relief.add(mesh);
  return lines;
})();

const polyline = (pts, y) => {
  const out = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const [a, b] = [pts[k], pts[k + 1]];
    if (!near(a) && !near(b)) continue;
    out.push(a[0], ground(...a) + y, a[1], b[0], ground(...b) + y, b[1]);
  }
  return out;
};
const staticLines = (list, m, y) => new LineSegments2(
  new LineSegmentsGeometry().setPositions(list.flatMap((p) => polyline(p, y))), m);
relief.add(staticLines(plan.water, material('ink'), 0.1));
await breathe();
relief.add(staticLines(plan.streets.map((s) => s.pts), material('faint'), 0.3));
await breathe();
if (q.has('grid')) {
  const pts = [];
  for (let v = -600; v <= 600; v += 100) pts.push([[v, -600], [v, 600]], [[-600, v], [600, v]]);
  relief.add(staticLines(pts, material('accent'), 3));
}

function dynamicLines(capacity, m, order = 2) {
  const geo = new LineSegmentsGeometry().setPositions(new Float32Array(capacity * 6));
  const line = new LineSegments2(geo, m);
  line.frustumCulled = false;
  line.renderOrder = order;
  relief.add(line);
  return { line, array: geo.attributes.instanceStart.data.array, n: 0, capacity };
}
const put = (into, a, b) => {
  if (into.n >= into.capacity) return;
  const p = into.array, o = into.n * 6;
  p[o] = a.x; p[o + 1] = a.y; p[o + 2] = a.z; p[o + 3] = b.x; p[o + 4] = b.y; p[o + 5] = b.z;
  into.n++;
};
const upload = (data, n) => {
  if (!n) return;
  data.clearUpdateRanges();
  data.addUpdateRange(0, n * 6);
  data.needsUpdate = true;
};
function flush(into) {
  upload(into.line.geometry.attributes.instanceStart.data, into.n);
  into.line.geometry.instanceCount = into.n;
}

const graph = new Map();
const node = (p) => {
  const k = `${p[0]},${p[1]}`;
  if (!graph.has(k)) graph.set(k, { p, edges: [] });
  return graph.get(k);
};
for (const s of plan.streets) {
  for (let k = 0; k < s.pts.length - 1; k++) {
    const [a, b] = [s.pts[k], s.pts[k + 1]];
    if (!inFort(a, 420 * S) || !inFort(b, 420 * S)) continue;
    const u = node(a), v = node(b), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    u.edges.push({ to: v, len });
    v.edges.push({ to: u, len });
  }
}
const gap = (n, p) => Math.hypot(n.p[0] - p[0], n.p[1] - p[1]);
const nearest = (p) => [...graph.values()].reduce((best, n) => (gap(n, p) < gap(best, p) ? n : best));
function dijkstra(sources) {
  const dist = new Map(sources.map((s) => [s, 0])), prev = new Map(), open = [...sources];
  while (open.length) {
    open.sort((a, b) => dist.get(a) - dist.get(b));
    const u = open.shift();
    for (const { to, len } of u.edges) {
      const d = dist.get(u) + len;
      if (d < (dist.get(to) ?? Infinity)) {
        if (!dist.has(to)) open.push(to);
        dist.set(to, d);
        prev.set(to, u);
      }
    }
  }
  return { dist, prev };
}
const route = ({ prev }, to) => {
  const out = [to];
  while (prev.has(out[0])) out.unshift(prev.get(out[0]));
  return out.map((n) => n.p);
};
function draped(pts) {
  const pos = [], run = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const [a, b] = [pts[k], pts[k + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2));
    for (let s = k ? 1 : 0; s <= n; s++) {
      const p = onGround([a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n], 0.6);
      run.push(pos.length ? run.at(-1) + Math.hypot(p.x - pos.at(-1).x, p.z - pos.at(-1).z) : 0);
      pos.push(p);
    }
  }
  if (pos.length === 1) { pos.push(pos[0].clone()); run.push(0); }
  return { pos, run, length: run.at(-1) };
}
const along = (r, d, v) => {
  let k = 0;
  while (k < r.run.length - 2 && r.run[k + 1] < d) k++;
  const f = THREE.MathUtils.clamp((d - r.run[k]) / ((r.run[k + 1] - r.run[k]) || 1), 0, 1);
  return v.lerpVectors(r.pos[k], r.pos[k + 1], f);
};
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
function stroke(into, r, d0, d1) {
  for (let k = 0; k < r.run.length - 1; k++) {
    const a = r.run[k], b = r.run[k + 1];
    if (b <= d0 || a >= d1 || b === a) continue;
    const f0 = Math.max(0, (d0 - a) / (b - a)), f1 = Math.min(1, (d1 - a) / (b - a));
    put(into, tmp.lerpVectors(r.pos[k], r.pos[k + 1], f0),
      tmp2.lerpVectors(r.pos[k], r.pos[k + 1], f1));
  }
}

function colorLines(capacity, width = 1, order = 3) {
  const m = material('ink', width);
  m.color.set('#fff');
  m.vertexColors = true;
  const geo = new LineSegmentsGeometry().setPositions(new Float32Array(capacity * 6))
    .setColors(new Float32Array(capacity * 6));
  const line = new LineSegments2(geo, m);
  line.frustumCulled = false;
  line.renderOrder = order;
  relief.add(line);
  return { line, array: geo.attributes.instanceStart.data.array,
    color: geo.attributes.instanceColorStart.data.array, n: 0, capacity };
}
const putc = (into, a, b, ca, cb = ca) => {
  if (into.n >= into.capacity) return;
  const p = into.array, c = into.color, o = into.n * 6;
  p[o] = a.x; p[o + 1] = a.y; p[o + 2] = a.z; p[o + 3] = b.x; p[o + 4] = b.y; p[o + 5] = b.z;
  c[o] = ca.r; c[o + 1] = ca.g; c[o + 2] = ca.b; c[o + 3] = cb.r; c[o + 4] = cb.g; c[o + 5] = cb.b;
  into.n++;
};
function flushc(into) {
  const geo = into.line.geometry;
  upload(geo.attributes.instanceStart.data, into.n);
  upload(geo.attributes.instanceColorStart.data, into.n);
  geo.instanceCount = into.n;
}
const out = (x) => 1 - (1 - x) ** 4;
const progress = (t, [a, b]) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const RISE = [0.2, 1.4];
const accent = new THREE.Color('#d02020'), inkColor = new THREE.Color('#111');
const white = new THREE.Color('#fff'), faint = new THREE.Color('#d6d6d6');
const greyInk = new THREE.Color('#555');
const GATES = TC.gates;
const GATE = Object.keys(GATES);
const hash = (n) => ((n * 2654435761) >>> 0) / 4294967296;
const c1 = new THREE.Color(), c2 = new THREE.Color();
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

function flight(legs, lobs) {
  const lens = legs.slice(1).map((p, k) => p.distanceTo(legs[k]));
  const total = lens.reduce((a, b) => a + b, 0);
  return (s, v) => {
    let d = THREE.MathUtils.clamp(s, 0, 1) * total, k = 0;
    while (k < lens.length - 1 && d > lens[k]) d -= lens[k++];
    const f = Math.min(1, d / lens[k]);
    v.lerpVectors(legs[k], legs[k + 1], f);
    v.y += 4 * lobs[k] * lens[k] * f * (1 - f);
    return v;
  };
}
const TRAIL = 0.16, STEPS = 12;
function shot(into, path, s, color) {
  for (let j = 0; j < STEPS; j++) {
    const a = s - TRAIL * (j + 1) / STEPS, b = s - TRAIL * j / STEPS;
    if (b <= 0 || a >= 1) continue;
    c1.copy(color).lerp(white, ((j + 1) / STEPS) ** 1.5);
    c2.copy(color).lerp(white, (j / STEPS) ** 1.5);
    putc(into, path(Math.max(0, a), v1), path(Math.min(1, b), v2), c1, c2);
  }
}
function salvo(into, t, g, color) {
  const since = t - g.from;
  if (since < 0) return;
  const last = Math.floor(Math.min(since, (g.until ?? Infinity) - g.from) / g.every);
  for (let k = Math.max(0, Math.floor((since - g.flight * (1 + TRAIL)) / g.every)); k <= last; k++) {
    const s = (since - k * g.every) / g.flight;
    if (s > 0 && s < 1 + TRAIL) shot(into, g.make(k), s, color);
  }
}
const planDir = (a, b) => {
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1;
  return [d[0] / l, d[1] / l];
};
const rot = ([x, z], a) => [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];

async function whitebox() {
  const town = blocks.filter(inside);
  const SPEED = 110 * S, TAIL = 120 * S, PERIOD = 4.5, T0 = 0.05;
  const TRACE = 190 * S, RETEST = 240 * S, ROOM = 5 * S;
  const settled = new THREE.Color('#7c7c7c'), planInk = new THREE.Color('#9c9c9c');
  const planPulse = new THREE.Color('#555'), planRest = new THREE.Color('#e6e6e6'), planFull = new THREE.Color('#c2c2c2');
  const readOnce = new THREE.Color('#6a6a6a'), readFull = new THREE.Color('#3a3a3a'), tone = new THREE.Color();
  const planHeld = new THREE.Color('#333'), lit = new THREE.Color('#6e6e6e');
  const area = (ring) => Math.abs(ring.reduce((a, [x, z], i) => {
    const [x2, z2] = ring[(i + 1) % ring.length];
    return a + x * z2 - x2 * z;
  }, 0)) / 2;
  const onScreen = ([x, z], mx = 0.88, my = 0.8) => {
    scene.updateMatrixWorld(true);
    const p = relief.localToWorld(onGround([x, z])).project(camera);
    return Math.abs(p.x) < mx && Math.abs(p.y) < my;
  };
  const plain = (pts) => {
    const pos = pts.map((p) => onGround(p, 0.8)), run = [0];
    for (let k = 1; k < pos.length; k++) {
      run.push(run[k - 1] + Math.hypot(pos[k].x - pos[k - 1].x, pos[k].z - pos[k - 1].z));
    }
    return { pos, run, length: run.at(-1) };
  };

  const rampart = TC.ring?.flatMap((i) => plan.walls[i]);
  const inWalls = ([x, z]) => {
    if (!rampart) return inFort([x, z], TC.inner + 15 * S);
    let inside = false;
    for (let i = 0, j = rampart.length - 1; i < rampart.length; j = i++) {
      const [xi, zi] = rampart[i], [xj, zj] = rampart[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
    }
    return inside;
  };
  await breathe();
  const spread = (() => {
    const cs = town.map((b) => centroid(b.ring)).filter(inWalls);
    const [mx, mz] = cs.reduce(([a, b], [x, z]) => [a + x / cs.length, b + z / cs.length], [0, 0]);
    let sxx = 0, sxz = 0, szz = 0;
    for (const [x, z] of cs) { sxx += (x - mx) ** 2; sxz += (x - mx) * (z - mz); szz += (z - mz) ** 2; }
    const det = sxx * szz - sxz * sxz;
    const md = ([x, z]) => Math.sqrt(cs.length * ((x - mx) ** 2 * szz - 2 * (x - mx) * (z - mz) * sxz + (z - mz) ** 2 * sxx) / det);
    const lim = cs.map(md).sort((a, b) => a - b)[Math.floor(cs.length * 0.97)];
    return (p) => md(p) / lim;
  })();
  const inTown = (p, k = 1.05) => inWalls(p) && spread(p) <= k;
  const gateNodes = Object.values(GATES).map(nearest);
  await breathe();
  const inNodes = [...graph.values()].filter((n) => n.edges.length
    && (inTown(n.p, 1.08) || gateNodes.some((g) => gap(g, n.p) < 50 * S)));
  const nearIn = (p) => inNodes.reduce((b, n) => (gap(n, p) < gap(b, p) ? n : b));
  const starts = [FORT, ...[0.4, 2.5, 4.6, 1.5, 3.6, 5.6].map((a, k) =>
    [FORT[0] + Math.cos(a) * (k % 2 ? 120 : 170) * S, FORT[1] + Math.sin(a) * (k % 2 ? 120 : 170) * S])];
  const origins = [];
  for (const p of starts) {
    await breathe();
    origins.push(dijkstra([nearIn(p)]).dist);
  }
  const reach = (o, n) => origins[o].get(n) ?? Infinity;
  const waveOrigin = (k) => k % origins.length;
  const waveAt = (k) => T0 + k * PERIOD;

  const pieces = [];
  for (const s of plan.streets) {
    await breathe();
    for (let k = 0; k < s.pts.length - 1; k++) {
      const [a, b] = [s.pts[k], s.pts[k + 1]];
      if (!inTown(a) || !inTown(b)) continue;
      const u = node(a), v = node(b), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const n = Math.max(1, Math.ceil(len / 7));
      for (let i = 0; i < n; i++) {
        const f0 = i / n, f1 = (i + 1) / n;
        const p0 = [a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0];
        const p1 = [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1];
        pieces.push({ a: onGround(p0, 0.8), b: onGround(p1, 0.8),
          d: origins.map((_, o) => [Math.min(reach(o, u) + len * f0, reach(o, v) + len * (1 - f0)),
            Math.min(reach(o, u) + len * f1, reach(o, v) + len * (1 - f1))]) });
      }
    }
  }

  function frame(ring, c, id) {
    let dir = [1, 0], long = 0;
    ring.forEach(([x, z], i) => {
      const [x2, z2] = ring[(i + 1) % ring.length], l = Math.hypot(x2 - x, z2 - z);
      if (l > long) { long = l; dir = [(x2 - x) / l, (z2 - z) / l]; }
    });
    const nrm = [-dir[1], dir[0]];
    const us = ring.map(([x, z]) => (x - c[0]) * dir[0] + (z - c[1]) * dir[1]);
    const vs = ring.map(([x, z]) => (x - c[0]) * nrm[0] + (z - c[1]) * nrm[1]);
    const u = [Math.min(...us), Math.max(...us)], v = [Math.min(...vs), Math.max(...vs)];
    const at = (a, b) => [c[0] + dir[0] * a + nrm[0] * b, c[1] + dir[1] * a + nrm[1] * b];
    const deep = v[1] - v[0], CW = 1.6 * S, jit = (k) => hash(id * 7 + k) - 0.5;
    const mid = v[0] + deep * (0.5 + jit(1) * 0.25);
    const walls = [], bands = [];
    if (deep > 1.7 * ROOM) {
      walls.push(mid - CW / 2, mid + CW / 2);
      bands.push([v[0], mid - CW / 2], [mid + CW / 2, v[1]]);
    } else if (u[1] - u[0] < 1.4 * ROOM) {
      walls.push(mid);
      bands.push([v[0], mid], [mid, v[1]]);
    } else bands.push([v[0], v[1]]);
    const rows = bands.map(([v0, v1], b) => {
      const nu = Math.max(1, Math.round((u[1] - u[0]) / ROOM)), step = (u[1] - u[0]) / nu;
      const uc = Array.from({ length: nu + 1 }, (_, i) =>
        (i === 0 || i === nu ? u[0] + step * i : u[0] + step * (i + jit(10 + b * 20 + i) * 0.5)));
      return { v0, v1, uc };
    });
    return { dir, nrm, at, rows, walls, local: ring.map((_, i) => [us[i], vs[i]]) };
  }
  function cut(local, axis, value) {
    const hits = [];
    local.forEach((p, i) => {
      const q2 = local[(i + 1) % local.length];
      if ((p[axis] < value) === (q2[axis] < value)) return;
      const f = (value - p[axis]) / (q2[axis] - p[axis]);
      hits.push(p[1 - axis] + (q2[1 - axis] - p[1 - axis]) * f);
    });
    hits.sort((a, b) => a - b);
    const out = [];
    for (let k = 0; k + 1 < hits.length; k += 2) out.push([hits[k], hits[k + 1]]);
    return out;
  }
  function clip(poly, u0, u1, v0, v1) {
    const half = (pts, axis, value, keepBelow) => {
      const res = [];
      pts.forEach((p, i) => {
        const q2 = pts[(i + 1) % pts.length];
        const pin = keepBelow ? p[axis] <= value : p[axis] >= value;
        const qin = keepBelow ? q2[axis] <= value : q2[axis] >= value;
        if (pin) res.push(p);
        if (pin !== qin) {
          const f = (value - p[axis]) / (q2[axis] - p[axis]);
          res.push(axis ? [p[0] + (q2[0] - p[0]) * f, value] : [value, p[1] + (q2[1] - p[1]) * f]);
        }
      });
      return res;
    };
    return half(half(half(half(poly, 0, u0, false), 0, u1, true), 1, v0, false), 1, v1, true);
  }

  const segs = [], bInfo = [];
  for (const b of town) {
    await breathe();
    const c = centroid(b.ring), n = nearIn(c);
    const info = { area: area(b.ring), b, c, first: segs.length, d: origins.map((_, o) => Math.min(reach(o, n) + gap(n, c),
      1.5 * Math.hypot(c[0] - starts[o][0], c[1] - starts[o][1]))) };
    const line = creaseLines(extrude(b).translate(0, floor(b) + 0.3, 0), 30, null);
    const arr = line.geometry.attributes.instanceStart.data.array;
    for (let o = 0; o < arr.length; o += 6) segs.push(arr.subarray(o, o + 6));
    info.count = segs.length - info.first;
    const f = frame(b.ring, c, b.id), y = floor(b) + b.h + 0.2;
    info.frame = f;
    info.y = y;
    info.plan = [];
    const wall = (p, q2) => info.plan.push(new THREE.Vector3(p[0], y, p[1]), new THREE.Vector3(q2[0], y, q2[1]));
    if (area(b.ring) < 900 * S * S) {
      for (const value of f.walls) for (const [s0, s1] of cut(f.local, 1, value)) wall(f.at(s0, value), f.at(s1, value));
      for (const row of f.rows) {
        for (const value of row.uc.slice(1, -1)) {
          for (const [s0, s1] of cut(f.local, 0, value)) {
            const a = Math.max(s0, row.v0), z = Math.min(s1, row.v1);
            if (z > a) wall(f.at(value, a), f.at(value, z));
          }
        }
      }
    }
    bInfo.push(info);
  }
  const lines = colorLines(segs.length, 1, 2);
  segs.forEach((s, i) => lines.array.set(s, i * 6));
  lines.n = segs.length;
  flushc(lines);
  const plans = colorLines(bInfo.reduce((n, i) => n + i.plan.length / 2, 0), 0.8, 1);

  const gates = Object.values(GATES);
  const cands = [];
  const framed = (c) => (FOCUS ? onScreen(c, 0.7, 0.62) : onScreen(c, 0.92, 0.9) && !inFort(c, 80 * S));
  const shown = [];
  for (const i of bInfo) {
    await breathe();
    const size = area(i.b.ring);
    if (size > 70 * S * S && size < 650 * S * S && framed(i.c) && inTown(i.c, 0.9)) shown.push(i);
  }
  for (const info of shown.sort((x, y) => hash(x.b.id) - hash(y.b.id))) {
    if (gates.some((g) => Math.hypot(info.c[0] - g[0], info.c[1] - g[1]) < 35 * S)) continue;
    if (cands.some((w) => Math.hypot(info.c[0] - w.c[0], info.c[1] - w.c[1]) < 26 * S)) continue;
    cands.push(info);
  }
  const inSet = new Set(inNodes);
  const lanes = new Set();
  for (const st of plan.streets) {
    if (!['footway', 'path', 'cycleway', 'steps', 'track', 'pedestrian'].includes(st.kind)) continue;
    for (let k = 0; k < st.pts.length - 1; k++) lanes.add(`${st.pts[k]}|${st.pts[k + 1]}`).add(`${st.pts[k + 1]}|${st.pts[k]}`);
  }
  function within(source) {
    const dist = new Map([[source, 0]]), prev = new Map(), open = [source];
    while (open.length) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (dist.get(open[i]) < dist.get(open[bi])) bi = i;
      const u = open[bi];
      open[bi] = open[open.length - 1];
      open.pop();
      for (const { to, len } of u.edges) {
        if (!inSet.has(to)) continue;
        const d = dist.get(u) + len * (lanes.has(`${u.p}|${to.p}`) ? 3 : 1);
        if (d < (dist.get(to) ?? Infinity)) {
          if (!dist.has(to)) open.push(to);
          dist.set(to, d);
          prev.set(to, u);
        }
      }
    }
    return { dist, prev };
  }
  const ways = gates.map((g) => {
    const gate = nearest(g);
    const out = planDir(FORT, gate.p);
    const approach = [gate.p];
    return { approach, inner: within(gate), gate: g };
  });
  for (const w of cands) {
    await breathe();
    const f = w.frame, row = f.rows.reduce((a, b) => (b.v1 - b.v0 > a.v1 - a.v0 ? b : a));
    const i = Math.floor(hash(w.b.id + 1) * (row.uc.length - 1));
    const room = clip(f.local, row.uc[i], row.uc[i + 1], row.v0, row.v1);
    w.room = room.map(([a, b]) => f.at(a, b));
    const door = centroid(w.room);
    const n = nearIn(door);
    const gd = (wy) => Math.hypot(wy.gate[0] - w.c[0], wy.gate[1] - w.c[1]);
    const way = ways.reduce((a, b) => (gd(b) < gd(a) ? b : a));
    if (!way.inner.dist.has(n)) continue;
    let front = w.b.ring[0], gapMin = Infinity;
    w.b.ring.forEach(([x, z], i) => {
      const [x2, z2] = w.b.ring[(i + 1) % w.b.ring.length], dx = x2 - x, dz = z2 - z;
      const u = THREE.MathUtils.clamp(((n.p[0] - x) * dx + (n.p[1] - z) * dz) / (dx * dx + dz * dz || 1), 0, 1);
      const p = [x + dx * u, z + dz * u], g = Math.hypot(p[0] - n.p[0], p[1] - n.p[1]);
      if (g < gapMin) { gapMin = g; front = p; }
    });
    const pts = [];
    for (const p of [...way.approach, ...route(way.inner, n).slice(1), front]) {
      const seen = pts.findIndex((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1);
      if (seen >= 0) pts.length = seen;
      pts.push(p);
    }
    w.route = plain(pts);
    w.gateAt = w.route.run[Math.min(way.approach.length, pts.length) - 1];
    w.way = way;
    w.ok = w.room.length > 2 && w.route.length > 120 * S;
    if (!w.ok) continue;
    const shape = new THREE.Shape(w.room.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    w.fill = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: accent, transparent: true,
      opacity: 0, depthWrite: false, depthTest: false }));
    w.fill.position.y = w.y + 0.2;
    w.fill.renderOrder = 1;
    w.fill.visible = false;
    relief.add(w.fill);
    w.roomLine = w.room.map(([x, z]) => new THREE.Vector3(x, w.y + 0.4, z));
  }
  const reached = cands.filter((w) => w.ok);

  const memo = [];
  const far = origins.map((_, o) => Math.max(...pieces.map((p) => Math.max(...p.d[o].filter(Number.isFinite), 0))));
  const waveEnd = (k) => waveAt(k) + far[waveOrigin(k)] / SPEED + 0.3;
  const queue = [], OPEN = FOCUS ? 1 : 3, recent = [];
  let lastWay = null;
  const events = [];
  const schedule = (want, len, speed) => {
    const prev = events.at(-1), e = { len, speed, back: Infinity };
    let at = want;
    if (prev) {
      at = Math.max(at, prev.arrive + 1.2);
      prev.back = at;
      at += prev.len / (prev.speed * 4);
      prev.next = e;
    }
    e.start = at;
    e.arrive = at + len / speed;
    events.push(e);
    return e;
  };
  const retract = (e) => e.back + e.len / (e.speed * 4);
  const findings = (k) => {
    while (memo.length <= k) {
      const kk = memo.length, o = waveOrigin(kk);
      const turn = !FOCUS || kk % HOLD === 0;
      const many = FOCUS ? Number(turn) : kk ? 1 : 3;
      const list = [];
      for (let j = 0; j < many; j++) {
        const busy = new Set([...queue.map((q) => q.w), ...recent]);
        const free = reached.filter((c) => !busy.has(c));
        const pool = free.length ? free : reached;
        const apart = (c) => (queue.length
          ? Math.min(...queue.map((q) => Math.hypot(c.c[0] - q.w.c[0], c.c[1] - q.w.c[1]))) : -c.d[o]);
        const other = pool.filter((c) => c.way !== lastWay);
        const w = (other.length ? other : pool).reduce((a, b) => (apart(b) > apart(a) ? b : a));
        reached.push(...reached.splice(reached.indexOf(w), 1));
        recent.push(w);
        if (recent.length > 4) recent.shift();
        lastWay = w.way;
        list.push({ w, flag: waveAt(kk) + w.d[o] / SPEED + 1, seed: kk * 31 + j });
      }
      list.sort((a, b) => a.flag - b.flag);
      if (kk && turn && queue.length >= OPEN) {
        const f = queue.shift();
        f.re = schedule(waveAt(kk) + 0.5, f.stop, RETEST);
        f.fix = f.re.arrive;
      }
      for (const f of list) {
        f.pe = schedule(f.flag + 0.6, f.w.route.length, TRACE);
        f.flag = Math.max(f.flag, f.pe.start - 0.9);
        f.stop = f.w.route.length;
        f.fix = 1e9;
        queue.push(f);
      }
      memo.push(list);
    }
    return memo[k];
  };

  const marks = colorLines(3000, 2.2, 4);
  const thin = colorLines(3000, 1.4, 3);
  const dot = colorLines(4, 8, 5);
  const plain2 = colorLines(2000, 1.4, 3);
  const routes = colorLines(3000, 1, 3);
  const ac = new THREE.Color();
  for (const l of [marks, thin, dot, plain2, routes]) l.line.material.depthTest = false;
  const streets = colorLines(pieces.length, 1.8, 2);
  const span = (into, r, d0, d1, ca, cb) => {
    const lo = Math.max(0, d0), hi = Math.min(r.length, d1);
    if (hi <= lo) return;
    for (let k = 0; k < r.run.length - 1; k++) {
      const a = r.run[k], b = r.run[k + 1];
      if (b <= lo || a >= hi || b === a) continue;
      const s0 = Math.max(a, lo), s1 = Math.min(b, hi);
      putc(into, tmp.lerpVectors(r.pos[k], r.pos[k + 1], (s0 - a) / (b - a)),
        tmp2.lerpVectors(r.pos[k], r.pos[k + 1], (s1 - a) / (b - a)),
        c1.copy(ca).lerp(cb, (s0 - d0) / (d1 - d0 || 1)), c2.copy(ca).lerp(cb, (s1 - d0) / (d1 - d0 || 1)));
    }
  };

  return (t) => {
    streets.n = 0;
    const kNow = Math.floor((t - T0) / PERIOD);
    const kFrom = Math.max(0, kNow - Math.ceil(600 * S / SPEED / PERIOD));
    findings(kNow + 1);
    let quiet = 1;
    for (let i = events.length - 1; i >= 0 && events[i].start > t - 10; i--) {
      const e = events[i];
      quiet = Math.min(quiet, 1 - 0 * Math.min(progress(t, [e.start - 0.3, e.start]), 1 - progress(t, [e.arrive, e.arrive + 0.3])));
    }
    for (let k = kFrom; k <= kNow; k++) {
      const R = (t - waveAt(k)) * SPEED, o = waveOrigin(k);
      if (R < 0) continue;
      for (const p of pieces) {
        const [da, db] = p.d[o];
        const xa = R - da, xb = R - db;
        if ((xa < 0 && xb < 0) || (xa > TAIL && xb > TAIL)) continue;
        const ka = xa < 0 ? 0 : Math.max(0, 1 - xa / TAIL) ** 2 * quiet;
        const kb = xb < 0 ? 0 : Math.max(0, 1 - xb / TAIL) ** 2 * quiet;
        putc(streets, p.a, p.b, c1.copy(faint).lerp(inkColor, ka), c2.copy(faint).lerp(inkColor, kb));
      }
    }
    flushc(streets);

    plans.n = 0;
    const arr = lines.color;
    for (let i = 0; i < bInfo.length; i++) {
      const info = bInfo[i];
      const read = waveAt(0) + info.d[0] / SPEED;
      let c, pulse = 0;
      if (t < read) c = faint;
      else {
        for (let k = kFrom; k <= kNow; k++) {
          const since = t - waveAt(k) - info.d[waveOrigin(k)] / SPEED;
          if (since >= 0 && since < 2.2) pulse = Math.max(pulse, Math.min(1, 1.15 - since / 2) ** 2 * quiet);
        }
        const passes = Math.min(4, kNow + (t >= waveAt(kNow) + info.d[waveOrigin(kNow)] / SPEED ? 1 : 0));
        const depth = (passes - 1) / 3;
        c = t - read < 0.2 ? c1.copy(faint).lerp(inkColor, (t - read) / 0.2)
          : c1.copy(inkColor).lerp(tone.copy(readOnce).lerp(readFull, depth), Math.min(1, (t - read - 0.2) / 1.2))
            .lerp(inkColor, pulse * 0.6);
        info.depth = depth;
      }
      for (let s = info.first; s < info.first + info.count; s++) {
        arr[s * 6] = arr[s * 6 + 3] = c.r;
        arr[s * 6 + 1] = arr[s * 6 + 4] = c.g;
        arr[s * 6 + 2] = arr[s * 6 + 5] = c.b;
      }
      if (t >= read) {
        c2.copy(t - read < 0.4 ? white : tone.copy(planRest).lerp(planFull, info.depth)).lerp(planPulse, pulse);
        for (let s = 0; s < info.plan.length; s += 2) putc(plans, info.plan[s], info.plan[s + 1], c2);
      }
    }
    lines.line.geometry.attributes.instanceColorStart.data.needsUpdate = true;
    flushc(plans);

    marks.n = 0;
    thin.n = 0;
    dot.n = 0;
    plain2.n = 0;
    routes.n = 0;
    for (const w of reached) w.fill.visible = false;
    for (let k = Math.max(0, kNow - 8); k <= kNow; k++) {
      for (const f of findings(k)) {
        if (t < f.flag || (f.re && t > Math.max(retract(f.re), f.fix + 2))) continue;
        const { w } = f, r = w.route;
        const on = progress(t, [f.flag, f.flag + 0.15]);
        const drain = progress(t, [f.fix, f.fix + 0.6]), settle = progress(t, [f.fix + 0.8, f.fix + 2]);
        if (on > 0 && settle < 1) {
          const oc = c1.copy(settled).lerp(accent, on).lerp(inkColor, drain).lerp(settled, settle);
          for (let s = w.first; s < w.first + w.count; s++) {
            putc(thin, v1.fromArray(segs[s], 0), v2.fromArray(segs[s], 3), oc);
          }
          for (let s = 0; s < w.plan.length; s += 2) putc(plain2, w.plan[s], w.plan[s + 1], oc);
          for (let s = 0; s < w.roomLine.length; s++) putc(marks, w.roomLine[s], w.roomLine[(s + 1) % w.roomLine.length], oc);
        }
        const pe = f.pe, head = (t - pe.start) * TRACE;
        if (head > 0 && t < f.fix + 0.6) {
          if (t < pe.back) span(marks, r, 0, Math.min(head, r.length), accent, accent);
          else span(routes, r, 0, r.length, accent, accent);
          if (t < pe.arrive + 0.4) {
            along(r, Math.min(head, r.length), v1);
            putc(dot, v1, v2.copy(v1).setX(v1.x + 0.05), accent);
          }
        }
        const re = f.re;
        if (re && t > re.start && t < retract(re)) {
          const d = Math.min(re.len, (t - re.start) * RETEST);
          span(marks, r, Math.max(0, (t - re.back) * RETEST * 4), d, accent, accent);
          if (t < re.arrive + 0.2) {
            along(r, Math.max(0, d), v1);
            putc(dot, v1, v2.copy(v1).setX(v1.x + 0.05), accent);
          }
        }
        const fill = Math.min(progress(t, [pe.arrive, pe.arrive + 0.12]), 1 - drain);
        if (fill > 0) {
          w.fill.visible = true;
          w.fill.material.opacity = fill;
        }
      }
    }
    flushc(marks);
    flushc(thin);
    flushc(dot);
    flushc(plain2);
    flushc(routes);
  };
}

function review() {
  const plots = [...own.values()].filter((b) => b.id !== KRUITHUIS);
  for (const b of plots) meshes.get(b.id).scale.y = 0.001;
  const ROAD = num('road', 170 * S);
  const size = num('crate', 6 * S), LANE = size * 0.65, GAP = size * 2.1;
  const roads = GATE.map((k) => {
    const gate = nearest(GATES[k]), { dist } = dijkstra([gate]);
    const far = [...dist.entries()].filter(([n]) => !inFort(n.p, TC.inner + 25 * S))
      .sort((a, b) => Math.abs(a[1] - ROAD) - Math.abs(b[1] - ROAD))[0][0];
    const road = draped(route(dijkstra([far]), gate));
    return { gate, road, check: road.length - 16 * S, queue: [] };
  });
  const EVERY = num('every', 0.7), SPEED = 40 * S, CHECK = 0.45, FAIL = 0.9, RISE_FOR = 0.7;
  const prs = plots.map((b, i) => {
    const g = roads[q.has('gate') ? num('gate', 0) : i % roads.length];
    const p = { b, g, t0: 1.6 + i * EVERY, failed: i % 5 === 3 };
    g.queue.push(p);
    return p;
  });
  for (const g of roads) {
    let free = 0;
    for (const p of g.queue) {
      p.start = Math.max(p.t0 + g.check / SPEED, free);
      p.end = p.start + (p.failed ? FAIL : CHECK);
      free = p.end + GAP / SPEED;
      p.rest = p.failed ? null : draped(route(dijkstra([g.gate]), nearest(centroid(p.b.ring))));
      p.inAt = p.end + (g.road.length - g.check) / SPEED;
      p.done = p.failed ? p.end + 0.5 + g.check / SPEED : p.inAt + p.rest.length / SPEED;
    }
  }
  const crates = colorLines(prs.length * 12 + 40, 1.3, 3);
  const heading = (r, d) => along(r, Math.min(r.length, d + 1), new THREE.Vector3())
    .sub(along(r, Math.max(0, d - 1), new THREE.Vector3())).setY(0).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const onLane = (r, d, lane, v) => {
    along(r, d, v);
    const h = heading(r, d);
    return v.addScaledVector(v3.set(-h.z, 0, h.x), lane);
  };
  const crate = (c, dir, color, lift = 0) => {
    const s = v3.set(-dir.z, 0, dir.x).multiplyScalar(size / 2).clone();
    const f = dir.clone().multiplyScalar(size * 0.75), hgt = up.clone().multiplyScalar(size * 0.8);
    const base = c.clone().addScaledVector(up, lift);
    const foot = [base.clone().add(f).add(s), base.clone().add(f).sub(s),
      base.clone().sub(f).sub(s), base.clone().sub(f).add(s)];
    const top = foot.map((p) => p.clone().add(hgt));
    for (let k = 0; k < 4; k++) {
      putc(crates, foot[k], foot[(k + 1) % 4], color);
      putc(crates, top[k], top[(k + 1) % 4], color);
      putc(crates, foot[k], top[k], color);
    }
  };
  return (t) => {
    crates.n = 0;
    for (const g of roads) {
      let ahead = Infinity;
      for (const p of g.queue) {
        if (t < p.t0) break;
        if (t >= p.done) continue;
        const r = g.road;
        if (t < p.end) {
          const d = Math.min((t - p.t0) * SPEED, g.check, ahead - GAP);
          ahead = d;
          const checking = t >= p.start;
          const col = p.failed && checking ? c1.copy(inkColor).lerp(accent,
            out(progress(t, [p.start + 0.25, p.start + 0.55]))) : inkColor;
          crate(onLane(r, Math.max(0, d), LANE, new THREE.Vector3()), heading(r, d), col);
          if (checking) {
            const k = (t - p.start) / (p.end - p.start);
            const c = onLane(r, d, LANE, new THREE.Vector3());
            const dir = heading(r, d), side = v3.set(-dir.z, 0, dir.x).multiplyScalar(size * 0.7);
            const x = c.clone().addScaledVector(dir, size * (0.75 - 1.5 * k)).addScaledVector(up, size * 0.9);
            putc(crates, x.clone().add(side), x.clone().sub(side), p.failed ? accent : greyInk);
          }
        } else if (p.failed) {
          const back = Math.max(0, g.check - Math.max(0, t - p.end - 0.5) * SPEED);
          const swing = out(progress(t, [p.end, p.end + 0.5]));
          const dir = heading(r, back).multiplyScalar(-1);
          crate(onLane(r, back, LANE * (1 - 2 * swing), new THREE.Vector3()), dir,
            c1.copy(accent).lerp(white, progress(t, [p.done - 0.6, p.done])));
        } else if (t < p.inAt) {
          const d = g.check + (t - p.end) * SPEED;
          crate(onLane(r, d, LANE * (1 - progress(d, [g.check, r.length])), new THREE.Vector3()),
            heading(r, d), inkColor);
        } else {
          const d = (t - p.inAt) * SPEED;
          crate(along(p.rest, d, new THREE.Vector3()), heading(p.rest, d), inkColor);
        }
      }
      const pivotD = g.check + size * 1.3;
      const lift = g.queue.reduce((m, p) => (p.failed ? m
        : Math.max(m, Math.min(progress(t, [p.end - 0.15, p.end + 0.05]), 1 - progress(t, [p.end + 0.5, p.end + 0.7])))), 0);
      const a = onLane(g.road, pivotD, LANE * 2, new THREE.Vector3()).addScaledVector(up, size * 0.7);
      const tip = onLane(g.road, pivotD, -LANE * 0.2, new THREE.Vector3()).addScaledVector(up, size * 0.7);
      const arm = tip.sub(a), len = arm.length();
      arm.normalize().multiplyScalar(len * Math.cos(lift * 1.4)).addScaledVector(up, len * Math.sin(lift * 1.4));
      putc(crates, a, a.clone().add(arm), inkColor);
      putc(crates, a, a.clone().addScaledVector(up, -size * 0.7), inkColor);
    }
    flushc(crates);
    for (const p of prs) {
      if (!p.failed) meshes.get(p.b.id).scale.y = Math.max(0.001, out(progress(t, [p.done, p.done + RISE_FOR])));
    }
  };
}

function redteam() {
  const [fx, fz] = FORT, B = BASTION;
  const cap = Math.atan2(B[1] - fz, B[0] - fx);
  const at = (a, r) => [fx + Math.cos(a) * r, fz + Math.sin(a) * r];
  const r0 = Math.hypot(B[0] - fx, B[1] - fz);
  const R = [r0 + 175 * S, r0 + 105 * S, r0 + 45 * S];
  const arc = (r, span) => Array.from({ length: 61 }, (_, k) => at(cap - span + 2 * span * k / 60, r));
  const zig = (a, from, to) => Array.from({ length: 7 }, (_, k) => {
    const r = from + (to - from) * k / 6, off = k % 6 ? (k % 2 ? 7 : -7) * S : 0, p = at(a, r);
    return [p[0] - Math.sin(a) * off, p[1] + Math.cos(a) * off];
  });
  const fromMiddle = (r) => ({ ...r, middle: true });
  const P = [fromMiddle(draped(arc(R[0], 0.34))), fromMiddle(draped(arc(R[1], 0.24))),
    fromMiddle(draped(arc(R[2], 0.14)))];
  const A1 = [-0.2, 0, 0.2].map((d) => draped(zig(cap + d, R[0], R[1])));
  const A2pts = [-0.1, 0, 0.1].map((d) => zig(cap + d, R[1], R[2]));
  const A2 = A2pts.map(draped);
  const works = [
    { at: [1.8, 2.6], lines: [P[0]] }, { at: [2.6, 3.8], lines: A1 },
    { at: [3.8, 4.4], lines: [P[1]] }, { at: [4.4, 5.5], lines: A2 },
    { at: [5.5, 6.0], lines: [P[2]] },
  ];
  const extend = (dir, r) => {
    for (let s = 0; s < 800 * S; s += 2) {
      const p = [B[0] - dir[0] * s, B[1] - dir[1] * s];
      if (Math.hypot(p[0] - fx, p[1] - fz) >= r) return p;
    }
    return B;
  };
  const guides = [
    ...[-0.2, 0, 0.2].map((d) => draped([at(cap + d, r0 + 6 * S), at(cap + d, R[0] + 12 * S)])),
    ...FACES.map((f) => draped([B, extend(f, R[0] + 12 * S)])),
  ];
  const guideLines = dynamicLines(guides.reduce((n, g) => n + g.pos.length, 0), material('#a8a8a8'), 1);
  const trench = dynamicLines(works.flatMap((w) => w.lines).reduce((n, l) => n + l.pos.length, 0) + 12,
    material('ink', 1.3), 2);
  const onFace = (f, k) => [B[0] + f[0] * FACE * k, B[1] + f[1] * FACE * k];
  const top = (p, lift = 1) => onGround(p, lift);
  const jitter = (k, j, r) => [(hash(k * 7 + j) - 0.5) * r, (hash(k * 13 + j + 5) - 0.5) * r];
  const T0 = [2.6, 4.4, 6.0];
  const batteries = [
    ...FACES.map((f) => ({ tier: 0, p: extend(f, R[0]), f, kind: 'ricochet' })),
    { tier: 0, p: at(cap, R[0]), kind: 'mortar' },
    ...FACES.map((f) => ({ tier: 1, p: extend(f, R[1]), f, kind: 'ricochet' })),
    ...[-0.12, 0.12].map((d) => ({ tier: 1, p: at(cap + d, R[1]), kind: 'mortar' })),
    { tier: 2, p: at(cap - 0.05, R[2] - 4 * S), kind: 'breach' },
  ];
  const COLLAPSE = [8.2, 9.1, 10.0];
  const town = [fx + Math.cos(cap) * (r0 - 90 * S), fz + Math.sin(cap) * (r0 - 90 * S)];
  const salvos = batteries.map((b, i) => {
    const from = top(b.p, 1.5), t = T0[b.tier] + 0.4 + i * 0.13;
    if (b.kind === 'ricochet') {
      return { from: t, every: 1.3 + hash(i) * 0.5, flight: 1.1, make: (k) => {
        const j = jitter(k, i, 6 * S);
        return flight([from, ...[0.15, 0.45, 0.8].map((x) => top(onFace(b.f, x).map((v, n) => v + j[n] * 0.3), 1))],
          [0.1, 0.04, 0.025]);
      } };
    }
    if (b.kind === 'mortar') {
      return { from: t, every: 1.7 + hash(i + 3) * 0.6, flight: 1.6, make: (k) => {
        const j = jitter(k, i, 120 * S);
        return flight([from, top([town[0] + j[0], town[1] + j[1]], 1)], [0.32]);
      } };
    }
    return { from: t + 0.3, until: COLLAPSE[2] + 0.4, every: 0.55, flight: 0.45, make: (k) => {
      const j = jitter(k, i, 10 * S);
      return flight([from, top([BREACH[0] + j[0] * 0.5, BREACH[1] + j[1] * 0.5], 2)], [0.05]);
    } };
  });
  salvos.push({ from: COLLAPSE[2] + 1, every: 1.1, flight: 1.4, make: (k) => {
    const j = jitter(k, 99, 140 * S);
    return flight([top(batteries.at(-1).p, 1.5), top([town[0] + j[0], town[1] + j[1]], 1)], [0.28]);
  } });
  const guns = [B, onFace(FACES[0], 1), onFace(FACES[1], 1)];
  const reply = guns.map((p, i) => ({ from: 3.2 + i * 0.5, until: COLLAPSE[0], every: 1.9 + i * 0.3,
    flight: 1.3, make: (k) => {
      const tier = Math.min(1, Math.floor(k / 4));
      const w = P[tier], d = w.length * hash(k * 3 + i);
      return flight([top(p, 3), along(w, d, new THREE.Vector3()).clone()], [0.22]);
    } }));
  const fire = colorLines(4000, 2.2, 4);
  const guns2 = dynamicLines(batteries.length * 9, material('ink', 1.2), 2);
  const battery = (b, scale) => {
    const c = top(b.p, 0.4);
    const aim = planDir(b.p, b.kind === 'mortar' ? town : b.kind === 'breach' ? BREACH : B);
    const across = [-aim[1], aim[0]], w = 5 * S * scale, d = 2 * S * scale;
    const corner = (u, v) => new THREE.Vector3(c.x + across[0] * u + aim[0] * v, c.y,
      c.z + across[1] * u + aim[1] * v);
    const box = [corner(-w, -d), corner(w, -d), corner(w, d), corner(-w, d)];
    box.forEach((a, k) => put(guns2, a, box[(k + 1) % 4]));
    for (const u of [-0.5, 0, 0.5]) put(guns2, corner(u * w, d), corner(u * w, d + 2.5 * S * scale));
  };
  const storm = A2pts.map((pts) => draped([...pts, BREACH]));
  const runners = dynamicLines(storm.length * 12, material('ink', 1.6), 3);
  const hot = terrain.red;
  const original = hot.geometry.attributes.instanceStart.data.array.slice();
  const outward = planDir(FORT, BREACH);
  let foot = Infinity;
  for (let o = 1; o < original.length; o += 3) foot = Math.min(foot, original[o]);
  const fallen = (t) => COLLAPSE.reduce((f, c) => f + out(progress(t, [c, c + 0.6])) / 3, 0);
  let lastFall = -1;
  return (t) => {
    guideLines.n = 0;
    for (const g of guides) stroke(guideLines, g, 0, g.length * out(progress(t, [1.0, 2.0])));
    flush(guideLines);
    trench.n = 0;
    for (const w of works) {
      const p = out(progress(t, w.at));
      for (const l of w.lines) {
        if (l.middle) stroke(trench, l, l.length / 2 * (1 - p), l.length / 2 * (1 + p));
        else stroke(trench, l, 0, l.length * p);
      }
    }
    flush(trench);
    guns2.n = 0;
    batteries.forEach((b, i) => {
      const s = out(progress(t, [T0[b.tier] + i * 0.06, T0[b.tier] + 0.35 + i * 0.06]));
      if (s > 0) battery(b, s);
    });
    flush(guns2);
    fire.n = 0;
    for (const g of salvos) salvo(fire, t, g, accent);
    for (const g of reply) salvo(fire, t, g, inkColor);
    flushc(fire);
    runners.n = 0;
    if (t > COLLAPSE[2] + 0.6) {
      for (const [i, r] of storm.entries()) {
        for (let k = 0; k < 4; k++) {
          const d = ((t - COLLAPSE[2] - 0.6) * 16 * S + k * r.length / 4 + i * 9 * S) % r.length;
          const a = along(r, d, new THREE.Vector3()), b = along(r, Math.min(r.length, d + 2.5 * S), new THREE.Vector3());
          put(runners, a.setY(a.y + 1), b.setY(b.y + 1));
        }
      }
    }
    flush(runners);
    hot.material.color.copy(palette.light).lerp(accent, progress(t, [6.6, 8.0]));
    const fall = fallen(t);
    if (fall !== lastFall) {
      lastFall = fall;
      const arr = hot.geometry.attributes.instanceStart.data.array;
      for (let o = 0; o < arr.length; o += 3) {
        const x = original[o], y = original[o + 1], z = original[o + 2];
        const k = fall * THREE.MathUtils.smoothstep(1 - Math.hypot(x - BREACH[0], z - BREACH[1]) / HOT, 0, 0.6);
        const h = Math.max(0, y - foot);
        arr[o] = x + outward[0] * k * h * 0.8;
        arr[o + 1] = y - k * h * 0.6;
        arr[o + 2] = z + outward[1] * k * h * 0.8;
      }
      hot.geometry.attributes.instanceStart.data.needsUpdate = true;
      hot.material.depthTest = fall === 0;
    }
  };
}

const scene = new THREE.Scene();
const el = THREE.MathUtils.degToRad(VIEW.el), az = THREE.MathUtils.degToRad(VIEW.az);
const aim = new THREE.PerspectiveCamera();
aim.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
aim.lookAt(0, 0, 0);
const pivot = new THREE.Group(), spin = new THREE.Group();
const base = aim.quaternion.clone().invert();
pivot.quaternion.copy(base);
world.position.set(-VIEW.cx, 0, -VIEW.cz);
spin.add(world);
pivot.add(spin);
scene.add(pivot);
const aspect = W / H;
let camera;
if (q.has('fov')) {
  camera = new THREE.PerspectiveCamera(num('fov', 30), aspect, 5, 20000);
  camera.position.z = num('dist', 600);
  camera.setViewOffset(W, H, (0.5 - VIEW.fx) * W, (0.5 - VIEW.fy) * H, W, H);
} else {
  const half = 1000 / VIEW.zoom / 2;
  const px = (0.5 - VIEW.fx) * 2 * half * aspect, py = -(0.5 - VIEW.fy) * 2 * half;
  camera = new THREE.OrthographicCamera(px - half * aspect, px + half * aspect, py + half,
    py - half, -5000, 5000);
  camera.position.z = 2000;
}

const play = await ({ whitebox, review, redteam }[MODE]?.() ?? (() => {}));

function renderAt(t) {
  relief.scale.y = Math.max(0.001, out(progress(t, RISE)));
  play(t);
  scene.updateMatrixWorld(true);
  renderer.render(scene, camera);
}

const view = capture || q.has('t') || q.has('fixed') ? null
  : orbit(stage, { yaw: [-60, 60], pitch: [-20, Math.min(30, Math.max(0, 89.9 - VIEW.el))] });
const tilt = new THREE.Quaternion(), xAxis = new THREE.Vector3(1, 0, 0);
window.renderAt = renderAt;
window.CAPTURE = num('secs', 8);
window.keys = {};
await renderer.compileAsync(scene, camera);
await breathe();
if (q.has('t')) renderAt(Number(q.get('t')));
else if (capture) renderAt(0);
else {
  const FROM = num('from', 0) * 1000;
  let t0 = q.has('wait') ? null : performance.now() - FROM;
  const still = num('still', 30);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, shown = true, stopped = 0;
  const live = () => shown && !document.hidden && (view !== null || (t0 !== null && !reduce.matches));
  const frame = () => {
    raf = 0;
    if (view?.update()) {
      spin.rotation.y = view.yaw;
      pivot.quaternion.copy(tilt.setFromAxisAngle(xAxis, view.pitch)).multiply(base);
      camera.zoom = view.zoom;
      camera.updateProjectionMatrix();
    }
    renderAt(reduce.matches ? still : t0 === null ? 0 : (performance.now() - t0) / 1000);
    if (live()) raf = requestAnimationFrame(frame);
    else stopped = performance.now();
  };
  const wake = () => {
    if (raf) return;
    if (stopped && t0 !== null) t0 += performance.now() - stopped;
    stopped = 0;
    raf = requestAnimationFrame(frame);
  };
  addEventListener('message', (e) => {
    if (e.data !== 'play' || t0 !== null) return;
    t0 = performance.now() - FROM;
    stopped = 0;
    wake();
  });
  if (t0 === null) parent.postMessage('ready', '*');
  reduce.addEventListener('change', wake);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return wake();
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
    stopped = performance.now();
  });
  new IntersectionObserver(([e]) => {
    shown = e.isIntersecting;
    if (shown) wake();
  }).observe(stage);
  frame();
}
document.title = 'ready';
window.ready = true;
