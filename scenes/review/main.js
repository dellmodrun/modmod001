import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { orbit } from '../shared/orbit.js';
import {
  palette, lineMaterial, depthMaterial, Silhouette,
} from '../../hero/src/edges.js';

const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
const W = num('w', 1250), H = num('h', 610);
const capture = q.has('capture');
if (capture) document.body.dataset.capture = '';

palette.ink.set('#111');
palette.light.set('#a8a8a8');
palette.faint.set('#d6d6d6');
palette.ground = new THREE.Color('#e6e6e6');
const TICK = palette.light.clone().lerp(palette.faint, 0.8);
palette.accent.set('#d02020');
const REVIEW = new THREE.Color('#385e95');

const EL = 22, AZ = -28, DRIFT = 2.5, RULE_AZ = 78;
const VIEW = {
  el: num('el', EL), az: num('az', AZ), roll: num('roll', 0),
  size: num('size', 140), fx: num('fx', 0.64), fy: num('fy', 0.76),
};

const DEG = Math.PI / 180, TAU = Math.PI * 2;
const SETTLE = 47.5, CRANK = 8;
const PLATE_Y = -38, PLATE_R = 92, BAND_IN = 100, BAND_OUT = 118, HOOP = 103, SUN = 7;
const UNIT = VIEW.size / H;
const PX = Math.min(1, (4 + H / 170) / 7.5) * UNIT;
const BIG = 7.5 * PX, SMALL = 0.6 * BIG;
const SMALL_SHARE = 0.3, DISMISS_SHARE = 0.25, FRONT_SHARE = 0.5;
const BRANCH = 1, RING = 0.7, TURN = 0.45, HOLD = 9, PASS = 6, FADE = 2.4;
const REACH = 0.7;

const ORBITS = [
  { r: 22, tilt: 34, node: 10, every: 9, planet: 2.2, w: 1.6 },
  { r: 33, tilt: 13, node: 55, every: 8, planet: 2.8, w: 1.8 },
  { r: 45, tilt: 25, node: 290, every: 7, planet: 3.1, w: 2 },
  { r: 58, tilt: 14, node: 100, every: 6.5, planet: 2.7, w: 2.2 },
  { r: 72, tilt: 19, node: 340, every: 6, planet: 4.8, w: 2.4 },
  { r: 87, tilt: 15, node: 135, every: 6, planet: 4.2, w: 2.6, ringed: true },
];

