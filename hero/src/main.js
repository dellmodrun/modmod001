import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { loadRobot, loadHuman } from './hands.js';
import {
  palette, lineMaterial, depthMaterial, creaseLines, Silhouette, refreshAdjacency,
} from './edges.js';
import { createOverlay } from './overlay.js';
import { inkReader } from './ink.js';
import shipped from './pose.json' with { type: 'json' };

const deg = THREE.MathUtils.degToRad;
const GAP = 14;
const FIT = [shipped.robot.fit, shipped.human.fit];
const MOBILE_FIT = [shipped.robot.mobile.fit, shipped.human.mobile.fit];
const GAP_SLOPE = deg(20);
const TOUCH = [0.5, 0.52];
const SCALE = 1.345 / 1440;
const COPY_CLEAR = 32;
const TOP_CLEAR = { desktop: 90, mobile: 76 };
const MOBILE_ZOOM = 1.1;
const MOBILE_FILL = 0.9;
const MOBILE_FLOOR = 24;
const MOBILE_ROLL = deg(-14);
const WRIST_MM = 40;
const YAW = deg(2);
const YAW_STEP = deg(0.05);
const FOLLOW_YAW = deg(8);
const FOLLOW_PITCH = deg(5);
const FOLLOW_EASE = 0.06;
const DRAG_RATE = deg(0.3);
const DRAG_LIMIT = { yaw: deg(24), pitch: deg(12), roll: deg(8) };
const STRETCH = 0.5;
const SPRING_MS = 120;
const INERTIA = 0.9;
const AXES = ['yaw', 'pitch', 'roll'];

const hero = document.querySelector('.hero');
const stage = hero.querySelector('.stage');
const cursor = stage.querySelector('.cursor');
const cursorXY = cursor.querySelector('span');
const copy = hero.querySelector('.copy');
const canvas = stage.querySelector('canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(width < 960px)');
const pad4 = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');
const moving = () => !reduced.matches;
const yieldTask = () => globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r));

function keepPoster(notice, err) {
  const p = stage.querySelector('.notice');
  p.textContent = notice;
  p.hidden = false;
  stage.dataset.error = err.message;
  throw err;
}

