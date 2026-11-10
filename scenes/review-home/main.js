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
const hash = (n) => ((n * 2654435761) >>> 0) / 4294967296;
let seed = 7;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const own = new Map();
const plotFor = (b) => inside(b)
  && Math.hypot(...centroid(b.ring).map((v, i) => v - TC.gates.utrechtse[i])) < num('plots', 160);
for (const b of blocks) {
  if ((b.id === KRUITHUIS && MODE !== 'whitebox') || (MODE === 'review' && plotFor(b))) own.set(b.id, b);
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
const greyInk = new THREE.Color('#555'), unread = new THREE.Color('#888');
const GATES = TC.gates;
const GATE = Object.keys(GATES);
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

const ROAD_IN = [[294, 324], [302, 240], [301, 222], [300, 215], [294, 191], [294, 171], [297, 104],
  [297, 100], [294, 96], [291, 93], [243, 67], [228, 58], [201, 43], [192, 38]];
const chaikin = (pts, n = 3) => {
  for (let i = 0; i < n; i++) {
    pts = [pts[0], ...pts.slice(0, -1).flatMap((a, k) => {
      const b = pts[k + 1];
      return [[a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
        [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]];
    }), pts.at(-1)];
  }
  return pts;
};
const idm = (v, vmax, gap, dv, s0, { a, b, T }) => {
  const want = s0 + Math.max(0, v * T + v * dv / (2 * Math.sqrt(a * b)));
  return a * (1 - (v / vmax) ** 4 - (want / Math.max(gap, 0.05)) ** 2);
};
const hA = new THREE.Vector3(), hB = new THREE.Vector3();
const headingAt = (r, d, h) => h.subVectors(along(r, Math.min(r.length, d + 3), hA),
  along(r, Math.max(0, d - 3), hB)).setY(0).normalize();
function offsetLine(pts, lane) {
  const r = draped(pts), out = [], h = new THREE.Vector3(), p = new THREE.Vector3();
  for (let d = 0; d <= r.length; d += 1) {
    headingAt(r, d, h);
    along(r, d, p);
    const w = lane(d, r.length);
    out.push([p.x - h.z * w, p.z + h.x * w]);
  }
  return out;
}
function footBox(ring) {
  let u = [1, 0], best = 0;
  ring.forEach(([x, z], i) => {
    const [x2, z2] = ring[(i + 1) % ring.length], l = Math.hypot(x2 - x, z2 - z);
    if (l > best) { best = l; u = [(x2 - x) / l, (z2 - z) / l]; }
  });
  const pu = ring.map(([x, z]) => x * u[0] + z * u[1]), pw = ring.map(([x, z]) => -x * u[1] + z * u[0]);
  const [a0, a1, b0, b1] = [Math.min(...pu), Math.max(...pu), Math.min(...pw), Math.max(...pw)];
  const mu = (a0 + a1) / 2, mw = (b0 + b1) / 2;
  return { c: [mu * u[0] - mw * u[1], mu * u[1] + mw * u[0]], u, len: a1 - a0, wid: b1 - b0 };
}

const DRIVEN = new Set(['residential', 'service', 'tertiary', 'secondary', 'living_street',
  'unclassified', 'pedestrian']);
function roadGraph() {
  const g = new Map();
  const at = (p) => {
    const k = `${p[0]},${p[1]}`;
    if (!g.has(k)) g.set(k, { p, edges: [] });
    return g.get(k);
  };
  for (const s of plan.streets) {
    if (!DRIVEN.has(s.kind)) continue;
    for (let k = 0; k < s.pts.length - 1; k++) {
      const [a, b] = [s.pts[k], s.pts[k + 1]];
      if (!inFort(a, 420 * S) || !inFort(b, 420 * S)) continue;
      const u = at(a), v = at(b), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      u.edges.push({ to: v, len });
      v.edges.push({ to: u, len });
    }
  }
  return g;
}

async function review() {
  const size = num('crate', 4.5), L = size, WD = size, HT = size * 0.55, LANE = size * 1.15;
  const V = num('speed', 22), VIN = V * 1.3, VS = 10, DRIVE = { a: 30, b: 36, T: 0.2 }, S0 = 1.6;
  const LOOK = 0.75, OPEN = 0.45, TURN_TO = 0.15, STOP = 0.8, HOIST = 0.7, ASIDE = 1.1, RISE_FOR = 1.3;
  const GAP = 2.1 * size, BACKD = 2.6 * size, QUEUE = 10;
  const roads = roadGraph(), nodes = [...roads.values()];
  const closest = (p) => nodes.reduce((a, n) => (gap(n, p) < gap(a, p) ? n : a));
  await breathe();
  const gate = closest(ROAD_IN.at(-1)), tree = dijkstra([gate]);
  await breathe();
  const base = chaikin(ROAD_IN);
  const MAIN = draped(offsetLine(base, () => LANE));
  const runAt = (r, p) => r.run[r.pos.reduce((best, q, i) =>
    (Math.hypot(q.x - p[0], q.z - p[1]) < Math.hypot(r.pos[best].x - p[0], r.pos[best].z - p[1])
      ? i : best), 0)];
  const C = runAt(MAIN, [num('bayx', 230), num('bayz', 59.5)]);
  const HALT = C - L / 2 - 2.6;
  const h = headingAt(MAIN, C, new THREE.Vector3()), rt = new THREE.Vector3(-h.z, 0, h.x);
  const P = along(MAIN, C, new THREE.Vector3()).addScaledVector(rt, -LANE);
  const local = (a, lat) => [P.x + h.x * a - h.z * lat, P.z + h.z * a + h.x * lat];
  const OUT = draped(offsetLine(base.slice().reverse(), () => LANE));
  const OUT0 = runAt(OUT, local(HALT - C - 3, -LANE));
  const kerb = (p) => {
    let best = null, bd = Infinity;
    for (const u of nodes) {
      if (!tree.dist.has(u)) continue;
      for (const { to: v } of u.edges) {
        const [ax, az] = u.p, [bx, bz] = v.p, dx = bx - ax, dz = bz - az;
        const f = THREE.MathUtils.clamp(((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
        const q = [ax + dx * f, az + dz * f], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (d < bd) { bd = d; best = [u, v, q, d]; }
      }
    }
    return best;
  };
  const shown = (c) => {
    const v = new THREE.Vector3(c[0], ground(...c), c[1]).applyMatrix4(relief.matrixWorld).project(camera);
    return Math.abs(v.x) < 0.85 && Math.abs(v.y) < num('band', 0.55);
  };
  let lots = [];
  for (const b of own.values()) {
    await breathe();
    if (b.id === KRUITHUIS) continue;
    const box = footBox(b.ring);
    if (!shown(box.c) || box.len < 6 || box.len > num('maxlot', 12.5) || box.wid < 5 || b.h > 2 * box.wid) continue;
    const k = kerb(box.c);
    if (!k || k[3] > 22) continue;
    const [u, v, q] = k, entry = tree.dist.get(u) <= tree.dist.get(v) ? u : v;
    const reach = tree.dist.get(entry) + Math.hypot(q[0] - entry.p[0], q[1] - entry.p[1]);
    lots.push({ b, box, q, entry, ahead: entry === u ? v : u, reach, mesh: meshes.get(b.id) });
  }
  lots = lots.sort((a, b) => a.reach - b.reach).slice(0, num('lots', 14));
  for (const l of lots) {
    await breathe();
    const tail = chaikin([base.at(-1), ...route(tree, l.entry).slice(1), l.q, l.box.c], 2);
    l.r = draped(offsetLine([...base, ...tail.slice(1)], (d) =>
      LANE * THREE.MathUtils.clamp((C + 22 - d) / 14, 0, 1)));
  }
  window.lots = lots;
  const unbuilt = [...own.values()].filter((b) => !lots.some((l) => l.b === b));
  for (const b of unbuilt) relief.remove(meshes.get(b.id));
  await breathe();
  if (unbuilt.length) relief.add(block(mergeGeometries(unbuilt.map((b) =>
    meshes.get(b.id).geometry.clone().translate(0, floor(b), 0)))));
  const GATE_LAT = [2 * LANE + 0.4, -0.4];
  const plate = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]]
    .map(([u, v]) => local(HALT - C + u * (L / 2 + 1.8), LANE + v * (LANE - 0.5)));
  relief.add(staticLines([plate], material('ink'), 0.3));
  relief.add(staticLines([...lots.map((l) => [...l.b.ring, l.b.ring[0]]),
    ...[-1, 1].map((s) => offsetLine(base, () => s * (2 * LANE)))], material('light'), 0.3));

  const T_START = -16, DT = 1 / 120;
  const log = (window.reviewLog = []);
  let crates, simT, k, nextAt, cursor, opening;
  const reset = () => {
    crates = []; log.length = 0; simT = T_START; k = 0; nextAt = T_START; cursor = 0; opening = 0;
    for (const l of lots) Object.assign(l, { level: 1, prev: 1, at: -Infinity, visits: 0, busy: false });
  };
  reset();
  const pick = () => {
    for (let i = 0; i < lots.length; i++) {
      const l = lots[(cursor + i) % lots.length];
      if (l.busy) continue;
      cursor = (cursor + i + 1) % lots.length;
      l.busy = true;
      return l;
    }
    return null;
  };
  const failing = (n) => [1, 5, 8, 12].includes(n % 15);
  const spawn = () => {
    const queued = crates.filter((c) => c.phase === 'in');
    if (queued.length >= QUEUE || (queued.length && queued.at(-1).s < L + S0 + 10)) return;
    let lot = null;
    const fail = failing(k) || !(lot = pick());
    crates.push({ k, fail, lot, r: fail ? MAIN : lot.r, s: 0, v: V * 0.9, phase: 'in',
      since: simT, move: null, p: new THREE.Vector3(), h: new THREE.Vector3() });
    log.push([k, 'spawn', +simT.toFixed(2)]);
    k++;
    nextAt = simT + num('every', 0.8) * (0.6 + 0.8 * hash(k * 11 + 1));
  };
  const enter = (c, phase) => {
    c.phase = phase;
    c.since = simT;
    if (log.length < 400) log.push([c.k, phase, +simT.toFixed(2)]);
  };
  const ahead = (c) => {
    let best = Infinity, dv = 0;
    for (const o of crates) {
      if (o === c || o.k > c.k || (o.phase !== 'go' && o.phase !== 'out')) continue;
      const dx = o.p.x - c.p.x, dz = o.p.z - c.p.z;
      const fwd = dx * c.h.x + dz * c.h.z, side = Math.abs(dx * c.h.z - dz * c.h.x);
      if (fwd > 0 && fwd < 40 && side < WD + 1 && fwd - L < best) {
        best = fwd - L;
        dv = c.v - o.v;
      }
    }
    return [best, dv];
  };
  const limit = (s) => {
    const nose = s + L / 2, rear = s - L / 2;
    if (rear > C + 1) return V;
    if (nose > C - 2) return VS;
    return Math.min(V, Math.sqrt(VS * VS + 2 * 14 * (C - 2 - nose)));
  };
  const aside = (age, p) => {
    const x = Math.min(1, age / ASIDE), back = BACKD * x ** 1.4;
    const u = THREE.MathUtils.smootherstep((back - 0.2) / (0.9 * size), 0, 1);
    const [px, pz] = local(HALT - C - back, LANE * Math.cos(Math.PI * u));
    return p.set(px, ground(px, pz) + 0.6, pz);
  };
  function step() {
    if (simT >= nextAt) spawn();
    for (const c of crates) {
      if (c.phase === 'aside') { aside(simT - c.since, c.p); c.h.copy(h); }
      else { along(c.r, c.s, c.p); headingAt(c.r, c.s, c.h); }
    }
    let lead = null;
    for (const c of crates) {
      const age = simT - c.since;
      if (c.phase === 'in') {
        if (!c.move && (!lead || lead.phase === 'go') && opening < 0.01 && c.v < 3 && HALT - c.s < 20) {
          const D = HALT - c.s;
          c.move = { s0: c.s, t0: simT, D, T: Math.max(0.45, 2 * Math.sqrt(D / 50)) };
        }
        if (c.move) {
          const x = Math.min(1, (simT - c.move.t0) / c.move.T);
          let s = c.move.s0 + c.move.D * x * x * x * (10 - 15 * x + 6 * x * x);
          if (lead) s = Math.min(s, lead.s - L - S0);
          c.v = Math.max(0, (s - c.s) / DT);
          c.s = Math.max(c.s, s);
          lead = { s: c.s - GAP, v: c.v, phase: 'hold' };
          if (x >= 1) { c.s = HALT; c.v = 0; c.move = null; enter(c, 'stop'); }
          continue;
        }
        const vmax = Math.max(limit(c.s), 0.1);
        let acc = c.v > vmax ? -(c.v - vmax) * 6 : idm(c.v, vmax, Infinity, 0, S0, DRIVE);
        if (lead) acc = Math.min(acc, idm(c.v, vmax, lead.s - c.s - L, c.v - lead.v, S0, DRIVE));
        acc = Math.min(acc, idm(c.v, vmax, HALT - c.s + 0.3, c.v, 0.2, DRIVE));
        c.v = Math.max(0, c.v + acc * DT);
        c.s += c.v * DT;
        lead = c;
      } else if (c.phase === 'stop') {
        lead = { s: c.s - GAP, v: 0, phase: 'hold' };
        if (c.fail ? age > STOP : age > LOOK + 0.05) {
          if (c.fail) enter(c, 'aside');
          else { enter(c, 'go'); c.r = c.lot.r; c.v = 0; }
        }
      } else if (c.phase === 'aside') {
        if (age < ASIDE * 0.8) lead = { s: HALT - GAP, v: 0, phase: 'hold' };
        if (age > ASIDE) { enter(c, 'out'); c.r = OUT; c.s = OUT0 + BACKD; c.v = 1.4 * BACKD / ASIDE; }
      } else if (c.phase === 'go' || c.phase === 'out') {
        const [g, dv] = ahead(c);
        const acc = Math.min(idm(c.v, c.phase === 'go' ? VIN : V, c.r.length - c.s + 0.3, c.v, 0.2, DRIVE),
          idm(c.v, c.phase === 'go' ? VIN : V, g, dv, S0, DRIVE));
        c.v = Math.max(0, c.v + acc * DT);
        c.s = Math.min(c.r.length, c.s + c.v * DT);
        if (c.phase === 'go' && c.s < C + 40) lead = c;
        if (c.phase === 'out' && c.s > c.r.length - 1) c.phase = 'gone';
        else if (c.phase === 'go' && c.s > c.r.length - 0.6) {
          const l = c.lot;
          l.prev = l.level;
          l.level = Math.min(1 + 3 * 3.2 / l.b.h, l.level + 3.2 / l.b.h);
          l.at = simT;
          l.visits++;
          l.busy = false;
          c.phase = 'gone';
        }
      }
    }
    let open = false;
    for (const c of crates) {
      if (c.phase === 'stop' && !c.fail && simT - c.since > LOOK) open = true;
      if (c.phase === 'go' && c.s - L / 2 < C + 1.5) open = true;
    }
    opening = THREE.MathUtils.clamp(opening + (open ? 1 / OPEN : -1 / 0.5) * DT, 0, 1);
    if (crates.some((c) => c.phase === 'gone')) crates = crates.filter((c) => c.phase !== 'gone');
    simT += DT;
  }
  window.reviewCrates = () => crates;

  const lines = colorLines(2400, 1.3, 3);
  const box = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), depthMaterial(1.5), 128);
  box.renderOrder = -1;
  box.frustumCulled = false;
  relief.add(box);
  const up = new THREE.Vector3(0, 1, 0), right = new THREE.Vector3(), dir = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  const ctr = new THREE.Vector3(), pa = new THREE.Vector3(), pb = new THREE.Vector3();
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5],
    [2, 6], [3, 7]];
  const crate = (p, yaw, color, { l = L, w = WD, lift = 0, hgt = HT, fixed = false, over = [] } = {}) => {
    dir.set(Math.cos(yaw), 0, -Math.sin(yaw));
    right.set(-dir.z, 0, dir.x);
    let y = p.y;
    if (!fixed) {
      y = -Infinity;
      for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x = p.x + dir.x * u * l / 2 + right.x * v * w / 2;
        const z = p.z + dir.z * u * l / 2 + right.z * v * w / 2;
        y = Math.max(y, ground(x, z) + 0.15);
      }
    }
    for (let i = 0; i < 8; i++) {
      corners[i].copy(p).setY(y).addScaledVector(dir, (i & 1 ? 0.5 : -0.5) * l)
        .addScaledVector(right, (i & 2 ? 0.5 : -0.5) * w).addScaledVector(up, lift + (i & 4 ? hgt : 0));
    }
    for (const [a, b] of EDGES) putc(lines, corners[a], corners[b], color);
    for (const [from, to, col] of over) {
      for (const [a, b] of EDGES) {
        if (a + 1 === b) {
          putc(lines, pa.lerpVectors(corners[a], corners[b], from),
            pb.lerpVectors(corners[a], corners[b], to), col);
        } else if ((a & 1 ? to : 1 - from) >= 1) putc(lines, corners[a], corners[b], col);
      }
    }
    if (box.count < 128) {
      ctr.copy(p).setY(y).addScaledVector(up, lift + hgt / 2);
      quat.setFromAxisAngle(up, yaw);
      box.setMatrixAt(box.count++, m4.compose(ctr, quat, scl.set(l, hgt, w)));
    }
  };
  const at = (a, lat, lift, v) => {
    const [x, z] = local(a, lat);
    return v.set(x, ground(x, z) + lift, z);
  };
  const yawOf = (v) => Math.atan2(-v.z, v.x);

  while (simT < 0) {
    await breathe();
    step();
  }
  return (t) => {
    if (t < simT - DT) reset();
    while (simT < t) step();
    lines.n = 0;
    box.count = 0;
    for (const c of crates) {
      const age = t - c.since;
      if (c.phase === 'in') {
        crate(c.p, yawOf(c.h), unread);
        continue;
      }
      if (c.phase === 'stop') {
        const lift = HOIST * Math.sin(Math.PI * THREE.MathUtils.smoothstep(age / LOOK, 0, 1));
        const x = THREE.MathUtils.smoothstep((age - LOOK * 0.8) / TURN_TO, 0, 1);
        crate(c.p, yawOf(c.h), c1.copy(unread).lerp(c.fail ? accent : inkColor, x), { lift });
        continue;
      }
      crate(c.p, yawOf(c.h), c.fail ? accent : inkColor);
    }
    const slide = THREE.MathUtils.smootherstep(opening, 0, 1), RH = HT * 0.6;
    const [kerbLat, crownLat] = GATE_LAT, span = kerbLat - crownLat;
    for (const lat of GATE_LAT) {
      at(0, lat, 0, pa);
      putc(lines, pa, pb.copy(pa).addScaledVector(up, RH + 0.5), inkColor);
    }
    at(0, crownLat + span * slide, RH, pa);
    at(0, kerbLat + span * slide, RH, pb);
    putc(lines, pa, pb, inkColor);
    flushc(lines);
    box.instanceMatrix.needsUpdate = true;
    for (const l of lots) {
      const s = l.prev + (l.level - l.prev) * THREE.MathUtils.smoothstep(progress(t, [l.at, l.at + RISE_FOR]), 0, 1);
      l.mesh.scale.y = Math.max(0.001, s);
      l.mesh.userData.lines.color.copy(l.level > 0 && t >= l.at ? inkColor : faint);
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

scene.updateMatrixWorld(true);
camera.updateMatrixWorld();
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
window.scr = (x, z, lift = 0) => {
  const v = new THREE.Vector3(x, ground(x, z) + lift, z).applyMatrix4(relief.matrixWorld).project(camera);
  return [Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * H)];
};
window.probe = { ground, graph, nearest, dijkstra, route, plan, TC };