function hash(a, b, c) {
  let h = Math.imul(a + 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  h = Math.imul(h ^ Math.imul(c + 0x27d4eb2f, 0x165667b1), 0x2c1b3c6d);
  h ^= h >>> 15; h = Math.imul(h, 0x297a2d39); h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const span = (t, from, d) => ease((t - from) / d);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const Y = new THREE.Vector3(0, 1, 0);
const ruleNormal = new THREE.Vector3(-Math.sin(RULE_AZ * DEG), 0, Math.cos(RULE_AZ * DEG));
const toward = new THREE.Vector3(
  Math.cos(EL * DEG) * Math.sin(AZ * DEG), Math.sin(EL * DEG),
  Math.cos(EL * DEG) * Math.cos(AZ * DEG),
);
ORBITS.forEach((o, k) => {
  const n = o.node * DEG, i = o.tilt * DEG;
  o.u = new THREE.Vector3(Math.cos(n), 0, Math.sin(n));
  o.v = new THREE.Vector3(Math.sin(n), 0, -Math.cos(n)).multiplyScalar(Math.cos(i))
    .addScaledVector(Y, Math.sin(i));
  o.n = o.u.clone().cross(o.v);
  o.omega = TAU / (11.5 * (o.r / 22) ** 1.5);
  o.phase = hash(k, 0, 9) * TAU;
  o.hold = Math.min(HOLD, 2.2 / o.omega);
  o.life = 2.9 / o.omega + HOLD + BRANCH + FADE + 1;
  o.arm = -20 - 3 * k;
  o.sleeve = 1 + 0.7 * (k + 1);
  o.out = Math.sign(o.n.dot(toward)) || 1;
  const cross = Math.atan2(-o.u.dot(ruleNormal), o.v.dot(ruleNormal));
  const facing = o.u.dot(toward) * Math.cos(cross) + o.v.dot(toward) * Math.sin(cross);
  o.front = cross + (facing > 0 ? 0 : Math.PI);
});

function pt(o, theta, rho, out) {
  const c = Math.cos(theta) * rho, s = Math.sin(theta) * rho;
  out[0] = o.u.x * c + o.v.x * s;
  out[1] = o.u.y * c + o.v.y * s;
  out[2] = o.u.z * c + o.v.z * s;
  return out;
}

const stage = document.querySelector('.stage');
stage.style.width = `${W}px`;
stage.style.height = `${H}px`;
const canvas = stage.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const pr = capture ? num('dpr', 2) : Math.min(devicePixelRatio, 2);
renderer.setPixelRatio(pr);
renderer.setSize(W, H, false);
renderer.setClearColor(0xffffff, 1);

const scene = new THREE.Scene();
const pivot = new THREE.Group();
scene.add(pivot);
const camera = new THREE.OrthographicCamera(
  -VIEW.fx * W * UNIT, (1 - VIEW.fx) * W * UNIT, VIEW.fy * H * UNIT, -(1 - VIEW.fy) * H * UNIT,
  100, 700,
);
camera.position.set(0, 0, 400);

const material = (tone, width) => {
  const m = lineMaterial({ tone, msaa: false });
  m.resolution.set(W * pr, H * pr);
  m.linewidth = width;
  return m;
};
function addLines(positions, tone, width, parent = pivot) {
  const g = positions.isBufferGeometry
    ? positions : new LineSegmentsGeometry().setPositions(positions);
  const line = new LineSegments2(g, material(tone, width));
  line.frustumCulled = false;
  line.renderOrder = 1;
  parent.add(line);
}
function occluder(geo) {
  const mesh = new THREE.Mesh(geo, depthMaterial(1));
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  pivot.add(mesh);
  return mesh;
}
function weld(geo) {
  const g = new THREE.BufferGeometry().setAttribute('position', geo.attributes.position);
  if (geo.index) g.setIndex(geo.index);
  return mergeVertices(g, 1e-3);
}

const outlines = [];
function solid(geo) {
  const mesh = occluder(weld(geo));
  const outline = new Silhouette(mesh, [material('ground', 1)]);
  outline.lines.forEach((l) => { l.renderOrder = 1; });
  outlines.push(outline);
  return mesh;
}

function circle(out, c, a, b, r, n, from = 0, to = TAU) {
  for (let s = 0; s < n; s++) {
    const t0 = from + (to - from) * s / n, t1 = from + (to - from) * (s + 1) / n;
    for (const t of [t0, t1]) {
      out.push(
        c[0] + r * (Math.cos(t) * a[0] + Math.sin(t) * b[0]),
        c[1] + r * (Math.cos(t) * a[1] + Math.sin(t) * b[1]),
        c[2] + r * (Math.cos(t) * a[2] + Math.sin(t) * b[2]),
      );
    }
  }
}

function buildBand() {
  const shape = new THREE.Shape();
  for (let i = 0; i <= 12; i++) {
    const a = (i + 0.5) * TAU / 12;
    shape[i ? 'lineTo' : 'moveTo'](Math.cos(a) * BAND_OUT, Math.sin(a) * BAND_OUT);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, BAND_IN, 0, TAU, true);
  shape.holes.push(hole);
  occluder(new THREE.ShapeGeometry(shape, 160).rotateX(Math.PI / 2));
  const lines = [];
  for (let i = 0; i < 12; i++) {
    const a = (i + 0.5) * TAU / 12, b = (i + 1.5) * TAU / 12;
    lines.push(Math.cos(a) * BAND_OUT, 0.05, Math.sin(a) * BAND_OUT);
    lines.push(Math.cos(b) * BAND_OUT, 0.05, Math.sin(b) * BAND_OUT);
  }
  circle(lines, [0, 0.05, 0], [1, 0, 0], [0, 0, 1], BAND_IN, 240);
  for (let i = 0; i < 360; i += 5) {
    const a = i * DEG, c = Math.cos(a), s = Math.sin(a);
    const out = BAND_IN + (i % 15 === 0 ? 6 : 3);
    lines.push(c * BAND_IN, 0.05, s * BAND_IN, c * out, 0.05, s * out);
  }
  addLines(lines, 'ground', 1);
}

const PILLAR = [[0.01, 0], [2.6, 0], [2.6, 1.6], [1.7, 2.4], [2.6, 6], [2.8, 8.5], [1.4, 13],
  [1.1, 15], [1.2, 34], [2.1, 36], [1.3, 38], [2.6, 41.5], [2.6, 44], [0.01, 44]];
const FINIAL = [[0.01, 0], [1.6, 0], [1.6, 0.8], [0.8, 1.6], [1.9, 3.6], [0.6, 6], [0.25, 9.5],
  [0.01, 9.6]];
function buildFrame() {
  for (let i = 0; i < 12; i++) {
    const a = (i + 0.5) * TAU / 12, x = Math.cos(a) * 113, z = Math.sin(a) * 113;
    for (const [profile, y] of [[PILLAR, -46], [FINIAL, 0.02]]) {
      const lathe = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 18);
      solid(lathe).position.set(x, y, z);
    }
  }
  occluder(new THREE.CircleGeometry(PLATE_R, 192).rotateX(-Math.PI / 2).translate(0, PLATE_Y, 0));
  const rim = [];
  circle(rim, [0, PLATE_Y, 0], [1, 0, 0], [0, 0, 1], PLATE_R, 192);
  addLines(rim, 'ground', 1);
}

function buildSpindle() {
  solid(new THREE.CylinderGeometry(0.9, 0.9, -PLATE_Y - 6, 16, 1)).position.y = PLATE_Y / 2 - 3;
  for (const o of ORBITS) {
    const h = o.arm - PLATE_Y, collar = o.sleeve + 0.9;
    solid(new THREE.CylinderGeometry(o.sleeve, o.sleeve, h, 20, 1)).position.y = PLATE_Y + h / 2;
    solid(new THREE.CylinderGeometry(collar, collar, 1.8, 20, 1)).position.y = o.arm;
    o.planetMesh = occluder(new THREE.SphereGeometry(o.planet, 20, 14));
  }
  occluder(new THREE.SphereGeometry(SUN, 28, 20));
}

function buildOrbits() {
  const a = [0, 0, 0], b = [0, 0, 0];
  for (const o of ORBITS) {
    const n = 64 + Math.round(o.r * 1.6), out = [];
    const band = new THREE.RingGeometry(o.r - o.w / 2, o.r + o.w / 2, n, 1);
    occluder(band.applyMatrix4(new THREE.Matrix4().makeBasis(o.u, o.v, o.n)));
    for (const rho of [o.r - o.w / 2, o.r + o.w / 2]) {
      for (let s = 0; s < n; s++) {
        out.push(...pt(o, TAU * s / n, rho, a), ...pt(o, TAU * (s + 1) / n, rho, b));
      }
    }
    addLines(out, 'light', 1);
  }
}

function drawTicks(o, psi) {
  const inner = o.r - o.w / 2;
  for (let i = 0; i < 36; i++) {
    const a = psi + i * TAU / 36;
    put(grads, pt(o, a, inner, A), pt(o, a, o.r, B), TICK);
  }
}

function strip(out, marks, normalAz, w, [step, every, frac]) {
  const a = [Math.cos(normalAz + Math.PI / 2), 0, Math.sin(normalAz + Math.PI / 2)];
  const nx = Math.cos(normalAz) * w / 2, nz = Math.sin(normalAz) * w / 2;
  circle(out, [nx, 0, nz], a, [0, 1, 0], HOOP, 360, 0, Math.PI);
  circle(out, [-nx, 0, -nz], a, [0, 1, 0], HOOP, 360, 0, Math.PI);
  const face = [], index = [];
  for (let d = 0; d <= 180; d++) {
    const x = a[0] * Math.cos(d * DEG) * HOOP, y = Math.sin(d * DEG) * HOOP;
    const z = a[2] * Math.cos(d * DEG) * HOOP;
    face.push(x + nx, y, z + nz, x - nx, y, z - nz);
    if (d) index.push(2 * d - 2, 2 * d - 1, 2 * d, 2 * d - 1, 2 * d + 1, 2 * d);
  }
  const fill = new THREE.BufferGeometry()
    .setAttribute('position', new THREE.Float32BufferAttribute(face, 3));
  occluder(fill.setIndex(index));
  for (let d = 0; d <= 180; d += step) {
    const t = d * DEG, f = d % every === 0 ? 1 : frac;
    const x = a[0] * Math.cos(t) * HOOP, y = Math.sin(t) * HOOP, z = a[2] * Math.cos(t) * HOOP;
    marks.push(x + nx, y, z + nz, x + nx - 2 * nx * f, y, z + nz - 2 * nz * f);
  }
}

function buildHoops() {
  const rule = [], marks = [];
  strip(rule, marks, (RULE_AZ - 90) * DEG, 4.2, [5, 15, 0.35]);
  const a = [Math.cos(RULE_AZ * DEG), 0, Math.sin(RULE_AZ * DEG)];
  const n = [-a[2] * 3.4, 0, a[0] * 3.4];
  for (const s of [-1, 1]) {
    const c = [0, 1, 2].map((d) => s * a[d] * HOOP);
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([i, j]) => [
      c[0] + i * a[0] * 3.2 + j * n[0], 0.06, c[2] + i * a[2] * 3.2 + j * n[2],
    ]);
    for (let i = 0; i < 4; i++) rule.push(...corners[i], ...corners[i + 1]);
  }
  addLines(rule, 'ink', 1.5);
  addLines(marks, 'ink', 1);
}