await yieldTask();
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (err) {
  keepPoster('WebGL unavailable; static figure', err);
}
renderer.localClippingEnabled = true;
const msaa = renderer.getContext().getParameter(WebGL2RenderingContext.SAMPLES) > 0;
const readInk = inkReader(renderer.getContext());
const scene = new THREE.Scene();
const ghost = new THREE.MeshBasicMaterial({ visible: false });
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 4000);
camera.position.z = 2000;
const clearDepth = new THREE.Mesh(new THREE.BufferGeometry(),
  new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
clearDepth.renderOrder = -1.5;
clearDepth.frustumCulled = false;
clearDepth.onBeforeRender = (r) => {
  r.state.buffers.depth.setMask(true);
  r.clearDepth();
};
scene.add(clearDepth);

async function makeHand(data, roles, { dir, view, below }) {
  const local = new THREE.Plane(new THREE.Vector3(dir, 0, 0), below);
  const section = local.clone();
  const planes = [section];
  const sils = [];
  const lineMats = [];
  const depth = depthMaterial();
  const shellDepth = depthMaterial(4);
  depth.clippingPlanes = shellDepth.clippingPlanes = planes;
  const groups = new Map();
  const toModel = data.model.matrixWorld.clone().invert();
  const stats = { verts: 0, tris: 0 };
  for (const mesh of data.meshes) {
    const role = roles[mesh.userData.layer];
    mesh.visible = false;
    if (!groups.has(role)) groups.set(role, { sources: [], geos: [] });
    const geo = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    stats.verts += geo.attributes.position.count;
    stats.tris += geo.index.count / 3;
    groups.get(role).sources.push(mesh);
    groups.get(role).geos.push(geo.applyMatrix4(toModel));
  }
  const baked = [];
  await yieldTask();
  for (const [role, { sources, geos }] of groups) {
    const m = {};
    for (const [k, opts] of Object.entries(role)) {
      if (typeof opts !== 'object') continue;
      m[k] = lineMaterial({ ...opts, msaa });
      m[k].clippingPlanes = planes;
      lineMats.push(m[k]);
    }
    const mesh = new THREE.Mesh(mergeGeometries(geos),
      role.shell ? shellDepth : role.occluder ? depth : ghost);
    if (role.occluder) mesh.renderOrder = -1;
    data.model.add(mesh);
    await yieldTask();
    const b = { mesh, sources, role, front: m.front, crease: null };
    if (role.crease) {
      b.crease = creaseLines(mesh.geometry, role.crease, m.front, !role.shell);
      mesh.add(b.crease);
    }
    if (m.sil) sils.push(new Silhouette(mesh, [m.sil]));
    if (role.shell) mesh.traverse((o) => { o.renderOrder = o === mesh ? -3 : -2; });
    baked.push(b);
    await yieldTask();
  }
  data.model.position.copy(data.wrist).negate();
  const roll = new THREE.Group();
  roll.add(data.model);
  const pivot = new THREE.Group();
  pivot.add(roll);
  const spin = new THREE.Group();
  spin.add(pivot);
  scene.add(spin);
  const accent = lineMaterial({ tone: 'accent', msaa });
  accent.clippingPlanes = planes;
  const segs = () => {
    let n = 0;
    for (const b of baked) if (b.crease) n += b.crease.geometry.instanceCount;
    for (const s of sils) n += s.geometry.instanceCount;
    return n;
  };
  const h = {
    ...data, roles, pivot, roll, spin, sils, local, section, dir, lineMats, baked,
    accent, below, scale: 1, base: new THREE.Vector3(), stats,
    segs, pts: [], tipName: data.tip, tip: null,
  };
  setView(h, view);
  return h;
}

function setView(h, view) {
  h.view = view;
  h.pivot.rotation.set(deg(view.tilt), deg(view.yaw), deg(view.lean), 'ZXY');
  const axis = h.elbow.clone().sub(h.wrist).normalize();
  h.roll.quaternion.setFromAxisAngle(axis, deg(view.roll ?? 0));
  measureHand(h);
}

function measureHand(h) {
  h.spin.updateMatrixWorld(true);
  const toPivot = h.pivot.matrixWorld.clone().invert();
  const turn = new THREE.Matrix4().makeRotationFromQuaternion(h.pivot.quaternion);
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  const pts = [];
  let tip = null;
  for (const mesh of h.meshes) {
    m.multiplyMatrices(toPivot, mesh.matrixWorld);
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(m);
      if (h.local.distanceToPoint(p) < 0) continue;
      p.applyMatrix4(turn);
      if (i % 4 === 0) pts.push(p.x, p.y);
      if (mesh.name === h.tipName && (!tip || p.x * h.dir > tip.x * h.dir)) tip = p.clone();
    }
  }
  h.pts = pts;
  h.tip = tip;
}

