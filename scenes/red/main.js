import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { palette, lineMaterial, depthMaterial, creaseLines } from '../../hero/src/edges.js';
import { orbit } from '../shared/orbit.js';
import { breathe, paced, weld } from '../shared/breathe.js';

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
    fort: [30, -3], inner: 175, scale: 1, share: 0.45, jewel: 53965827,
    gates: { friesche: [59, -80], munsterse: [55, 72] },
  },
  naarden: {
    fort: [24, -8], inner: 280, scale: 1.6, share: 0.1, jewel: 52631240,
    gates: { utrechtse: [221, 19], amsterdamse: [-200, -40] },
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
const SHELLED = [[150, -200], [230, -150], [280, -60]];
const shelled = (b) => {
  const [x, z] = centroid(b.ring);
  return inside(b) && SHELLED.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 30);
};
for (const b of blocks) {
  if ((b.id === KRUITHUIS && MODE !== 'whitebox') || (MODE === 'review' && inside(b) && rand() < TC.share)
    || (MODE === 'redteam' && shelled(b))) own.set(b.id, b);
}
const merged = [];
for (const b of blocks.filter((b) => !own.has(b.id) && !(MODE === 'whitebox' && inside(b)))) {
  await breathe();
  merged.push(extrude(b).translate(0, floor(b), 0));
}
await breathe();
const mergedTown = await weld(mergeGeometries(merged), 1e-3);
await breathe();
const townInk = material('ink');
if (MODE === 'redteam') townInk.color.set('#555');
relief.add(block(mergedTown, townInk));
if (MODE === 'whitebox') {
  const occluder = new THREE.Mesh(mergeVertices(mergeGeometries(blocks.filter(inside)
    .map((b) => extrude(b).translate(0, floor(b), 0))), 1e-3), depthMaterial(1.5));
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
    const into = hot.some((h) => Math.hypot(mid[0] - h.at[0], mid[1] - h.at[1]) < h.r) ? red : grey;
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
const HOTS = [{ at: [256, -334], r: 85 }, { at: [394, -300], r: 60 }];
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
  const lines = await contours(num('step', 1), MODE === 'redteam' ? HOTS : []);
  mesh.add(lines.grey, lines.red);
  relief.add(mesh);
  return { ...lines, mesh };
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
relief.add(staticLines(plan.water, material(MODE === 'redteam' ? 'light' : 'ink'), 0.1));
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

const TRAIL = 0.16, STEPS = 24, MAX_TAIL = 45;
function shot(into, path, s, color, trail = TRAIL) {
  if (s < 1) {
    const h = Math.min(0.01, trail / 4);
    putc(HEADS, path(Math.max(0, s - h), v1), path(s, v2), color);
  }
  for (let j = 0; j < STEPS; j++) {
    const a = s - trail * (j + 1) / STEPS, b = s - trail * j / STEPS;
    if (b <= 0 || a >= 1) continue;
    c1.copy(color).lerp(white, ((j + 1) / STEPS) ** 1.5);
    c2.copy(color).lerp(white, (j / STEPS) ** 1.5);
    putc(into, path(Math.max(0, a), v1), path(Math.min(1, b), v2), c1, c2);
  }
}
const planDir = (a, b) => {
  const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(...d) || 1;
  return [d[0] / l, d[1] / l];
};
const rot = ([x, z], a) => [x * Math.cos(a) - z * Math.sin(a), x * Math.sin(a) + z * Math.cos(a)];

function whitebox() {
  const town = blocks.filter(inside);
  const axis = planDir(GATES[GATE[0]], GATES[GATE[1]]);
  const along = (p) => (p[0] - FORT[0]) * axis[0] + (p[1] - FORT[1]) * axis[1];
  const span = town.map((b) => along(centroid(b.ring)));
  const [lo, hi] = [Math.min(...span), Math.max(...span)];
  const SWEEP = [1.6, 5.4], PERIOD = 9;
  const area = (b) => Math.abs(b.ring.reduce((a, [x, z], i) => {
    const [x2, z2] = b.ring[(i + 1) % b.ring.length];
    return a + x * z2 - x2 * z;
  }, 0)) / 2;
  const big = [...town].sort((a, b) => area(b) - area(a)).slice(0, Math.ceil(town.length / 12));
  const weak = [];
  for (const b of big.sort((a, b) => hash(a.id) - hash(b.id))) {
    const c = centroid(b.ring);
    if (Object.values(GATES).some((g) => Math.hypot(c[0] - g[0], c[1] - g[1]) < 60 * S)) continue;
    if (weak.some((w) => Math.hypot(c[0] - w.c[0], c[1] - w.c[1]) < 90 * S)) continue;
    weak.push({ b, c });
    if (weak.length === 4) break;
  }
  const isWeak = new Set(weak.map((w) => w.b.id));
  const segs = [];
  for (const b of town) {
    const g = extrude(b).translate(0, floor(b), 0);
    const line = creaseLines(g, 30, null);
    const arr = line.geometry.attributes.instanceStart.data.array;
    const ts = SWEEP[0] + (along(centroid(b.ring)) - lo) / (hi - lo || 1) * (SWEEP[1] - SWEEP[0]);
    for (let o = 0; o < arr.length; o += 6) {
      segs.push({ a: new THREE.Vector3(arr[o], arr[o + 1], arr[o + 2]),
        b: new THREE.Vector3(arr[o + 3], arr[o + 4], arr[o + 5]), ts, weak: isWeak.has(b.id) });
    }
  }
  const lines = colorLines(segs.length, 1, 2);
  const weakLines = colorLines(segs.filter((s) => s.weak).length, 2.4, 3);
  const gates = Object.values(GATES).map(nearest);
  const flood = dijkstra(gates);
  const proofs = weak.map((w, i) => ({ r: draped(route(flood, nearest(w.c))),
    at: [SWEEP[1] + 0.3 + i * 0.45, SWEEP[1] + 1.3 + i * 0.45] }));
  const red = dynamicLines(proofs.reduce((n, p) => n + p.r.pos.length, 0), material('accent', 1.8), 3);
  const across = [-axis[1], axis[0]];
  const front = colorLines(140, 1.4, 3);
  const frontAt = (d) => {
    const pts = [];
    for (let k = -35; k <= 35; k++) {
      const w = k / 35 * TC.inner * 1.1;
      pts.push(onGround([FORT[0] + axis[0] * d + across[0] * w, FORT[1] + axis[1] * d + across[1] * w], 1));
    }
    return pts;
  };
  return (t) => {
    lines.n = 0;
    weakLines.n = 0;
    for (const s of segs) {
      let c;
      if (t < s.ts) c = faint;
      else if (s.weak) c = c1.copy(faint).lerp(accent, out(progress(t, [s.ts, s.ts + 0.3])));
      else {
        const since = (t - s.ts) % PERIOD, first = t - s.ts < PERIOD;
        c = first ? c1.copy(faint).lerp(inkColor, out(Math.min(1, since / 0.35)))
          : c1.copy(inkColor).lerp(faint, Math.max(0, 1 - since / 0.5) * 0.7);
      }
      putc(s.weak ? weakLines : lines, s.a, s.b, c);
    }
    flushc(lines);
    flushc(weakLines);
    front.n = 0;
    const cycle = t < SWEEP[0] ? -1 : (t - SWEEP[0]) % PERIOD;
    const dur = SWEEP[1] - SWEEP[0];
    if (cycle >= 0 && cycle < dur + 0.4) {
      const d = lo + (hi - lo) * Math.min(1, cycle / dur);
      const fade = t - SWEEP[0] < PERIOD ? 0 : 0.45;
      c2.copy(greyInk).lerp(white, Math.max(fade, progress(cycle, [dur, dur + 0.4])));
      const pts = frontAt(d);
      for (let k = 0; k < pts.length - 1; k++) putc(front, pts[k], pts[k + 1], c2);
    }
    flushc(front);
    red.n = 0;
    for (const p of proofs) stroke(red, p.r, 0, p.r.length * out(progress(t, p.at)));
    flush(red);
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

const T = {
  rear: [0.8, 2.2], p1: [1.0, 2.6], bat1: 2.2, a1: [2.6, 6.2], defend: 1.0,
  p2: [6.4, 7.6], bat2: 7.0, a2: [7.6, 10.8], half: [9.2, 10.6], p3: [10.6, 11.8],
  cav: [11.6, 12.8], crown: [12.6, 14.6], breachBat: 14.4, rvFall: 17.6, b1Fall: 21.2,
  storm: 22.4, town: 24.6,
};
const FRONT = {
  walls: [[133, -328], [148, -336], [236, -386], [277, -281], [263, -264], [266, -259],
    [330, -180], [351, -188], [440, -126], [444, -123], [440, -120], [374, -62]],
  ravelin: [[381, -244], [394, -300], [336, -299]],
  covered: [[278, -500], [326, -413], [372, -435], [376, -387], [483, -377], [469, -241],
    [484, -225], [501, -205], [578, -117]],
  salients: [[236, -386], [394, -300], [444, -123]],
  wayAhead: [[278, -500], [483, -377], [578, -117]],
};
const R1 = 720, R2 = 668, R3 = 622;

const polar = (a, r) => [FORT[0] + Math.cos(a) * r, FORT[1] + Math.sin(a) * r];
const angleOf = (p) => Math.atan2(p[1] - FORT[1], p[0] - FORT[0]);
const mix2 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const step2 = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
const smooth = THREE.MathUtils.smoothstep;
const clamp01 = (x) => THREE.MathUtils.clamp(x, 0, 1);

function face(s, e) {
  const dir = planDir(s, e), len = Math.hypot(e[0] - s[0], e[1] - s[1]);
  let inward = [-dir[1], dir[0]];
  if (dot2(inward, [FORT[0] - (s[0] + e[0]) / 2, FORT[1] - (s[1] + e[1]) / 2]) < 0) {
    inward = [-inward[0], -inward[1]];
  }
  return { s, e, dir, len, inward };
}
const FACES2 = {
  b1east: face([236, -386], [277, -281]), b1west: face([236, -386], [133, -328]),
  rvnorth: face([394, -300], [336, -299]), rveast: face([394, -300], [381, -244]),
  b2north: face([444, -123], [351, -188]), b2south: face([444, -123], [360, -50]),
};
const COURSES = [1.15, 0.55, 0];
const wallAt = (f, p) => {
  const foot = ground(...p) + 0.3;
  return { foot, h: ground(...step2(p, f.inward, 7)) + 6 - foot };
};
function clearOf(caps, p, taken = []) {
  const r = Math.hypot(p[0] - FORT[0], p[1] - FORT[1]);
  let a = angleOf(p);
  for (let pass = 0; pass < 4; pass++) {
    for (const c of caps) if (Math.abs(a - c) * r < 30) a = c + Math.sign(a - c || 1) * 30 / r;
    for (const q of taken) {
      const here = polar(a, r);
      if (Math.hypot(here[0] - q[0], here[1] - q[1]) < 34) a += 34 / r * Math.sign(a - angleOf(q) || 1);
    }
  }
  return polar(a, r);
}
function prolong(f, r) {
  const rel = [f.s[0] - FORT[0], f.s[1] - FORT[1]], d = [-f.dir[0], -f.dir[1]];
  const b = dot2(rel, d), c = dot2(rel, rel) - r * r;
  return step2(f.s, d, -b + Math.sqrt(b * b - c));
}

const SAP = Math.tan(THREE.MathUtils.degToRad(40));
function zigzag(a, r0, r1, legs) {
  const across = [-Math.sin(a), Math.cos(a)], amp = Math.abs(r1 - r0) * SAP / (2 * (legs - 1));
  return Array.from({ length: legs + 1 }, (_, k) => {
    const end = k === 0 || k === legs, f = end ? k / legs : (2 * k - 1) / (2 * (legs - 1));
    return step2(polar(a, r0 + (r1 - r0) * f), across, end ? 0 : (k % 2 ? 1 : -1) * amp);
  });
}
const arcPts = (r, a0, a1) => Array.from({ length: 81 }, (_, k) => polar(a0 + (a1 - a0) * k / 80, r));
const lengthOf = (pts) => pts.slice(1).reduce((n, p, k) => n + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);

function flight(legs, lobs, shares) {
  const lens = legs.slice(1).map((p, k) => p.distanceTo(legs[k]));
  const total = lens.reduce((a, b) => a + b, 0);
  const share = shares ?? lens.map((l) => l / total);
  const path = (s, v) => {
    let d = THREE.MathUtils.clamp(s, 0, 1), k = 0;
    while (k < share.length - 1 && d > share[k]) d -= share[k++];
    const f = Math.min(1, d / share[k]);
    v.lerpVectors(legs[k], legs[k + 1], f);
    v.y += 4 * lobs[k] * lens[k] * f * (1 - f);
    return v;
  };
  path.metres = total;
  return path;
}

function volley(into, t, g) {
  const since = t - g.from;
  if (since < 0) return;
  const last = Math.floor(Math.min(since, (g.until ?? Infinity) - g.from) / g.every);
  const trail = g.trail ?? TRAIL;
  const tail = g.flight + Math.max(g.flight * trail, g.after ?? 0);
  for (let k = Math.max(0, Math.floor((since - tail) / g.every)); k <= last; k++) {
    const age = since - k * g.every;
    if (age <= 0 || age > tail) continue;
    if (!g.cache.has(k)) {
      g.cache.set(k, g.make(k));
      if (g.cache.size > 12) g.cache.delete(g.cache.keys().next().value);
    }
    const path = g.cache.get(k), s = age / g.flight, cap = Math.min(trail, MAX_TAIL / path.metres);
    if (s < 1 + cap) shot(into, path, s, g.color, cap);
    if (g.land && age >= g.flight) g.land(k, age - g.flight, path);
  }
}
let FIRE = null, HEADS = null;
const gun = (o) => ({ cache: new Map(), color: accent, ...o });

function debris(into, p, age, seed, size = 1) {
  if (age > 0.9) return;
  c1.copy(greyInk).lerp(white, (age / 0.9) ** 0.8);
  for (let i = 0; i < 5; i++) {
    const a = hash(seed * 31 + i) * Math.PI * 2, o = (3 + 7 * hash(seed * 17 + i)) * size;
    const up = (9 + 12 * hash(seed * 7 + i)) * size;
    const at = (tt, v) => v.set(p.x + Math.cos(a) * o * tt,
      Math.max(p.y, p.y + up * tt - 22 * size * tt * tt), p.z + Math.sin(a) * o * tt);
    putc(into, at(age, v1), at(Math.max(0, age - 0.06), v2), c1);
  }
}

async function redteam() {
  const caps = FRONT.salients.map(angleOf);
  const lines = {
    trench: dynamicLines(6000, material('ink', 1), 2),
    earth: dynamicLines(1500, material('ink', 1), 2),
    storm: dynamicLines(600, material('accent', 2), 3),
    bank: dynamicLines(400, material('ink', 3), 2),
    heads: dynamicLines(600, material('accent', 2), 3),
    wall: colorLines(3000, 1.8, 3),
    fire: colorLines(6000, 1.2, 4),
    shotHeads: colorLines(400, 2.8, 5),
  };
  FIRE = lines.fire;
  HEADS = lines.shotHeads;
  await breathe();
  const siege = siegeWorks(caps);
  await breathe();
  const batteries = siegeBatteries(caps, siege);
  await breathe();
  const breach = await breaches();
  await breathe();
  const town = shelling(batteries.filter((b) => b.kind === 'mortar'));
  await breathe();
  const fort = defenders(siege, breach);
  await breathe();
  const guns = [
    ...batteries.flatMap((b) => b.guns),
    ...fort.guns,
    ...breach.guns,
  ];
  await breathe();
  const assault = await storming(breach, siege);
  await breathe();
  return (t) => {
    for (const l of Object.values(lines)) l.n = 0;
    siege.draw(lines, t);
    for (const b of batteries) b.draw(lines, t);
    breach.draw(lines.wall, t);
    fort.draw(lines.wall, t);
    for (const g of guns) volley(lines.fire, t, g);
    town.draw(t);
    assault.draw(lines, t);
    for (const l of [lines.trench, lines.earth, lines.bank, lines.storm, lines.heads]) flush(l);
    flushc(lines.wall);
    flushc(lines.fire);
    flushc(lines.shotHeads);
  };
}

function siegeWorks(caps) {
  const pieces = [];
  const add = (pts, at, how = 'head') => {
    const r = draped(pts);
    pieces.push({ r, at, how, pts });
    return r;
  };
  const parallel = (r, spread, at) => {
    const a0 = caps[0] - spread, a1 = caps[2] + spread;
    add(arcPts(r, a0, a1), at, 'parties');
  };
  parallel(R1, 0.12, T.p1);
  parallel(R2, 0.08, T.p2);
  parallel(R3, 0.03, T.p3);
  const columns = caps.map((a, i) => {
    const rear = zigzag(a, R1 + 120, R1, 3), a1 = zigzag(a, R1, R2, 3);
    const a2 = zigzag(a, R2, R3, 3);
    const lag = i * 0.25;
    add(rear, [T.rear[0] + lag, T.rear[1] + lag]);
    add(a1, [T.a1[0] + lag, T.a1[1] + lag]);
    add(a2, [T.a2[0] + lag, T.a2[1] + lag]);
    const route = [...rear, ...a1.slice(1), ...a2.slice(1)];
    const legs = [lengthOf(rear), lengthOf(a1), lengthOf(a2)];
    return { r: draped(route), pts: route, legs, at: [T.rear, T.a1, T.a2].map(([x, y]) => [x + lag, y + lag]) };
  });
  const rh = (R2 + R3) / 2 + 8;
  for (const a of caps) {
    for (const s of [1, -1]) add(arcPts(rh, a, a + s * 55 / rh), T.half);
  }
  for (const p of FRONT.wayAhead) {
    const a = angleOf(p);
    add(zigzag(a, R3, Math.hypot(p[0] - FORT[0], p[1] - FORT[1]) + 28, 3), [T.cav[0] - 0.4, T.cav[0]]);
  }
  const crest = FRONT.covered.slice(0, 7).map((p, k, all) => {
    const prev = all[Math.max(0, k - 1)], next = all[Math.min(all.length - 1, k + 1)];
    const d = planDir(prev, next), n = [d[1], -d[0]];
    return step2(p, dot2(n, [p[0] - FORT[0], p[1] - FORT[1]]) > 0 ? n : [-n[0], -n[1]], 7);
  });
  add(crest.slice(0, 5).reverse(), T.crown);
  add(crest.slice(4), [T.crown[0] + 0.3, T.crown[1]]);
  const draw = (lines, t) => {
    for (const p of pieces) {
      const k = out(progress(t, p.at)), L = p.r.length;
      if (k <= 0) continue;
      if (p.how === 'parties') {
        const n = 7;
        for (let i = 0; i < n; i++) {
          const c = (i + 0.5) / n * L, kk = clamp01((k - hash(i + 3) * 0.35) / 0.65);
          stroke(lines.trench, p.r, c - L / n / 2 * kk, c + L / n / 2 * kk);
          if (kk > 0 && kk < 1) {
            for (const s of [-1, 1]) {
              const e = c + s * L / n / 2 * kk;
              stroke(lines.heads, p.r, Math.min(e, e - s * 4), Math.max(e, e - s * 4));
            }
          }
        }
      } else {
        stroke(lines.trench, p.r, 0, L * k);
        if (k < 1) stroke(lines.heads, p.r, Math.max(0, L * k - 5), L * k);
      }
    }
  };
  const targetAt = (t, seed) => {
    const live = pieces.filter((p) => t > p.at[0] && t < p.at[1]);
    const p = live[Math.floor(hash(seed) * live.length)] ?? pieces[1];
    const k = out(progress(t, p.at));
    const d = p.how === 'parties' ? p.r.length * hash(seed + 9) : p.r.length * k;
    const j = [(hash(seed + 1) - 0.5) * 22, (hash(seed + 2) - 0.5) * 22];
    const at = along(p.r, Math.min(d, p.r.length), new THREE.Vector3());
    return onGround([at.x + j[0], at.z + j[1]], 0.5);
  };
  const parallels = pieces.filter((p) => p.how === 'parties');
  return { draw, targetAt, columns, crest, parallels };
}

function siegeBatteries(caps, siege) {
  const list = [];
  const make = (p, aimAt, n, build, kind) => {
    const aim = planDir(p, aimAt), across = [-aim[1], aim[0]];
    const gunsAt = Array.from({ length: n }, (_, i) => step2(step2(p, across, (i - (n - 1) / 2) * 4), aim, -2.5));
    const b = { p, aim, across, n, build, kind, gunsAt, guns: [] };
    let from = null, best = Infinity;
    for (const par of siege.parallels) {
      for (const q of par.r.pos) {
        const d = Math.hypot(q.x - p[0], q.z - p[1]);
        if (d < best) { best = d; from = [q.x, q.z]; }
      }
    }
    const reach = draped([from, step2(p, aim, -3)]);
    const DIG = [build - 1.1, build - 0.2];
    b.draw = (lines, t) => {
      const kd = out(progress(t, DIG));
      if (kd > 0) {
        stroke(lines.trench, reach, 0, reach.length * kd);
        if (kd < 1) stroke(lines.heads, reach, Math.max(0, reach.length * kd - 4), reach.length * kd);
      }
      const rise = out(progress(t, [build, build + 0.7]));
      if (rise <= 0) return;
      const half = (n * 2 + 2) * rise;
      const at = (u, v, h) => onGround(step2(step2(p, across, u), aim, v), 0.4 + h * rise);
      put(lines.bank, at(-half, 0, 1.6), at(half, 0, 1.6));
      b.guns.forEach((g, i) => {
        const since = t - g.from;
        if (since < 0 || since > (g.until ?? Infinity) - g.from + 0.2 || since % g.every > 0.18) return;
        const u = (i - (n - 1) / 2) * 4;
        put(lines.heads, at(u, 0.6, 1.6), at(u, 4.5, kind === 'mortar' ? 3 : 1.8));
      });
    };
    list.push(b);
    return b;
  };
  const ricochet = [
    [FACES2.rvnorth, R1, T.bat1], [FACES2.b1east, R2, T.bat1 + 0.3],
    [FACES2.rveast, R2, T.bat2], [FACES2.b2north, R2, T.bat2 + 0.3],
  ];
  ricochet.forEach(([f, r, build], bi) => {
    const p = clearOf(caps, prolong(f, r - 14), list.map((b) => b.p)), b = make(p, f.s, 5, build, 'ricochet');
    const along = [0.12, 0.3, 0.45, 0.57, 0.66, 0.72];
    const lane = (x, j) => onGround(step2(step2(f.s, f.dir, f.len * x), f.inward, 11 + j), 0.8);
    b.guns = b.gunsAt.map((g, i) => gun({
      from: build + 0.7 + i * 0.37, every: 3.4 + hash(bi * 10 + i) * 0.8, flight: 3.6, trail: 0.1,
      make: (k) => {
        const j = (hash(k * 5 + i + bi * 99) - 0.5) * 6;
        return flight([onGround(g, 2.2), ...along.map((x) => lane(x, j))],
          [0.12, 0.7, 0.6, 0.5, 0.4, 0.3], [0.4, 0.17, 0.14, 0.12, 0.1, 0.07]);
      },
      after: 0.9, land: (k, age, path) => debris(FIRE, path(1, v3), age, k * 13 + i + bi * 7, 0.6),
    }));
  });
  const mortars = [
    [polar(caps[0] - 0.04, R2 - 8), T.bat1 + 0.6], [polar(caps[2] + 0.06, R2 - 8), T.bat1 + 0.9],
    [polar((caps[0] + caps[1]) / 2, R1 - 8), T.bat2 + 0.5], [polar((caps[1] + caps[2]) / 2, R1 - 8), T.bat2 + 0.8],
  ];
  for (const [p, build] of mortars) make(clearOf(caps, p, list.map((b) => b.p)), FORT, 4, build, 'mortar');
  return list;
}

function shelling(mortars) {
  const houses = [...own.values()].filter((b) => b.id !== KRUITHUIS);
  const hits = new Map(houses.map((b) => [b.id, []]));
  const guns = mortars.flatMap((m, mi) => (m.guns = m.gunsAt.map((g, i) => {
    const o = { from: m.build + 0.9 + i * 0.4 + mi * 0.2, every: 3.2 + hash(mi * 7 + i) * 0.8,
      flight: 3.8, after: 0.9, trail: 0.14 };
    const mid = angleOf(FRONT.salients[1]), side = Math.sign(angleOf(m.p) - mid);
    const far = houses.filter((b) => Math.sign(angleOf(centroid(b.ring)) - mid) !== side);
    const pick = (k) => far[Math.floor(hash(k * 13 + i * 7 + mi * 101) * far.length)];
    for (let k = 0; o.from + k * o.every < 400; k++) hits.get(pick(k).id).push(o.from + k * o.every + o.flight);
    return gun({ ...o,
      make: (k) => {
        const b = pick(k), c = centroid(b.ring);
        return flight([onGround(g, 2), onGround(c, floor(b) - ground(...c) + b.h * 0.7)], [0.42]);
      },
      land: (k, age, path) => debris(FIRE, path(1, v3), age, k * 3 + i, 0.8) });
  })));
  for (const l of hits.values()) l.sort((a, b) => a - b);
  return {
    guns,
    draw: (t) => {
      for (const b of houses) {
        const mesh = meshes.get(b.id), when = hits.get(b.id);
        let n = 0, last = -Infinity;
        for (const h of when) { if (h > t) break; n++; last = h; }
        const drop = Math.min(n, 3) - 1 + out(clamp01((t - last) / 0.35));
        mesh.scale.y = n ? Math.max(0.3, 1 - 0.22 * Math.max(0, drop)) : 1;
        mesh.userData.lines.color.copy(townInk.color).lerp(accent, n ? 1 - progress(t, [last + 0.1, last + 0.45]) : 0);
      }
    },
  };
}

function defenders(siege, breach) {
  const LOB = 0.08, PITCH = Math.atan(4 * LOB), BARREL = 6;
  const posts = [
    [FACES2.b1east, 0.4, T.b1Fall], [FACES2.b1east, 0.75, T.bat1 + 8],
    [FACES2.rvnorth, 0.35, T.bat1 + 6], [FACES2.rveast, 0.35, T.bat2 + 6],
    [FACES2.b2north, 0.35, T.bat2 + 7], [FACES2.b2north, 0.7, T.storm],
    [FACES2.b1west, 0.4, T.bat2 + 5],
  ];
  const guns = posts.map(([f, x, until], i) => {
    const at = step2(f.s, f.dir, f.len * x), { foot, h } = wallAt(f, at), y = foot + h * COURSES[0];
    const o = { from: T.defend + i * 0.31, until, every: 1.2 + hash(i + 50) * 0.5, flight: 1.6,
      color: inkColor, after: 0.9, trail: 0.14 };
    const outward = [-f.inward[0], -f.inward[1]], targets = new Map();
    const target = (k) => {
      if (targets.has(k)) return targets.get(k);
      let best = null, front = -Infinity;
      for (let j = 0; j < 6 && front < 0.5; j++) {
        const q = siege.targetAt(o.from + k * o.every, k * 7 + i + j * 101);
        const d = dot2(planDir(at, [q.x, q.z]), outward);
        if (d > front) [best, front] = [q, d];
      }
      targets.set(k, best);
      return best;
    };
    const aim = (k) => {
      const q = target(k);
      return planDir(at, [q.x, q.z]);
    };
    const reach = BARREL * Math.cos(PITCH), rise = BARREL * Math.sin(PITCH);
    return gun({ ...o, f, u: x, at, y, aim, last: Math.floor((until - o.from) / o.every),
      make: (k) => {
        const d = aim(k), muzzle = new THREE.Vector3(at[0] + d[0] * reach, y + rise, at[1] + d[1] * reach);
        return flight([muzzle, target(k)], [LOB]);
      },
      land: (k, age, path) => debris(FIRE, path(1, v3), age, k * 11 + i, 0.8) });
  });
  const draw = (into, t) => {
    for (const g of guns) {
      const since = t - g.from;
      const k = THREE.MathUtils.clamp(Math.floor(since / g.every), 0, g.last), age = since - k * g.every;
      const kick = since < 0 || t > g.until ? 0 : age < 0.05 ? age / 0.05 : Math.max(0, 1 - (age - 0.05) / 0.5);
      const turn = since < 0 || k === g.last ? 0 : smooth(age / g.every, 0.35, 0.85);
      const d = planDir([0, 0], mix2(g.aim(k), g.aim(k + 1), turn));
      const down = out(progress(t, [g.until, g.until + 0.4]));
      const pitch = PITCH - (PITCH + 0.35) * down, back = (kick + down) * 1.5;
      if (breach.crest(g.f, g.u, t, v1) === null) v1.set(g.at[0], g.y, g.at[1]);
      const breech = v1.set(v1.x - d[0] * back, v1.y, v1.z - d[1] * back);
      const reach = BARREL * Math.cos(pitch);
      const muzzle = v2.set(breech.x + d[0] * reach, breech.y + BARREL * Math.sin(pitch), breech.z + d[1] * reach);
      const color = c1.copy(inkColor).lerp(accent, down * (1 - progress(t, [g.until + 0.6, g.until + 1.6])));
      putc(into, breech, muzzle, color);
    }
  };
  return { guns, draw };
}

async function breaches() {
  const zones = [
    { f: FACES2.rvnorth, span: [0, 0.55], fall: T.rvFall },
    { f: FACES2.rveast, span: [0, 0.55], fall: T.rvFall + 0.15 },
    { f: FACES2.b1east, span: [0.08, 0.92], fall: T.b1Fall },
  ];
  const local = (z, x, zz) => {
    const d = [x - z.f.s[0], zz - z.f.s[1]];
    return [dot2(d, z.f.dir) / z.f.len, dot2(d, z.f.inward)];
  };
  const rampY = (z, u, w) => {
    const p = step2(z.f.s, z.f.dir, z.f.len * u);
    const base = ground(...step2(p, z.f.inward, -26)) + 1.2, crest = ground(...step2(p, z.f.inward, 26));
    return base + (crest - base) * smooth(w, -24, 24);
  };
  const weight = (z, u, w) => {
    const edge = 6 / z.f.len;
    return smooth(u, z.span[0] - edge, z.span[0] + edge) * (1 - smooth(u, z.span[1] - edge, z.span[1] + edge))
      * smooth(w, -32, -24) * (1 - smooth(w, 24, 34));
  };
  const slump = (t, z) => out(progress(t, [z.fall + 0.3, z.fall + 1.5]));
  const moving = async (array, stride) => {
    const list = [];
    for (let o = 0; o < array.length; o += stride) {
      if (o % (stride * 2048) === 0) await breathe();
      for (const z of zones) {
        const [u, w] = local(z, array[o], array[o + 2]);
        const k = weight(z, u, w);
        if (k > 0) { list.push({ o, z, k, y: array[o + 1], to: rampY(z, u, w) }); break; }
      }
    }
    return list;
  };
  const meshPos = terrain.mesh.geometry.attributes.position;
  const hotPos = terrain.red.geometry.attributes.instanceStart.data;
  const ramps = await paced(zones, async (z) => {
    const hot = hotPos.array, pts = [];
    for (let o = 0; o < hot.length; o += 6) {
      const ks = [0, 3].map((d) => weight(z, ...local(z, hot[o + d], hot[o + d + 2])));
      if (Math.min(...ks) < 0.2) continue;
      pts.push(...hot.slice(o, o + 6));
      for (let d = 3; d < 6; d++) hot[o + d] = hot[o + d - 3];
    }
    const line = new LineSegments2(new LineSegmentsGeometry().setPositions(pts), material('light'));
    terrain.mesh.add(line);
    const attr = line.geometry.attributes.instanceStart.data;
    return { z, line, attr, moves: await moving(attr.array, 3) };
  });
  const groundMoves = await moving(meshPos.array, 3), lineMoves = await moving(hotPos.array, 3);
  let lastKey = '';
  const settle = (t) => {
    const key = zones.map((z) => slump(t, z).toFixed(3)).join();
    if (key === lastKey) return;
    lastKey = key;
    const sets = [[groundMoves, meshPos], [lineMoves, hotPos], ...ramps.map((r) => [r.moves, r.attr])];
    for (const [list, attr] of sets) {
      for (const m of list) attr.array[m.o + 1] = m.y + (m.to - m.y) * m.k * slump(t, m.z);
      attr.needsUpdate = true;
    }
  };
  const crestGuns = [];
  for (const z of zones) z.hits = [];
  const battery = (p, z, n, from, until) => {
    const aim = planDir(p, step2(z.f.s, z.f.dir, z.f.len * (z.span[0] + z.span[1]) / 2));
    const across = [-aim[1], aim[0]];
    for (let i = 0; i < n; i++) {
      const g = step2(p, across, (i - (n - 1) / 2) * 5);
      const o = { from: from + i * 0.11, until, every: 0.85 + hash(i + n * 3) * 0.3, flight: 0.8 };
      const uAt = (k) => z.span[0] + (z.span[1] - z.span[0]) * hash(k * 3 + i * 17 + n);
      for (let k = 0; o.from + k * o.every <= until; k++) z.hits.push({ t: o.from + k * o.every + o.flight, u: uAt(k) });
      crestGuns.push(gun({ ...o, after: 0.9, trail: 0.16,
        make: (k) => {
          const foot = step2(step2(z.f.s, z.f.dir, z.f.len * uAt(k)), z.f.inward, -2);
          return flight([onGround(g, 2.2), onGround(foot, 1.2)], [0.01]);
        },
        land: (k, age, path) => debris(FIRE, path(1, v3), age, k * 5 + i + n, 0.7) }));
    }
  };
  battery([452, -392], zones[0], 3, T.breachBat + 0.6, T.rvFall + 0.6);
  battery([490, -335], zones[1], 3, T.breachBat + 0.8, T.rvFall + 0.6);
  battery([352, -410], zones[2], 4, T.breachBat + 1.6, T.b1Fall + 0.4);
  battery([378, -372], zones[2], 4, T.breachBat + 1.9, T.b1Fall + 0.4);
  const statics = [], slabs = [];
  const inZone = (p) => zones.find((z) => {
    const [u, w] = local(z, ...p);
    return Math.abs(w) < 1.5 && u > z.span[0] && u < z.span[1];
  });
  const wall = (pts) => {
    for (let k = 0; k + 1 < pts.length; k++) {
      const f = face(pts[k], pts[k + 1]), n = Math.max(1, Math.round(f.len / 2));
      const height = (p, c) => {
        const { foot, h } = wallAt(f, p);
        return new THREE.Vector3(p[0], foot + h * c, p[1]);
      };
      if (!inZone(f.s)) statics.push([height(f.s, 0), height(f.s, COURSES[0])]);
      for (const c of COURSES) {
        for (let i = 0; i < n; i++) {
          const p0 = step2(f.s, f.dir, f.len * i / n), p1 = step2(f.s, f.dir, f.len * (i + 1) / n);
          if (!inZone(mix2(p0, p1, 0.5))) statics.push([height(p0, c), height(p1, c)]);
        }
      }
    }
  };
  wall(FRONT.walls);
  wall(FRONT.ravelin);
  for (const z of zones) {
    const span = z.f.len * (z.span[1] - z.span[0]), n = z.f.len > 80 ? Math.max(2, Math.round(span / 18)) : 1;
    const mid = (n - 1) / 2;
    const cut = (i) => z.span[0] + (z.span[1] - z.span[0])
      * (i === 0 || i === n ? i / n : (i + (hash(i * 7 + n * 31) - 0.5) * 0.6) / n);
    for (let i = 0; i < n; i++) {
      const u0 = cut(i), u1 = cut(i + 1);
      const ends = [u0, u1].map((u, e) => {
        const p = step2(z.f.s, z.f.dir, z.f.len * u);
        const { foot, h } = wallAt(z.f, p);
        const footY = rampY(z, u, -3) + 0.3;
        const land = Math.atan2(h * 0.95, rampY(z, u, -3 - h * 0.95) + 0.5 - footY);
        return { p, u, foot, h, footY, land, speed: 1 + (hash(slabs.length * 2 + e) - 0.5) * 0.25,
          reach: 0.85 + 0.3 * hash(slabs.length * 2 + e + 60) };
      });
      slabs.push({ z, ends, release: z.fall + Math.abs(i - mid) * 0.25 + hash(slabs.length + 40) * 0.08,
        slide: 12 });
    }
  }
  const out2 = (z) => [-z.f.inward[0], -z.f.inward[1]];
  const slabAt = (s, e, c, tau, into, sf = 1) => {
    const o = out2(s.z);
    if (tau < 0) {
      const sag = clamp01((tau + 0.5) / 0.5) * 0.1 * e.h * c;
      return into.set(e.p[0], e.foot + e.h * c - sag, e.p[1]);
    }
    const th = Math.min(e.land, 3.6 * (tau * e.speed) ** 2), tl = Math.sqrt(e.land / 3.6) / e.speed;
    const sl = s.slide * e.reach * sf * (1.6 - c) * out(clamp01((tau - tl) / 0.6));
    const fy = e.foot + (e.footY - e.foot) * clamp01(tau / tl);
    const r = e.h * c * 0.95, w = -3 - r * Math.sin(th) - sl;
    const y = tau < tl ? fy + r * Math.cos(th) : rampY(s.z, e.u, w) + 0.5;
    return into.set(e.p[0] + o[0] * (r * Math.sin(th) + sl + 3 * clamp01(tau / tl)), y,
      e.p[1] + o[1] * (r * Math.sin(th) + sl + 3 * clamp01(tau / tl)));
  };
  const course = (s, ci, tau, a, b) => {
    const c = COURSES[ci];
    if (tau < 1.1) return [slabAt(s, s.ends[0], c, tau, a), slabAt(s, s.ends[1], c, tau, b)];
    const k = Math.floor(s.release * 977) + ci * 7, spread = s.z.f.len > 80 ? 1.6 : 1.2;
    return [slabAt(s, s.ends[0], c, tau, a, 1 + spread * (hash(k) - 0.5)),
      slabAt(s, s.ends[1], c, tau, b, 1 + spread * (hash(k + 3) - 0.5))];
  };
  const e0 = new THREE.Vector3(), e1 = new THREE.Vector3();
  const crest = (f, u, t, into) => {
    const s = slabs.find((q) => q.z.f === f && u >= q.ends[0].u && u <= q.ends[1].u);
    if (!s || t < s.release - 0.5) return null;
    course(s, 0, t - s.release, e0, e1);
    into.lerpVectors(e0, e1, (u - s.ends[0].u) / (s.ends[1].u - s.ends[0].u));
    return t - s.release;
  };
  const talus = zones.map((z) => [-16, -2, 12].map((w) => {
    const n = Math.max(2, Math.round(z.f.len * (z.span[1] - z.span[0]) / 3));
    return Array.from({ length: n + 1 }, (_, i) => {
      const u = z.span[0] + (z.span[1] - z.span[0]) * i / n, p = step2(step2(z.f.s, z.f.dir, z.f.len * u), z.f.inward, w);
      return new THREE.Vector3(p[0], rampY(z, u, w) + 0.3, p[1]);
    });
  }));
  const draw = (into, t) => {
    settle(t);
    for (const [zi, z] of zones.entries()) {
      const k = out(progress(t, [z.fall + 0.6, z.fall + 2.2]));
      if (k <= 0 || z.f.len < 80) continue;
      for (const pts of talus[zi]) {
        const n = pts.length - 1, a = Math.floor(n / 2 * (1 - k)), b = Math.ceil(n / 2 * (1 + k));
        for (let i = a; i < b; i++) putc(into, pts[i], pts[i + 1], palette.light);
      }
    }
    for (const [a, b] of statics) putc(into, a, b, inkColor);
    for (const s of slabs) {
      const tau = t - s.release;
      const bastion = s.z.f.len > 80;
      const red = tau < 0 ? clamp01((tau + 0.5) * 2) : bastion ? 1 : 1 - progress(tau, [1.2, 2.4]);
      const color = red > 0 ? c1.copy(inkColor).lerp(accent, red) : inkColor;
      for (const ci of tau < 1.1 || bastion ? [0, 1] : [0]) putc(into, ...course(s, ci, tau, v1, v2), color);
      if (tau < 0) {
        putc(into, slabAt(s, s.ends[0], 0, tau, v1), slabAt(s, s.ends[1], 0, tau, v2), inkColor);
      }
    }
  };
  const top = (z) => step2(step2(z.f.s, z.f.dir, z.f.len * (z.span[0] + z.span[1]) / 2), z.f.inward, 30);
  return { draw, guns: crestGuns, zones, rampY, top, crest };
}

async function storming(breach, siege) {
  const z = breach.zones[2], mid = (z.span[0] + z.span[1]) / 2;
  const at = (w) => step2(step2(z.f.s, z.f.dir, z.f.len * mid), z.f.inward, w);
  const pts = [siege.crest[1], at(-34), at(-10), at(20)];
  const descent = draped([siege.crest[1], at(-34)]), DIG = [T.breachBat + 1, T.b1Fall - 0.3];
  const rv = breach.zones[0];
  const rvCap = planDir(rv.f.s, FORT);
  const rvEnd = [siege.crest[4], step2(rv.f.s, rvCap, -18), step2(rv.f.s, rvCap, 4)];
  const rvPath = draped(rvEnd);
  const nearestColumn = (p) => siege.columns.reduce((a, c) =>
    (Math.hypot(...[c.pts.at(-1)[0] - p[0], c.pts.at(-1)[1] - p[1]])
      < Math.hypot(...[a.pts.at(-1)[0] - p[0], a.pts.at(-1)[1] - p[1]]) ? c : a));
  const rvCol = nearestColumn(siege.crest[4]);
  const rvRun = draped([...rvCol.pts, ...rvEnd]);
  rvRun.trench = lengthOf(rvCol.pts);
  const rvLead = rvRun.length - rvPath.length;
  const flood = dijkstra([nearest(at(42))]);
  const walk = (u) => step2(step2(z.f.s, z.f.dir, z.f.len * u), z.f.inward, 22);
  const branches = [
    ...[FORT, GATES[GATE[0]], GATES[GATE[1]]].map((p) => route(flood, nearest(p))),
    [walk(0.12)], [walk(0.95)],
  ].map((b, i) => {
    const col = siege.columns[i % siege.columns.length];
    return { col: col.pts, rest: [...pts, ...b], lead: lengthOf([...col.pts, ...pts]) - lengthOf(pts) };
  });
  const unkink = (plan) => plan.reduce((kept, p) => {
    const back = () => dot2(planDir(kept.at(-2), kept.at(-1)), planDir(kept.at(-1), p)) < -0.5;
    while (kept.length > 1 && back()) kept.pop();
    kept.push(p);
    return kept;
  }, []);
  const ramped = (plan) => {
    const r = draped(plan);
    for (const p of r.pos) {
      const w = dot2([p.x - z.f.s[0], p.z - z.f.s[1]], z.f.inward);
      if (w > -26 && w < 30) p.y = breach.rampY(z, mid, w) + 0.8;
    }
    return r;
  };
  const houses = plan.buildings.filter((b) => inFort(centroid(b.ring), TC.inner));
  const men = await paced(Array.from({ length: 72 }, (_, m) => m), (m) => {
    const br = branches[m % branches.length], end = br.rest.at(-1);
    const near = houses.filter((h) => Math.hypot(...centroid(h.ring).map((v, i) => v - end[i])) < 45);
    const h = near.length ? near[Math.floor(hash(m + 1300) * near.length)] : null;
    const door = h ? h.ring.reduce((a, q) => (Math.hypot(q[0] - end[0], q[1] - end[1])
      < Math.hypot(a[0] - end[0], a[1] - end[1]) ? q : a)) : end;
    const r = ramped([...br.col, ...unkink([...br.rest, door])]);
    r.lead = br.lead;
    r.trench = lengthOf(br.col);
    return r;
  });
  const spread = (r, d) => smooth(d, r.trench, r.trench + 24) * clamp01((r.length - d) / 20);
  const dash = (into, r, d, side = 0) => {
    if (d < 0) return;
    const e = Math.min(d, r.length);
    along(r, Math.max(0, e - 8), v1);
    along(r, Math.min(r.length, e + 8), v2);
    const l = Math.hypot(v2.x - v1.x, v2.z - v1.z) || 1;
    const hx = (v2.x - v1.x) / l, hz = (v2.z - v1.z) / l;
    const c = along(r, e, v3), cx = c.x - hz * side, cz = c.z + hx * side;
    put(into, v1.set(cx - hx * 2, c.y + 0.8, cz - hz * 2), v2.set(cx + hx * 2, c.y + 0.8, cz + hz * 2));
  };
  return {
    draw: (lines, t) => {
      const kd = out(progress(t, DIG));
      stroke(lines.trench, descent, 0, descent.length * kd);
      if (kd > 0 && kd < 1) stroke(lines.heads, descent, Math.max(0, descent.length * kd - 5), descent.length * kd);
      const k = out(progress(t, [T.rvFall + 0.8, T.rvFall + 2.4]));
      stroke(lines.trench, rvPath, 0, rvPath.length * k);
      if (k > 0 && k < 1) stroke(lines.heads, rvPath, Math.max(0, rvPath.length * k - 5), rvPath.length * k);
      for (let m = 0; m < 5; m++) {
        const ran = (t - T.rvFall + 0.6) * 14 - m * 9 + rvLead - 14 * 3;
        if (ran < 0) continue;
        const d = Math.min(ran, rvRun.length - 3 - m * 2);
        dash(lines.storm, rvRun, d, (hash(m + 40) - 0.5) * 6 * spread(rvRun, d));
      }

      for (let m = 0; m < 72; m++) {
        const wave = Math.floor(m / 12), v = 15 + 7 * hash(m + 300), r = men[m];
        const ran = (t - T.storm - wave * 2.6) * v - (m % 12) * (4 + 3 * hash(m + 700)) + r.lead;
        if (ran < 0 || ran > r.length) continue;
        dash(lines.storm, r, ran, (hash(m + 900) - 0.5) * 14 * spread(r, ran));
      }
    },
  };
}

const play = await ({ whitebox, review, redteam }[MODE]?.() ?? (() => {}));

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

function renderAt(t) {
  relief.scale.y = Math.max(0.001, out(progress(t, RISE)));
  play(t);
  scene.updateMatrixWorld(true);
  renderer.render(scene, camera);
}

const view = capture || q.has('t') || q.has('fixed') ? null
  : orbit(stage, { yaw: [-18, 18], pitch: [-8, Math.min(8, Math.max(0, 89.9 - VIEW.el))] });
const tilt = new THREE.Quaternion(), xAxis = new THREE.Vector3(1, 0, 0);
window.renderAt = renderAt;
window.CAPTURE = num('secs', 8);
window.keys = {};
await renderer.compileAsync(scene, camera);
await breathe();
if (q.has('t')) renderAt(Number(q.get('t')));
else if (capture) renderAt(0);
else {
  let t0 = q.has('wait') ? null : performance.now();
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
    t0 = performance.now();
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