function dynLayer(width, cap) {
  const g = new LineSegmentsGeometry()
    .setPositions(new Float32Array(cap * 6)).setColors(new Float32Array(cap * 6));
  const m = material('ink', width);
  m.color = new THREE.Color(1, 1, 1);
  m.vertexColors = true;
  const line = new LineSegments2(g, m);
  line.frustumCulled = false;
  line.renderOrder = 2;
  pivot.add(line);
  return {
    g, cap, n: 0,
    p: g.attributes.instanceStart.data,
    c: g.attributes.instanceColorStart.data,
  };
}
const thin = dynLayer(1, 9000), bold = dynLayer(1.5, 2400), grads = dynLayer(1, 600);

function put(l, a, b, col) {
  if (l.n >= l.cap) return;
  const o = l.n * 6, p = l.p.array, c = l.c.array;
  p[o] = a[0]; p[o + 1] = a[1]; p[o + 2] = a[2];
  p[o + 3] = b[0]; p[o + 4] = b[1]; p[o + 5] = b[2];
  c[o] = c[o + 3] = col.r; c[o + 1] = c[o + 4] = col.g; c[o + 2] = c[o + 5] = col.b;
  l.n++;
}
function flush(l) {
  for (const d of [l.p, l.c]) {
    d.clearUpdateRanges();
    d.addUpdateRange(0, l.n * 6);
    d.needsUpdate = true;
  }
  l.g.instanceCount = l.n;
}