function refresh(h) {
  h.model.updateMatrixWorld(true);
  const toModel = h.model.matrixWorld.clone().invert();
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (const b of h.baked) {
    const geo = b.mesh.geometry;
    const out = geo.attributes.position.array;
    let o = 0;
    for (const src of b.sources) {
      m.multiplyMatrices(toModel, src.matrixWorld);
      const pos = src.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++, o += 3) {
        p.fromBufferAttribute(pos, i).applyMatrix4(m).toArray(out, o);
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeBoundingSphere();
    refreshAdjacency(geo);
    if (b.crease) {
      b.mesh.remove(b.crease);
      b.crease.geometry.dispose();
      b.crease = creaseLines(geo, b.role.crease, b.front, !b.role.shell);
      if (b.role.shell) b.crease.renderOrder = -2;
      b.mesh.add(b.crease);
    }
  }
  for (const s of h.sils) s.invalidate();
  measureHand(h);
  dropHighlights();
}

const highlights = new Map();
let hovered = null;

function buildHighlight(target) {
  const h = hands.find((x) => x.meshes.includes(target));
  const role = h.roles[target.userData.layer];
  const twin = new THREE.Mesh(target.geometry, ghost);
  twin.position.copy(target.position);
  twin.quaternion.copy(target.quaternion);
  target.parent.add(twin);
  const sils = [new Silhouette(twin, [h.accent])];
  if (role.crease) twin.add(creaseLines(target.geometry, role.crease, h.accent, !role.shell));
  twin.traverse((o) => { o.renderOrder = 1; });
  return { nodes: [twin], sils };
}

function dropHighlights() {
  for (const hl of highlights.values()) for (const n of hl.nodes) n.removeFromParent();
  highlights.clear();
  if (hovered) {
    highlights.set(hovered, buildHighlight(hovered));
    for (const n of highlights.get(hovered).nodes) n.visible = true;
  }
}

function setHover(target) {
  if (target === hovered) return;
  hovered = target;
  if (target && !highlights.has(target)) highlights.set(target, buildHighlight(target));
  for (const [t, hl] of highlights) for (const n of hl.nodes) n.visible = t === hovered;
  paint();
  render();
}

function setColors(colors) {
  for (const [tone, c] of Object.entries(colors)) palette[tone].copy(c);
  paint();
}

function paint() {
  for (const h of hands) {
    for (const m of [...h.lineMats, h.accent]) {
      const { tone } = m.userData;
      m.color.copy(palette[hovered && tone === 'ink' ? 'light' : tone]);
    }
  }
}

function applyTheme() {
  const css = getComputedStyle(document.documentElement);
  const token = (name) => new THREE.Color(css.getPropertyValue(`--${name}`).trim());
  renderer.setClearColor(token('surface'), 1);
  setColors({
    ink: token('ink'), light: token('light'), faint: token('faint'), accent: token('accent'),
  });
}

const robotRoles = {
  mech: {
    occluder: true, crease: 50,
    front: { tone: 'ink' },
    sil: { tone: 'ink' },
  },
};
const bone = { occluder: true, sil: { tone: 'light' } };
const humanRoles = {
  skin: { shell: true, crease: 65, front: { tone: 'ink' }, sil: { tone: 'ink' } },
  carpal: bone, metacarpal: bone, phalanx: bone, forearm: bone,
  tendon: { sil: { tone: 'faint' } },
  ligament: { sil: { tone: 'faint' } },
};

if (navigator.connection?.saveData) {
  keepPoster('Data saver on; static figure', new Error('saveData'));
}
let robotData, humanData;
try {
  [robotData, humanData] = await Promise.all([loadRobot(shipped.robot.pose),
    loadHuman(shipped.human.pose)]);
} catch (err) {
  keepPoster('Models unavailable; static figure', err);
}
const robot = await makeHand(robotData, robotRoles, {
  dir: 1, view: shipped.robot.view, below: 230,
});
const human = await makeHand(humanData, humanRoles, {
  dir: -1, view: shipped.human.view, below: 150,
});
const hands = [robot, human];
const mask = new URLSearchParams(location.search).get('mask')?.split(',');
if (mask) window.__hands = { robot, human, render };
for (const h of mask && mask[0] !== 'lines' ? hands : []) {
  const [black, white] = [0, 0xffffff].map((color) => new THREE.MeshBasicMaterial({
    color, side: THREE.DoubleSide, clippingPlanes: [h.section],
  }));
  h.pivot.traverse((o) => { if (o.isMesh) o.visible = false; });
  for (const m of h.meshes) {
    m.visible = true;
    m.material = mask.includes(h === robot ? 'robot' : 'human') || mask.includes(m.name)
      ? black : white;
  }
}
await yieldTask();
applyTheme();
new MutationObserver(() => { applyTheme(); render(); })
  .observe(document.documentElement, { attributeFilter: ['data-theme'] });
const overlay = createOverlay(stage, camera, hands, setHover);
await overlay.prepare(yieldTask);
scene.matrixWorldAutoUpdate = false;

let width = 0, height = 0, mobile = false, heroEnd = 1;

function place(h, x, y, scale) {
  h.scale = scale;
  h.base.set(x, y, 0);
  h.pivot.scale.setScalar(scale);
}

function pivotOnTouch() {
  const mid = new THREE.Vector3();
  for (const h of hands) mid.addScaledVector(h.tip, h.scale).add(h.base);
  mid.multiplyScalar(0.5);
  for (const h of hands) {
    h.spin.position.copy(mid);
    h.pivot.position.copy(h.base).sub(mid);
  }
}

const turn = {
  yaw: 0, pitch: 0, roll: 0, fYaw: 0, fPitch: 0, aimYaw: 0, aimPitch: 0, scrolled: 0,
  drag: null, x: 0, y: 0, v: [0, 0, 0], left: 0, top: 0,
};
const clamp = THREE.MathUtils.clamp;
const step = (a) => Math.round(a / YAW_STEP) * YAW_STEP;
const q = new THREE.Quaternion();
const euler = new THREE.Euler();

const beyond = (axis) => Math.max(0, Math.abs(turn[axis]) - DRAG_LIMIT[axis]);

function travel(at, d, lim, give) {
  if (!d) return at;
  const side = Math.sign(d), edge = side * lim;
  let past;
  if (side * at > lim) {
    const over = Math.min(side * at - lim, give * 0.999);
    past = give * over / (give - over) + Math.abs(d);
  } else {
    const free = side * (edge - at);
    if (Math.abs(d) <= free) return at + d;
    past = Math.abs(d) - free;
  }
  return edge + side * give * past / (past + give);
}

function dragBy(v) {
  for (let i = 0; i < AXES.length; i++) {
    const lim = DRAG_LIMIT[AXES[i]];
    turn[AXES[i]] = travel(turn[AXES[i]], v[i], lim, lim * STRETCH);
  }
}

function springBack(ms) {
  const keep = Math.exp(-ms / SPRING_MS);
  for (let i = 0; i < AXES.length; i++) {
    const axis = AXES[i], over = beyond(axis);
    if (!over) continue;
    const edge = Math.sign(turn[axis]) * DRAG_LIMIT[axis];
    turn[axis] = moving() && over > 1e-4 ? edge + (turn[axis] - edge) * keep : edge;
  }
}

const figureTurn = (yaw, pitch, roll) => q.setFromEuler(euler.set(pitch, yaw, roll, 'YXZ'));

function dragged(h, step = 1) {
  const r = (a) => Number((Math.round(THREE.MathUtils.radToDeg(a) / step) * step).toFixed(2));
  figureTurn(turn.yaw, turn.pitch, turn.roll).multiply(h.pivot.quaternion);
  euler.setFromQuaternion(q, 'ZXY');
  return { tilt: r(euler.x), yaw: r(euler.y), lean: r(euler.z), roll: h.view.roll ?? 0 };
}

const angles = () => [turn.yaw + turn.fYaw + turn.scrolled, turn.pitch + turn.fPitch]
  .map(THREE.MathUtils.radToDeg);

let laidOut = '';
function layout(force = false) {
  finishRefit();
  const ink = arrange(force);
  if (ink) fitOverlay(ink);
}

function handSpan(at, tx, ty, scale) {
  const placed = hands.map((h, i) => {
    const [k, dx, dy] = MOBILE_FIT[i];
    const s = scale * k;
    return { s, x: tx + at[i].x * s + dx * width, y: ty + at[i].y * s - dy * height };
  });
  const mx = (placed[0].x + robot.tip.x * placed[0].s + placed[1].x + human.tip.x * placed[1].s) / 2;
  const my = (placed[0].y + robot.tip.y * placed[0].s + placed[1].y + human.tip.y * placed[1].s) / 2;
  const sin = Math.sin(mobileRoll()), cos = Math.cos(mobileRoll());
  let top = -Infinity, bottom = Infinity;
  hands.forEach((h, i) => {
    const { s, x, y } = placed[i];
    for (let k = 0; k < h.pts.length; k += 2) {
      const px = h.pts[k], py = h.pts[k + 1];
      if ((px * h.tip.x + py * h.tip.y) / h.tip.length() <= WRIST_MM) continue;
      const ry = (x + px * s - mx) * sin + (y + py * s - my) * cos + my;
      top = Math.max(top, ry);
      bottom = Math.min(bottom, ry);
    }
  });
  return [top, bottom];
}

const mobileRoll = () => MOBILE_ROLL * THREE.MathUtils.clamp((height / width - 0.6) / 0.6, 0, 1);
const roll = () => turn.roll + (mobile ? mobileRoll() : 0);

function arrange(force) {
  if (!stage.clientWidth || !stage.clientHeight) return null;
  const key = [stage.clientWidth, stage.clientHeight, devicePixelRatio, narrow.matches,
    copy.offsetLeft, copy.offsetTop, copy.offsetWidth,
    [...document.fonts].filter((f) => f.status === 'loaded').length].join();
  if (!force && key === laidOut) return null;
  laidOut = key;
  width = stage.clientWidth;
  height = stage.clientHeight;
  mobile = narrow.matches;
  heroEnd = hero.offsetTop + hero.offsetHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const hair = msaa ? 1.5 / renderer.getPixelRatio() : 1;
  for (const h of hands) {
    for (const m of [...h.lineMats, h.accent]) m.linewidth = hair;
  }
  renderer.setSize(width, height, false);
  Object.assign(camera, { left: -width / 2, right: width / 2, top: height / 2, bottom: -height / 2 });
  camera.updateProjectionMatrix();

  const g = new THREE.Vector2(Math.cos(GAP_SLOPE), -Math.sin(GAP_SLOPE)).multiplyScalar(GAP / 2);
  const at = [
    new THREE.Vector2(-g.x - robot.tip.x, -g.y - robot.tip.y),
    new THREE.Vector2(g.x - human.tip.x, g.y - human.tip.y),
  ];
  const tx = (TOUCH[0] - 0.5) * width;
  let ty = (0.5 - TOUCH[1]) * height;
  let scale = SCALE * width * (mobile ? MOBILE_ZOOM : 1);
  const cx1 = copy.offsetLeft + copy.offsetWidth + COPY_CLEAR - width / 2;
  const cy1 = height / 2 - copy.offsetTop + COPY_CLEAR;
  const topClear = TOP_CLEAR[mobile ? 'mobile' : 'desktop'];
  const tooBig = () => hands.some((h, i) => {
    for (let k = 0; k < h.pts.length; k += 2) {
      const x = tx + (at[i].x + h.pts[k]) * scale, y = ty + (at[i].y + h.pts[k + 1]) * scale;
      if (!mobile && x < cx1 && y < cy1) return true;
      const ahead = (h.pts[k] * h.tip.x + h.pts[k + 1] * h.tip.y) / h.tip.length() > WRIST_MM;
      if (h === robot && ahead && x > -width / 2 && y > height / 2 - topClear) return true;
    }
    return false;
  });
  const fits = () => {
    const [top, bottom] = handSpan(at, tx, ty, scale);
    return top < height / 2 - MOBILE_FLOOR && bottom > MOBILE_FLOOR - height / 2
      && top - bottom < MOBILE_FILL * height;
  };
  while ((mobile ? !fits() : tooBig()) && scale > 0.5) scale *= 0.97;
  if (mobile) {
    const [top, bottom] = handSpan(at, tx, ty, scale);
    ty -= (top + bottom) / 2;
  }
  hands.forEach((h, i) => {
    const [k, dx, dy] = (mobile ? MOBILE_FIT : FIT)[i];
    place(h, tx + at[i].x * scale * k + dx * width, ty + at[i].y * scale * k - dy * height,
      scale * k);
  });
  pivotOnTouch();
  figureTurn(turn.yaw, turn.pitch, roll());
  for (const h of hands) h.spin.quaternion.copy(q);
  scene.updateMatrixWorld();
  for (const h of hands) h.section.copy(h.local).applyMatrix4(h.pivot.matrixWorld);
  for (const h of hands) for (const sil of h.sils) sil.update();
  const box = stage.getBoundingClientRect();
  turn.left = box.left + scrollX;
  turn.top = box.top + scrollY;
  return inkMap();
}

function fitOverlay(ink) {
  const copyBox = mobile ? null : [copy.offsetLeft - COPY_CLEAR, copy.offsetTop - COPY_CLEAR,
    copy.offsetLeft + copy.offsetWidth + COPY_CLEAR];
  overlay.layout({
    width, height, mobile, scale: human.scale, copy: copyBox, ink,
    stats: {
      verts: robot.stats.verts + human.stats.verts, tris: robot.stats.tris + human.stats.tris,
    },
  });
  render(true);
}

function startInk(drawn) {
  if (!drawn) renderer.render(scene, camera);
  const job = readInk(width, height, renderer.getClearColor(new THREE.Color()).getHex());
  renderer.resetState();
  return job;
}

function takeInk(job) {
  const ink = job.take();
  renderer.resetState();
  return ink;
}

const inkMap = () => takeInk(startInk(false));

const settled = () => turn.drag === null && !turn.v.some(Boolean)
  && !beyond('yaw') && !beyond('pitch') && !beyond('roll')
  && turn.fYaw === (moving() ? turn.aimYaw : 0) && turn.fPitch === (moving() ? turn.aimPitch : 0);

let posedAt = 0;
function pose() {
  const at = performance.now(), ms = Math.min(at - posedAt, 64);
  posedAt = at;
  if (turn.drag === null) {
    if (turn.v.some(Boolean)) {
      dragBy(turn.v);
      for (let i = 0; i < 3; i++) turn.v[i] *= INERTIA;
      if (Math.max(Math.abs(turn.v[0]), Math.abs(turn.v[1]), Math.abs(turn.v[2])) < 1e-4) {
        turn.v.fill(0);
      }
    }
    springBack(ms);
  }
  const ease = (f, aim) => (Math.abs(aim - f) < 1e-4 ? aim : f + (aim - f) * FOLLOW_EASE);
  turn.fYaw = ease(turn.fYaw, moving() ? turn.aimYaw : 0);
  turn.fPitch = ease(turn.fPitch, moving() ? turn.aimPitch : 0);
  turn.scrolled = moving() ? YAW * clamp(scrollY / heroEnd, 0, 1) : 0;
  figureTurn(turn.yaw + step(turn.fYaw + turn.scrolled), turn.pitch + step(turn.fPitch),
    roll());
  for (const h of hands) h.spin.quaternion.copy(q);
  scene.updateMatrixWorld();
  for (const h of hands) h.section.copy(h.local).applyMatrix4(h.pivot.matrixWorld);
  for (const h of hands) for (const sil of h.sils) sil.update();
  if (hovered) for (const sil of highlights.get(hovered).sils) sil.update();
}

let last = '';
function render(force = true) {
  pose();
  const now = hands.map((h) => h.spin.quaternion.toArray().join()).join();
  if (!force && now === last) return false;
  last = now;
  renderer.render(scene, camera);
  overlay.update({ turn: angles(), segs: robot.segs() + human.segs() });
  return true;
}

const REFIT_MS = 100;
const SLICE_MS = 4;
let fitted = 0, turning = false, again = 0, pending = null, polling = 0;
function refitLabels(final = false, drawn = false) {
  finishRefit();
  clearTimeout(again);
  pending = { final, job: startInk(drawn), spins: hands.map((h) => h.spin.quaternion.clone()) };
  overlay.prefetch();
  fitted = performance.now();
  polling = setTimeout(pollRefit);
}

function pollRefit() {
  if (!pending) return;
  if (!pending.steps && !(pending.job.ready() && overlay.columnsReady())) {
    polling = setTimeout(pollRefit, 1);
  } else if (!stepRefit(SLICE_MS)) polling = setTimeout(pollRefit);
}

function turnTo(spins) {
  hands.forEach((h, i) => h.spin.quaternion.copy(spins[i]));
  scene.updateMatrixWorld();
  overlay.update({ turn: angles(), segs: robot.segs() + human.segs() });
}

function finishRefit() {
  if (pending) stepRefit(Infinity);
}

function stepRefit(budget) {
  clearTimeout(polling);
  const now = hands.map((h) => h.spin.quaternion.clone());
  const moved = hands.some((h, i) => !h.spin.quaternion.equals(pending.spins[i]));
  if (moved) turnTo(pending.spins);
  pending.steps ??= overlay.refit(takeInk(pending.job), pending.final);
  const end = performance.now() + budget;
  let step;
  do step = pending.steps.next(); while (!step.done && performance.now() < end);
  if (moved) turnTo(now);
  if (!step.done) return false;
  pending = null;
  clearTimeout(again);
  fitted = performance.now();
  if (step.value) again = setTimeout(() => { if (settled()) refitLabels(); }, REFIT_MS);
  return true;
}

let raf = 0, inView = true;
function loop() {
  const drawn = render(false);
  const still = settled();
  if (still ? turning : performance.now() - fitted > REFIT_MS) refitLabels(still, drawn);
  turning = !still;
  raf = inView && !still ? requestAnimationFrame(loop) : 0;
}
function wake() {
  if (!raf) raf = requestAnimationFrame(loop);
}

new IntersectionObserver(([e]) => {
  inView = e.isIntersecting;
  if (inView) wake();
}).observe(hero);
reduced.addEventListener('change', () => { layout(); wake(); });
addEventListener('scroll', wake, { passive: true });
stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || turn.drag !== null) return;
  turn.drag = e.pointerId;
  turn.x = e.clientX;
  turn.y = e.clientY;
  turn.v = [0, 0, 0];
  stage.setPointerCapture(e.pointerId);
  stage.dataset.dragging = '';
  wake();
});
stage.addEventListener('pointermove', (e) => {
  if (e.pointerId === turn.drag) {
    const dx = (e.clientX - turn.x) * DRAG_RATE, dy = (e.clientY - turn.y) * DRAG_RATE;
    turn.v = e.shiftKey ? [0, 0, -dx] : [dx, dy, 0];
    turn.x = e.clientX;
    turn.y = e.clientY;
    dragBy(turn.v);
  }
  turn.aimYaw = ((e.pageX - turn.left) / width * 2 - 1) * FOLLOW_YAW;
  turn.aimPitch = ((e.pageY - turn.top) / height * 2 - 1) * FOLLOW_PITCH;
  const x = e.pageX - turn.left, y = e.pageY - turn.top;
  cursor.hidden = e.pointerType !== 'mouse';
  cursor.style.setProperty('--x', `${x}px`);
  cursor.style.setProperty('--y', `${y}px`);
  cursorXY.textContent = `x ${pad4(x)} y ${pad4(y)}`;
  wake();
});
const release = (e) => {
  if (e.pointerId !== turn.drag) return;
  turn.drag = null;
  delete stage.dataset.dragging;
  if (!moving()) turn.v = [0, 0, 0];
  wake();
};
stage.addEventListener('pointerup', release);
stage.addEventListener('pointercancel', release);
stage.addEventListener('pointerleave', () => {
  cursor.hidden = true;
  turn.aimYaw = turn.aimPitch = 0;
  wake();
});
stage.addEventListener('keydown', (e) => {
  if (e.code !== 'KeyC' || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
  e.preventDefault();
  const state = Object.fromEntries(hands.map((h, i) => [i ? 'human' : 'robot',
    { view: dragged(h, 0.1), fit: [...FIT[i]], mobile: { fit: [...MOBILE_FIT[i]] },
      pose: h.posed }]));
  navigator.clipboard.writeText(JSON.stringify(state, null, 2))
    .catch((err) => console.warn(`Copying the hand state failed: ${err.message}`));
});
new ResizeObserver(() => { layout(); wake(); }).observe(stage);
const watchDpr = () => matchMedia(`(resolution: ${devicePixelRatio}dppx)`)
  .addEventListener('change', () => { layout(); wake(); watchDpr(); }, { once: true });
watchDpr();

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function applyState(state) {
  finishRefit();
  const t0 = performance.now();
  [[robot, state.robot], [human, state.human]].forEach(([h, s], i) => {
    if (!same(s.pose, h.posed)) {
      h.setPose(s.pose);
      h.posed = structuredClone(s.pose);
      refresh(h);
    }
    if (!same(s.view, h.view)) setView(h, structuredClone(s.view));
    FIT[i] = [...s.fit];
    MOBILE_FIT[i] = [...s.mobile.fit];
  });
  overlay.reset();
  layout(true);
  return performance.now() - t0;
}
robot.posed = structuredClone(shipped.robot.pose);
human.posed = structuredClone(shipped.human.pose);
if (new URLSearchParams(location.search).has('tune')) {
  import('./tune.js').then(({ mountTuner }) => mountTuner(shipped, applyState));
}

const ink = arrange(), first = laidOut;
await yieldTask();
if (ink && laidOut === first) fitOverlay(ink);
stage.dataset.live = '';
document.fonts.ready.then(() => requestAnimationFrame(() => layout()));
stage.dataset.ready = '';