const SHADE = [0.74, 0.74, 1, 1, 0.87, 0.87];
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
cubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(
  Array.from({ length: 72 }, (_, i) => SHADE[Math.floor(i / 12)]), 3,
));
const cubes = new THREE.InstancedMesh(
  cubeGeo, new THREE.MeshBasicMaterial({ vertexColors: true }), 160,
);
cubes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(160 * 3), 3);
cubes.frustumCulled = false;
cubes.renderOrder = 3;
pivot.add(cubes);

buildBand();
buildFrame();
buildSpindle();
buildHoops();
buildOrbits();

const A = [0, 0, 0], B = [0, 0, 0], P = [0, 0, 0], ORIGIN = [0, 0, 0];
const ex = new THREE.Vector3(), ey = new THREE.Vector3(), ez = new THREE.Vector3();
const col = new THREE.Color(), col2 = new THREE.Color();
const look = new THREE.Matrix4(), eyeQ = new THREE.Quaternion(), rollQ = new THREE.Quaternion();
const eyeP = new THREE.Vector3(), ZERO = new THREE.Vector3();

function aim(t) {
  const az = (VIEW.az + DRIFT * Math.sin(TAU * t / 60)) * DEG;
  const el = (VIEW.el + DRIFT * 0.4 * Math.sin(TAU * t / 88 + 1)) * DEG;
  eyeP.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  look.lookAt(eyeP, ZERO, Y);
  rollQ.setFromAxisAngle(ez.set(0, 0, 1), VIEW.roll * DEG);
  eyeQ.setFromRotationMatrix(look).multiply(rollQ);
  pivot.quaternion.copy(eyeQ).invert();
  ex.set(1, 0, 0).applyQuaternion(eyeQ);
  ey.set(0, 1, 0).applyQuaternion(eyeQ);
  ez.set(0, 0, 1).applyQuaternion(eyeQ);
}

function screenCircle(l, c, r, color, from = 0, sweep = TAU, n = 36) {
  const steps = Math.max(1, Math.ceil(n * sweep / TAU));
  for (let s = 0; s < steps; s++) {
    const a0 = from + sweep * s / steps, a1 = from + sweep * (s + 1) / steps;
    for (let d = 0; d < 3; d++) {
      A[d] = c[d] + r * (Math.cos(a0) * ex.getComponent(d) + Math.sin(a0) * ey.getComponent(d));
      B[d] = c[d] + r * (Math.cos(a1) * ex.getComponent(d) + Math.sin(a1) * ey.getComponent(d));
    }
    put(l, A, B, color);
  }
}

function drawCarrier(o, psi) {
  pt(o, psi, o.r, P);
  const az = Math.atan2(P[2], P[0]), collar = o.sleeve + 0.9;
  A[0] = Math.cos(az) * collar; A[1] = o.arm; A[2] = Math.sin(az) * collar;
  B[0] = P[0]; B[1] = o.arm; B[2] = P[2];
  put(thin, A, B, palette.ground);
  o.planetMesh.position.set(P[0], P[1], P[2]);
  screenCircle(thin, P, o.planet, palette.faint, 0, TAU, 40);
  if (o.ringed) drawRinglet();
  A[0] = P[0]; A[1] = o.arm + 0.3; A[2] = P[2];
  B[0] = P[0]; B[1] = P[1] - o.planet * 0.9; B[2] = P[2];
  put(thin, A, B, palette.faint);
}

const RINGLET_A = [1, 0, 0], RINGLET_B = [0, Math.sin(0.45), Math.cos(0.45)];
function drawRinglet() {
  for (const r of [7.6]) {
    for (let s = 0; s < 48; s++) {
      const a0 = TAU * s / 48, a1 = TAU * (s + 1) / 48;
      for (let d = 0; d < 3; d++) {
        A[d] = P[d] + r * (Math.cos(a0) * RINGLET_A[d] + Math.sin(a0) * RINGLET_B[d]);
        B[d] = P[d] + r * (Math.cos(a1) * RINGLET_A[d] + Math.sin(a1) * RINGLET_B[d]);
      }
      put(thin, A, B, palette.light);
    }
  }
}

function drawSun(t) {
  screenCircle(bold, ORIGIN, SUN, REVIEW, 0, TAU, 48);
  const c = Math.cos(TAU * t / 40), sn = Math.sin(TAU * t / 40);
  for (let s = 0; s < 48; s++) {
    const a0 = TAU * s / 48, a1 = TAU * (s + 1) / 48;
    A[0] = SUN * Math.cos(a0); A[1] = 0; A[2] = SUN * Math.sin(a0);
    B[0] = SUN * Math.cos(a1); B[1] = 0; B[2] = SUN * Math.sin(a1);
    put(thin, A, B, TICK);
    A[0] = SUN * Math.sin(a0) * c; A[1] = SUN * Math.cos(a0); A[2] = SUN * Math.sin(a0) * sn;
    B[0] = SUN * Math.sin(a1) * c; B[1] = SUN * Math.cos(a1); B[2] = SUN * Math.sin(a1) * sn;
    put(thin, A, B, TICK);
  }
}

const F = {}, G = {};
function finding(k, j, out) {
  const o = ORBITS[k];
  out.ts = o.every * (j + 0.1 + 0.8 * hash(k, j, 1));
  out.big = hash(k, j, 2) > SMALL_SHARE;
  out.dismiss = out.big && hash(k, j, 3) < DISMISS_SHARE;
  let delta = Math.min(Math.max(o.omega * (3 + 10 * hash(k, j, 4)), 0.5), 2.9);
  const node = o.front + (hash(k, j, 5) < FRONT_SHARE ? 0 : Math.PI);
  const planet = o.phase + o.omega * out.ts;
  if (Math.abs(wrap(node - delta - planet)) < 0.3) delta += delta > 1.5 ? -0.45 : 0.45;
  out.theta0 = node - delta;
  out.tc = out.ts + delta / o.omega;
  out.fade = out.big ? out.tc + (out.dismiss ? RING : BRANCH) + o.hold : out.tc + PASS;
  const lean = Math.abs(toward.dot(tan.set(0, 0, 0).addScaledVector(o.u, -Math.sin(node))
    .addScaledVector(o.v, Math.cos(node))));
  const across = o.r * Math.sqrt(1 - lean * lean);
  out.arc = Math.min(Math.max(72 * PX / across, 0.06), 0.7);
  out.reach = Math.min(Math.max(17 / across, 0.06), 0.7);
  out.angle = out.theta0 - o.omega * out.ts;
  return out;
}

function crowded(k, j) {
  const o = ORBITS[k];
  for (let p = j - 1; o.every * (p + 1) + o.life > F.ts; p--) {
    finding(k, p, G);
    const d = wrap(F.angle - G.angle);
    if (G.fade + FADE > F.ts && d > -F.reach - 0.1 && d < G.reach + 0.1) return true;
  }
  return false;
}

const cubeM = new THREE.Matrix4(), tan = new THREE.Vector3(), rad = new THREE.Vector3();
const pos = new THREE.Vector3(), scl = new THREE.Vector3(), side = new THREE.Vector3();
let cubeCount = 0;
function drawFinding(o, f, t) {
  const theta = f.theta0 + o.omega * (t - f.ts);
  pt(o, theta, o.r, P);
  const dim = span(t, f.fade, FADE / 2), gone = span(t, f.fade + FADE / 2, FADE / 2);
  const size = Math.max((f.big ? BIG : SMALL) * span(t, f.ts, 0.8) * (1 - gone), 1e-4);
  col.copy(palette.accent);
  if (f.big) drawFix(P, f, t);
  if (f.big && t > f.tc && f.dismiss) {
    const fall = span(t, f.tc + RING, TURN);
    col2.copy(palette.ink).lerp(palette.light, fall);
    screenCircle(bold, P, size * 1.3, col2, Math.PI / 2, span(t, f.tc, RING) * TAU, 32);
    col.lerp(palette.light, fall);
  } else if (f.big && t > f.tc) {
    col2.copy(palette.ink).lerp(palette.light, dim);
    drawBranch(o, f, theta, t, col2);
    col.lerp(palette.ink, span(t, f.tc + BRANCH, TURN)).lerp(palette.light, dim);
  }
  tan.set(0, 0, 0).addScaledVector(o.u, -Math.sin(theta)).addScaledVector(o.v, Math.cos(theta));
  rad.set(0, 0, 0).addScaledVector(o.u, Math.cos(theta)).addScaledVector(o.v, Math.sin(theta));
  cubeM.makeBasis(tan, o.n, rad).scale(scl.setScalar(size)).setPosition(pos.fromArray(P));
  cubes.setMatrixAt(cubeCount, cubeM);
  cubes.setColorAt(cubeCount, col);
  cubeCount++;
}

function drawFix(at, f, t) {
  const r = Math.hypot(at[0], at[1], at[2]);
  const head = SUN + (r - SUN) * span(t, f.tc - REACH, REACH);
  const tail = SUN + (r - SUN) * span(t, f.tc, f.dismiss ? RING : BRANCH);
  if (t < f.tc - REACH || tail >= head) return;
  for (let d = 0; d < 3; d++) {
    A[d] = at[d] * tail / r;
    B[d] = at[d] * head / r;
  }
  put(bold, A, B, REVIEW);
}

const lane = (x) => ease(x / 0.28) * ease((1 - x) / 0.28);
function drawBranch(o, f, theta, t, color) {
  const from = span(t, f.fade + FADE / 2, FADE / 2), steps = 24;
  const end = span(t, f.tc, BRANCH) * steps;
  const h = 12 * PX * (1 - span(t, f.fade, FADE / 2));
  for (let s = Math.floor(from * steps); s < end; s++) {
    const u0 = Math.max(s / steps, from), u1 = Math.min(s + 1, end) / steps;
    aside(o, theta + u0 * f.arc, h * lane(u0), A);
    aside(o, theta + u1 * f.arc, h * lane(u1), B);
    put(bold, A, B, color);
  }
}

function aside(o, theta, h, out) {
  pt(o, theta, o.r, out);
  tan.set(0, 0, 0).addScaledVector(o.u, -Math.sin(theta)).addScaledVector(o.v, Math.cos(theta));
  side.crossVectors(tan, ez).normalize().multiplyScalar(o.out * h);
  out[0] += side.x; out[1] += side.y; out[2] += side.z;
  return out;
}

function drawFindings(t) {
  cubeCount = 0;
  for (let k = 0; k < ORBITS.length; k++) {
    const o = ORBITS[k];
    const j0 = Math.floor((t - o.life) / o.every) - 1, j1 = Math.floor(t / o.every) + 1;
    for (let j = j0; j <= j1; j++) {
      finding(k, j, F);
      if (t >= F.ts && t <= F.fade + FADE && !crowded(k, j)) drawFinding(o, F, t);
    }
  }
  cubes.count = cubeCount;
  cubes.instanceMatrix.needsUpdate = true;
  cubes.instanceColor.needsUpdate = true;
}

function renderAt(t, crank = 0) {
  aim(t);
  thin.n = 0;
  bold.n = 0;
  grads.n = 0;
  const m = t + crank;
  for (const o of ORBITS) {
    const psi = o.phase + o.omega * m;
    drawTicks(o, psi);
    drawCarrier(o, psi);
  }
  drawSun(m);
  drawFindings(m);
  scene.updateMatrixWorld(true);
  for (const s of outlines) s.update();
  flush(thin);
  flush(bold);
  flush(grads);
  renderer.render(scene, camera);
}

window.renderAt = renderAt;
window.CAPTURE = SETTLE;
await renderer.compileAsync(scene, camera);
if (q.has('t')) renderAt(Number(q.get('t')));
else if (capture) renderAt(SETTLE);
else {
  const FROM = num('from', 0);
  let t0 = q.has('wait') ? null : performance.now() - FROM * 1000;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, shown = true, stopped = 0;
  const now = () => (reduce.matches ? SETTLE
    : t0 === null ? FROM : (performance.now() - t0) / 1000);
  const live = () => shown && !document.hidden && t0 !== null && !reduce.matches;
  const turn = orbit(stage, { yaw: [-Infinity, Infinity], pitch: [0, 0], inertia: 0.965 });
  stage.style.touchAction = 'pan-y';
  const frame = () => {
    raf = 0;
    turn.update();
    renderAt(now(), turn.yaw * CRANK);
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
    t0 = performance.now() - FROM * 1000;
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
