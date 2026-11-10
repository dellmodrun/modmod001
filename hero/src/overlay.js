import * as THREE from 'three';
import { COL, project, edgesOf, outline } from './outline.js';

const NS = 'http://www.w3.org/2000/svg';
const MARGIN = 36;
const LABEL_SPACE = 16;
const REF_SCALE = 3.34;

const LABELS = [
  { hand: 1, id: 'H-01', name: 'Index distal phalanx', short: 'Index tip', mesh: 'FMA24460',
    at: [[135, 48], [90, 36]], mobile: [[135, 24], [90, 24], [-135, 24]] },
  { hand: 0, id: 'R-13', name: 'Index distal link', short: 'Index link', mesh: 'I-IP_IP',
    band: [0.6, 1], at: [[45, 36], [90, 36]], mobile: [[90, 24], [45, 24], [-90, 24]] },
  { hand: 0, id: 'R-15', name: 'Thumb distal link', short: 'Thumb', mesh: 'T-DP_T-DP',
    at: [[-90, 36], [-135, 36]], mobile: [[-90, 24], [-45, 24]] },
  { hand: 1, id: 'H-16', name: 'Radius', mesh: 'FMA23464', at: [[45, 36], [-45, 36]],
    mobile: [[45, 24], [-45, 24], [90, 24]] },
  { hand: 0, id: 'R-10', name: 'Middle proximal link', short: 'Middle link', mesh: 'M-PP_PP',
    at: [[45, 48], [90, 36]], mobile: [[45, 24], [90, 24]] },
  { hand: 0, id: 'R-07', name: 'Palm chassis', short: 'Palm', mesh: 'L-Carpals_CORE',
    at: [[90, 36], [-90, 36]], mobile: [[90, 24], [-90, 24]] },
  { hand: 1, id: 'H-07', name: 'Little distal phalanx', short: 'Little tip', mesh: 'FMA24463',
    at: [[-90, 24], [-45, 36]], mobile: [[-45, 24], [-90, 24], [0, 24]] },
  { hand: 1, id: 'H-05', name: 'Ring distal phalanx', mesh: 'FMA24462', at: [[-135, 36]] },
  { hand: 1, id: 'H-03', name: 'Middle distal phalanx', mesh: 'FMA24461', at: [[-135, 36]] },
  { hand: 1, id: 'H-09', name: 'Metacarpal 2', short: 'Metacarpal 2', mesh: 'FMA24466',
    at: [[90, 36], [135, 36]], mobile: [[90, 24], [45, 24]] },
  { hand: 0, id: 'R-08', name: 'Pulley row', short: 'Pulleys', mesh: 'I-AP-L',
    at: [[90, 36], [45, 36]], mobile: [[90, 24], [135, 24]] },
  { hand: 1, id: 'H-02', name: 'Index proximal phalanx', mesh: 'FMA24451', at: [[90, 36]] },
  { hand: 1, id: 'H-04', name: 'Middle proximal phalanx', mesh: 'FMA24452', at: [[-135, 36]] },
  { hand: 1, id: 'H-06', name: 'Ring proximal phalanx', mesh: 'FMA24453', at: [[-45, 36]] },
  { hand: 1, id: 'H-08', name: 'Little proximal phalanx', mesh: 'FMA24454', at: [[-45, 48]] },
  { hand: 1, id: 'H-10', name: 'Metacarpal 5', mesh: 'FMA24472', at: [[-45, 36]] },
  { hand: 1, id: 'H-20', name: 'Deep transverse metacarpal ligament',
    mesh: 'Deep_transverse_metacarpal_ligament', at: [[90, 48]] },
  { hand: 1, id: 'H-18', name: 'Flexor tendon', mesh: 'FMA38479', at: [[-45, 48]] },
  { hand: 1, id: 'H-19', name: 'Collateral ligament', short: 'Collateral lig.',
    mesh: 'Collateral_interphalangeal_ligaments_of_hand', at: [[-45, 36], [-90, 36]],
    mobile: [[-45, 24], [0, 24]] },
  { hand: 1, id: 'H-17', name: 'Ulna', mesh: 'FMA23467', at: [[-45, 36]] },
  { hand: 1, id: 'H-11', name: 'Scaphoid', mesh: 'FMA24435', at: [[90, 36]] },
  { hand: 1, id: 'H-12', name: 'Lunate', mesh: 'FMA24437', at: [[90, 36]] },
  { hand: 1, id: 'H-13', name: 'Triquetrum', mesh: 'FMA24439', at: [[-45, 36]] },
  { hand: 1, id: 'H-14', name: 'Hamate', mesh: 'FMA24448', at: [[-45, 36]] },
  { hand: 1, id: 'H-15', name: 'Capitate', mesh: 'FMA24446', at: [[90, 36]] },
  { hand: 0, id: 'R-09', name: 'Index proximal link', mesh: 'I-PP_PP', at: [[90, 36]] },
  { hand: 0, id: 'R-11', name: 'Ring proximal link', mesh: 'M-PP_PP', nth: 1,
    at: [[-90, 36]] },
  { hand: 0, id: 'R-12', name: 'Little proximal link', mesh: 'P-PP_PP', at: [[-90, 36]] },
  { hand: 0, id: 'R-14', name: 'Thumb proximal link', mesh: 'T-PP_PP', at: [[-135, 36]] },
  { hand: 0, id: 'R-01', name: 'Gear drive', mesh: 'L-Carpals_wrist', at: [[-90, 36]] },
  { hand: 0, id: 'R-02', name: 'Wrist pivot', mesh: 'Wrist-pivot', at: [[-90, 36]] },
  { hand: 0, id: 'R-03', name: 'Forearm rails', mesh: 'Forearm-rails', band: [0.4, 0.8],
    at: [[-135, 36], [-90, 36]] },
  { hand: 0, id: 'R-04', name: 'Rail spacer', mesh: 'Forearm-spacers', at: [[45, 36]] },
  { hand: 0, id: 'R-05', name: 'Tendon rod', mesh: 'Tendon-rods', at: [[45, 36]] },
  { hand: 0, id: 'R-06', name: 'Spool block', mesh: 'Spool-block', at: [[-45, 36]] },
];

const deg = THREE.MathUtils.degToRad;
const DEG = THREE.MathUtils.radToDeg;
const WRAP = 14;
const LINE = 9.45;
const EASE_MS = 150;
const HOLD_MS = 400;
const FLIP_MS = 2000;
const FADE_MS = 200;
const DIM = 0.35;
const wrap = (name) => {
  if (name.length <= WRAP) return [name, ''];
  let best = [name, ''];
  for (let i = name.indexOf(' '); i > 0; i = name.indexOf(' ', i + 1)) {
    const two = [name.slice(0, i), name.slice(i + 1)];
    if (Math.max(...two.map((t) => t.length)) < Math.max(...best.map((t) => t.length))) best = two;
  }
  return best;
};

const FALLBACK_LENGTHS = { desktop: [24, 36, 48, 60], mobile: [24, 36, 48] };
const DENSE = { lengths: [72, 96, 120, 150], allow: [1, 4] };
function fallbacks(first, mobile, lengths = FALLBACK_LENGTHS[mobile ? 'mobile' : 'desktop']) {
  const turn = (a) => Math.abs((((a - first) % 360) + 540) % 360 - 180);
  const angles = Array.from({ length: 8 }, (_, i) => i * 45 - 135)
    .sort((a, b) => turn(a) - turn(b));
  return angles.flatMap((a) => lengths.map((len) => [a, len, a]));
}

function el(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.appendChild(node);
  return node;
}

const pose = (hand) => ({
  place: [hand.pivot.matrixWorld.elements[12], hand.pivot.matrixWorld.elements[13], hand.scale],
  inverse: hand.pivot.matrixWorld.clone().invert().elements,
  plane: [hand.local.normal.x, hand.local.normal.y, hand.local.normal.z, hand.local.constant],
  matrices: hand.meshes.map((mesh) => mesh.matrixWorld.elements),
});

const mmPoints = (mesh, { place, inverse, plane }) => project(
  mesh.geometry.attributes.position.array, mesh.matrixWorld.elements, inverse, place, plane);

const edgeCache = new WeakMap();
function edges(geo) {
  if (!edgeCache.has(geo)) {
    edgeCache.set(geo, edgesOf(geo.index.array, geo.attributes.position.count));
  }
  return edgeCache.get(geo);
}

const outlineOf = (hand, points) => outline(hand.meshes
  .map((mesh) => ({ ...points(hand, mesh), ...edges(mesh.geometry) })));

function outlineWorker() {
  try {
    return new Worker(new URL('./outline-worker.js', import.meta.url), { type: 'module' });
  } catch (err) {
    console.warn(`Outline worker unavailable (${err.message}); computing outlines in place`);
    return null;
  }
}

function anchorFor(hand, { w, keep }, [dx, dy], [b0, b1], seen) {
  let pts = [];
  for (let i = 0; i < keep.length; i++) if (keep[i] && seen(w[i * 2], w[i * 2 + 1])) pts.push(i);
  if (!pts.length) return null;
  const us = pts.map((i) => hand.dir * w[i * 2]);
  const lo = Math.min(...us), hi = Math.max(...us);
  pts = pts.filter((i) => {
    const u = hand.dir * w[i * 2];
    return u >= lo + (hi - lo) * b0 && u <= lo + (hi - lo) * b1;
  });
  if (!pts.length) return null;
  const across = (i) => w[i * 2] * dy - w[i * 2 + 1] * dx;
  const cs = pts.map(across);
  const c0 = Math.min(...cs), c1 = Math.max(...cs), mid = (c0 + c1) / 2;
  const near = pts.filter((i) => Math.abs(across(i) - mid) <= Math.max(1, (c1 - c0) / 5));
  const along = (i) => w[i * 2] * dx + w[i * 2 + 1] * dy;
  return (near.length ? near : pts).reduce((best, i) => (along(i) > along(best) ? i : best));
}

const INSET = 14;
const ROW = 13;
const SHEET = ['Scale', 'Vertices', 'Triangles', 'Segments', 'Yaw', 'Pitch'];
const SHEET_MOBILE = ['Scale', 'Segments', 'Yaw'];
const SHEET_WIDTHS = [64, 64];
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const degrees = (d) => {
  const r = Math.round(d * 10) / 10 || 0;
  return `${r < 0 ? '\u2212' : '+'}${Math.abs(r).toFixed(1)}\u00b0`;
};
const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');

export function createOverlay(stage, camera, hands, onHover) {
  const svg = el('svg', { class: 'overlay', 'aria-hidden': 'true' }, null);
  stage.appendChild(svg);
  const sheet = el('g', {}, svg);
  let measured = el('g', {}, svg);
  let notesG = el('g', {}, svg);
  const v = new THREE.Vector3();

  const labels = LABELS.map((spec) => {
    const mesh = hands[spec.hand].meshes.filter((m) => m.name === spec.mesh)[spec.nth ?? 0];
    if (!mesh) throw new Error(`overlay: ${spec.id} names ${spec.mesh}, which is not drawn`);
    const g = el('g', {}, svg);
    const move = svg.createSVGTransform();
    g.transform.baseVal.appendItem(move);
    const parts = makeCallout(g, spec.id);
    return {
      band: [0, 1], ...spec, mesh, g, move, ...parts, anchors: new Map(), anchor: null,
      call: null, a0: [0, 0], bend: [0, 0], box: [0, 0, 0, 0], drawn: new Float64Array(2),
    };
  });

  function makeCallout(g, id) {
    const leader = el('line', { class: 'leader' }, g);
    const marker = el('rect', { class: 'marker', width: 5, height: 5 }, g);
    const easeG = el('g', {}, g);
    const ease = svg.createSVGTransform();
    easeG.transform.baseVal.appendItem(ease);
    const text = el('text', { class: 'label' }, easeG);
    const first = el('tspan', {}, text);
    if (id) el('tspan', { class: 'part' }, first).textContent = `${id}  `;
    const nameNode = el('tspan', {}, first);
    const rest = el('tspan', {}, text);
    return { leader, marker, text, first, nameNode, rest, ease, nodes: [leader, marker, text] };
  }

  let shadows = null, held = null;
  const later = (write) => (held ? held.push(write) : write());
  document.fonts.addEventListener('loadingdone', () => {
    for (const lab of labels) lab.len = undefined;
    for (const lab of shadows ?? []) delete lab.len;
  });

  let L = null, cols = null, colsAt = '';
  const scr = [0, 0];
  const toScreen = (matrix, local) => {
    v.copy(local);
    if (matrix) v.applyMatrix4(matrix);
    v.project(camera);
    scr[0] = (v.x + 1) / 2 * L.width;
    scr[1] = (1 - v.y) / 2 * L.height;
    return scr;
  };
  const px = (world) => [...toScreen(null, world)];

  const shift = (lab) => {
    if (!lab.mesh) return lab.off ?? [0, 0];
    const [ax, ay] = toScreen(lab.mesh.matrixWorld, lab.anchor);
    return [ax - lab.a0[0], ay - lab.a0[1]];
  };
  const boxAt = (lab) => {
    const [dx, dy] = shift(lab);
    const [x0, y0, x1, y1] = lab.box;
    return [x0 + dx, y0 + dy, x1 + dx, y1 + dy];
  };
  const path = (lab) => {
    const [dx, dy] = shift(lab);
    return [[lab.bend[0] + dx, lab.bend[1] + dy], [lab.a0[0] + dx, lab.a0[1] + dy]];
  };

  function inside(i, x, y, m) {
    const h = hands[i];
    const { 12: hx, 13: hy } = h.pivot.matrixWorld.elements;
    const mx = (x - L.width / 2 - hx) / h.scale;
    const { c0, lo, hi } = cols[i];
    const k = Math.round(mx / COL) - c0;
    if (!(lo[k] <= hi[k])) return false;
    const my = (L.height / 2 - y - hy) / h.scale;
    return my > lo[k] - m / h.scale && my < hi[k] + m / h.scale;
  }

  const inkAt = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    return ix >= 0 && iy >= 0 && ix < L.width && iy < L.height && L.ink[iy * L.width + ix] === 1;
  };
  function inked([x0, y0, x1, y1], m) {
    for (let y = Math.floor(y0 - m); y <= y1 + m; y++) {
      for (let x = Math.floor(x0 - m); x <= x1 + m; x++) if (inkAt(x, y)) return true;
    }
    return false;
  }
  function crossings([px0, py0], [qx, qy], skip) {
    const len = Math.hypot(qx - px0, qy - py0), n = Math.ceil(len * 2);
    let runs = 0, on = false;
    for (let j = 0; j <= n && (n - j) / 2 >= skip; j++) {
      const v = inkAt(px0 + (qx - px0) * (j / n), py0 + (qy - py0) * (j / n));
      if (v && !on) runs++;
      on = v;
    }
    return runs;
  }

  function crosses(lab, allow = [0, 1]) {
    const box = boxAt(lab);
    if (inked(box, 2)) return true;
    if (lab.hand === 0) {
      for (let y = box[1]; y <= box[3]; y += 2) {
        for (let x = box[0] - 4; x <= box[2] + 4; x += 2) if (inside(0, x, y, 0)) return true;
      }
    }
    const [far, at] = path(lab);
    return crossings(far, at, 5) > allow[lab.hand === 0 ? 0 : 1];
  }

  function leaderHits(a, b) {
    const [[px0, py0], [qx, qy]] = path(a);
    const [x0, y0, x1, y1] = boxAt(b);
    const n = Math.ceil(Math.hypot(qx - px0, qy - py0) / 2);
    for (let j = 0; j <= n; j++) {
      const x = px0 + (qx - px0) * (j / (n || 1)), y = py0 + (qy - py0) * (j / (n || 1));
      if (x > x0 - 6 && x < x1 + 6 && y > y0 - 4 && y < y1 + 4) return true;
    }
    return false;
  }

  const cut = ([ax, ay], [bx, by], [cx, cy], [dx, dy]) => {
    const den = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
    if (!den) return false;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / den;
    const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  };

  function clash(a, b) {
    const [p, q] = [boxAt(a), boxAt(b)];
    const apart = p[0] >= q[2] + LABEL_SPACE || q[0] >= p[2] + LABEL_SPACE
      || p[1] >= q[3] + 4 || q[1] >= p[3] + 4;
    if (!apart) return true;
    if (leaderHits(a, b) || leaderHits(b, a)) return true;
    const [pa, pb] = [path(a), path(b)];
    return cut(pa[0], pa[1], pb[0], pb[1]);
  }

  function anchorAt(lab, face) {
    if (!lab.anchors.has(face)) {
      const a = deg(face);
      const h = hands[lab.hand];
      const { 12: hx, 13: hy } = h.pivot.matrixWorld.elements;
      const m = L.mobile ? 16 : MARGIN;
      const seen = (x, y) => Math.abs(hx + x * h.scale) < L.width / 2 - m
        && Math.abs(hy + y * h.scale) < L.height / 2 - m;
      const i = anchorFor(h, points(h, lab.mesh), [Math.cos(a), Math.sin(a)], lab.band, seen);
      lab.anchors.set(face, i === null ? null
        : new THREE.Vector3().fromBufferAttribute(lab.mesh.geometry.attributes.position, i));
    }
    return lab.anchors.get(face);
  }

  function callout(lab) {
    const [angle, length] = lab.call;
    const [ax, ay] = lab.mesh ? toScreen(lab.mesh.matrixWorld, lab.anchor) : lab.anchor;
    const a = deg(angle);
    const bx = ax + Math.cos(a) * length, by = ay - Math.sin(a) * length;
    const dir = Math.cos(a) > -1e-6 ? 1 : -1;
    const two = lab.rest.textContent !== '';
    lab.len ??= Math.max(lab.first.getComputedTextLength(),
      two ? lab.rest.getComputedTextLength() : 0);
    const len = lab.len;
    lab.a0 = [ax, ay];
    lab.bend = [bx, by];
    const across = Math.abs(Math.cos(a)) < 1e-6 ? -len / 2 : 0;
    const up = two && Math.sin(a) > 1e-6 ? LINE : 0;
    const tx = bx + (across ? 0 : dir * (lab.bare ? 2 : 6)), ty = by + 4 - Math.sin(a) * 2 - up;
    lab.textAt = [tx, ty, across ? 'middle' : dir > 0 ? 'start' : 'end'];
    const x0 = across ? tx + across : dir > 0 ? tx : tx - len;
    lab.box = [x0, ty - 7, x0 + len, ty + 2 + (two ? LINE : 0)];
    unpainted.add(lab);
  }

  const unpainted = new Set();
  function paint() {
    for (const lab of unpainted) {
      const [tx, ty, anchor] = lab.textAt;
      const [ax, ay] = lab.a0;
      lab.text.setAttribute('x', tx);
      lab.text.setAttribute('y', ty);
      lab.rest.setAttribute('x', tx);
      lab.rest.setAttribute('dy', LINE);
      lab.text.setAttribute('text-anchor', anchor);
      lab.leader.setAttribute('x1', lab.bend[0]);
      lab.leader.setAttribute('y1', lab.bend[1]);
      lab.leader.setAttribute('x2', ax);
      lab.leader.setAttribute('y2', ay);
      lab.marker.setAttribute('x', ax - 2.5);
      lab.marker.setAttribute('y', ay - 2.5);
    }
    unpainted.clear();
  }

  let transformed = new Map();
  const points = (hand, mesh) => {
    if (!transformed.has(hand)) transformed.set(hand, pose(hand));
    if (!transformed.has(mesh)) transformed.set(mesh, mmPoints(mesh, transformed.get(hand)));
    return transformed.get(mesh);
  };

  let worker = outlineWorker(), asked = null, asks = 0;
  if (worker) {
    worker.onmessage = ({ data }) => {
      if (asked?.id === data.id) asked.cols = data.cols;
    };
    worker.onerror = (err) => {
      console.warn(`Outline worker failed (${err.message}); computing outlines in place`);
      worker.terminate();
      worker = null;
      asked = null;
    };
  }
  const sendGeometry = () => worker?.postMessage({ geometry: hands.map((h) => h.meshes.map((m) => ({
    positions: m.geometry.attributes.position.array, index: m.geometry.index.array,
  }))) });

  function prefetch() {
    const key = turnKey();
    if (!worker || key === colsAt || asked?.key === key) return;
    asked = { id: ++asks, key, cols: null };
    worker.postMessage({ id: asked.id, poses: hands.map(pose) });
  }
  const columnsReady = () => !asked || asked.cols !== null || turnKey() === colsAt;
  function columns() {
    const key = turnKey();
    if (key !== colsAt) {
      colsAt = key;
      cols = asked?.key === key && asked.cols ? asked.cols : hands.map((h) => outlineOf(h, points));
    }
    asked = null;
  }

  async function prepare(pause) {
    cols = [];
    for (const h of hands) {
      transformed = new Map();
      cols.push(outlineOf(h, points));
      await pause();
    }
    colsAt = turnKey();
    sendGeometry();
  }
  const turnKey = () => hands.map((h) => h.spin.quaternion.toArray().join()).join();
  function reset() {
    transformed = new Map();
    asked = null;
    cols = hands.map((h) => outlineOf(h, points));
    colsAt = turnKey();
    sendGeometry();
  }

  let placed = [], fixed = [], strokes = [], layer = sheet, fits = null;
  let cells = null;

  function note(at, text, tries, { bare = false, cls = 'sheet-text' } = {}) {
    const g = el('g', {}, notesG);
    const move = svg.createSVGTransform();
    g.transform.baseVal.appendItem(move);
    const lab = {
      hand: null, mesh: null, anchor: at, bare, g, move, off: [0, 0], ...makeCallout(g),
    };
    lab.text.setAttribute('class', cls);
    lab.nameNode.textContent = text;
    if (bare) lab.leader.remove();
    lab.marker.remove();
    lab.leader.setAttribute('class', 'sheet-leader');
    for (const call of tries) {
      lab.call = call;
      callout(lab);
      if (fits(lab)) {
        placed.push(lab);
        return lab;
      }
    }
    g.remove();
    return null;
  }

  function block(x0, y0, x1, y1) {
    placed.push({ mesh: null, box: [x0, y0, x1, y1], a0: [x0, y0], bend: [x0, y0] });
  }

  const line = (d, cls = 'sheet') => el('path', { class: cls, d }, layer);
  const text = (x, y, s, anchor = 'start', cls = 'sheet-text') => {
    const t = el('text', { class: cls, x, y, 'text-anchor': anchor }, layer);
    t.textContent = s;
    return t;
  };

  function segInBox([px0, py0], [qx, qy], [l, t, r, b]) {
    let t0 = 0, t1 = 1;
    const dx = qx - px0, dy = qy - py0;
    for (const [p, q] of [[-dx, px0 - l], [dx, r - px0], [-dy, py0 - t], [dy, b - py0]]) {
      if (p === 0) {
        if (q < 0) return false;
        continue;
      }
      const u = q / p;
      if (p < 0) {
        if (u > t1) return false;
        t0 = Math.max(t0, u);
      } else {
        if (u < t0) return false;
        t1 = Math.min(t1, u);
      }
    }
    return true;
  }
  let drawnSegs = new Map();
  const segsOf = (f) => {
    if (!drawnSegs.has(f)) drawnSegs.set(f, f());
    return drawnSegs.get(f);
  };
  const stroked = ([x0, y0, x1, y1], m = 2) => strokes.some((segs) => segsOf(segs)
    .some(([p, q]) => segInBox(p, q, [x0 - m, y0 - m, x1 + m, y1 + m])));
  const lineSegs = (lines) => () => lines.map((ln) => [[ln.x1.baseVal.value, ln.y1.baseVal.value],
    [ln.x2.baseVal.value, ln.y2.baseVal.value]]);

  function table(x, y, widths, rows) {
    const w = widths.reduce((a, b) => a + b, 0), h = rows.length * ROW;
    const x0 = x - w;
    el('rect', { class: 'sheet-fill', x: x0, y, width: w, height: h }, sheet);
    let d = `M${x0} ${y}h${w}v${h}h${-w}Z`;
    for (let r = 1; r < rows.length; r++) d += `M${x0} ${y + r * ROW}h${w}`;
    let cx = x0;
    for (const cw of widths.slice(0, -1)) d += `M${(cx += cw)} ${y}v${h}`;
    line(d);
    const cells = {};
    rows.forEach((row, r) => {
      let tx = x0;
      cells[row[0]] = row.map((s, c) => {
        const t = text(tx + 4, y + r * ROW + 9.5, s, 'start', c ? 'sheet-text' : 'sheet-key');
        tx += widths[c];
        return t;
      });
    });
    block(x0 - 4, y - 4, x + 4, y + h + 4);
    return cells;
  }

  function frame(m, mobile) {
    const { width, height, scale, stats } = L;
    const rows = (mobile ? SHEET_MOBILE : SHEET).map((k) => [k, '']);
    const w = SHEET_WIDTHS[0] + SHEET_WIDTHS[1], h = rows.length * ROW;
    const top = mobile ? m : height - m - h;
    let at = width - m;
    if (!mobile) {
      const x0 = L.copy && top + h + 4 > L.copy[1] ? L.copy[2] : m;
      for (let x = at; x - w >= x0; x -= 24) {
        if (!inked([x - w - 4, top - 4, x + 4, top + h + 4], 2)) {
          at = x;
          break;
        }
      }
    }
    const t = table(at, top, SHEET_WIDTHS, rows);
    const rec = (k) => (t[k] ? { node: t[k][1], shown: '' } : null);
    cells = { segs: rec('Segments'), yaw: rec('Yaw'), pitch: rec('Pitch') };
    t.Scale[1].textContent = `1:${(96 / 25.4 / scale).toFixed(2)}`;
    if (t.Vertices) t.Vertices[1].textContent = fmt(stats.verts);
    if (t.Triangles) t.Triangles[1].textContent = fmt(stats.tris);
    if (mobile) return;
    const cross = (x, y) => `M${x - 6} ${y}H${x + 6}M${x} ${y - 6}V${y + 6}`
      + `M${x + 3} ${y}A3 3 0 1 0 ${x - 3} ${y}A3 3 0 1 0 ${x + 3} ${y}`;
    line([[INSET, INSET], [width - INSET, INSET], [INSET, height - INSET],
      [width - INSET, height - INSET]].map(([x, y]) => cross(x, y)).join(''));
  }

  const worldOf = (h, p) => p.clone().sub(h.wrist).applyMatrix4(h.pivot.matrixWorld);
  function farthest(mesh, from) {
    const pos = mesh.geometry.attributes.position, p = new THREE.Vector3();
    let best = null, bd = -1;
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      const dd = p.distanceToSquared(from);
      if (dd > bd) { bd = dd; best = p.clone(); }
    }
    return best;
  }
  const centroid = (mesh) => new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes
    .position).getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
  function joint(a, b) {
    const near = (mesh, to) => {
      const pos = mesh.geometry.attributes.position, p = new THREE.Vector3();
      let best = null, bd = Infinity;
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        const dd = p.distanceToSquared(to);
        if (dd < bd) { bd = dd; best = p.clone(); }
      }
      return best;
    };
    return near(a, centroid(b)).add(near(b, centroid(a))).multiplyScalar(0.5);
  }

  let live = [], shownLive = [];
  const sp = [0, 0], sq = [0, 0], sa = [0, 0], sb = [0, 0];
  const pin = (h, world) => ({
    obj: h.pivot, local: world.clone().applyMatrix4(h.pivot.matrixWorld.clone().invert()),
  });
  function at(pt, out) {
    toScreen(pt.obj.matrixWorld, pt.local);
    out[0] = scr[0];
    out[1] = scr[1];
    return out;
  }
  function moveNote(lab, dx, dy) {
    lab.off[0] = dx;
    lab.off[1] = dy;
    lab.move.setTranslate(dx, dy);
  }
  function setText(rec, s) {
    if (rec.shown === s) return;
    rec.shown = s;
    rec.node.textContent = s;
  }
  const seg = (cls = 'sheet') => el('line', { class: cls }, measured);
  function put(ln, x1, y1, x2, y2) {
    ln.x1.baseVal.value = x1;
    ln.y1.baseVal.value = y1;
    ln.x2.baseVal.value = x2;
    ln.y2.baseVal.value = y2;
  }
  const clipTo = (out, x, y, m) => {
    out[0] = Math.min(Math.max(x, m), L.width - m);
    out[1] = Math.min(Math.max(y, m), L.height - m);
    return out;
  };
  const unitTo = (out, a, b) => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    out[0] = (b[0] - a[0]) / l;
    out[1] = (b[1] - a[1]) / l;
    return out;
  };

  const overText = (a, b) => placed.some((p) => leaderHits({ mesh: null, bend: a, a0: b }, p));

  function dimension(P, Q, per, m, sides = [1, -1]) {
    const p = at(P, [0, 0]), q = at(Q, [0, 0]);
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (len < 24) return false;
    const n = [-(q[1] - p[1]) / len, (q[0] - p[0]) / len];
    for (const off of [14, 22, 32, 46, 64, 90, 120, 160]) {
      for (const s of sides) {
        const a = clipTo([0, 0], p[0] + n[0] * off * s, p[1] + n[1] * off * s, m);
        const b = clipTo([0, 0], q[0] + n[0] * off * s, q[1] + n[1] * off * s, m);
        const span = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (span < 20) continue;
        if (overText(a, b) || overText(p, a) || overText(q, b)) continue;
        if (crossings(a, b, 0) || inked([...a, ...a], 3) || inked([...b, ...b], 3)) continue;
        const d = { P, Q, per, m, off: off * s, lab: null,
          lines: Array.from({ length: 7 }, () => seg()) };
        drawDimension(d);
        strokes.push(lineSegs(d.lines));
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const out = Math.round(DEG(Math.atan2(-n[1] * s, n[0] * s)) / 45) * 45;
        const lab = note(mid, (len / per).toFixed(1), fallbacks(out, false, [4, 10, 18])
          .slice(0, 9), { bare: true });
        if (!lab) {
          strokes.pop();
          for (const ln of d.lines) ln.remove();
          continue;
        }
        Object.assign(d, { lab, mid0: mid, node: lab.nameNode, shown: lab.nameNode.textContent });
        live.push(() => drawDimension(d));
        return true;
      }
    }
    return false;
  }
  function drawDimension(d) {
    at(d.P, sp);
    at(d.Q, sq);
    const len = Math.hypot(sq[0] - sp[0], sq[1] - sp[1]) || 1;
    const nx = -(sq[1] - sp[1]) / len, ny = (sq[0] - sp[0]) / len, s = Math.sign(d.off);
    clipTo(sa, sp[0] + nx * d.off, sp[1] + ny * d.off, d.m);
    clipTo(sb, sq[0] + nx * d.off, sq[1] + ny * d.off, d.m);
    const ln = d.lines;
    put(ln[0], sp[0] + nx * 3 * s, sp[1] + ny * 3 * s, sa[0] + nx * 4 * s, sa[1] + ny * 4 * s);
    put(ln[1], sq[0] + nx * 3 * s, sq[1] + ny * 3 * s, sb[0] + nx * 4 * s, sb[1] + ny * 4 * s);
    put(ln[2], sa[0], sa[1], sb[0], sb[1]);
    const t = Math.atan2(sb[1] - sa[1], sb[0] - sa[0]);
    put(ln[3], sa[0], sa[1], sa[0] + Math.cos(t - 0.4) * 5, sa[1] + Math.sin(t - 0.4) * 5);
    put(ln[4], sa[0], sa[1], sa[0] + Math.cos(t + 0.4) * 5, sa[1] + Math.sin(t + 0.4) * 5);
    put(ln[5], sb[0], sb[1], sb[0] - Math.cos(t - 0.4) * 5, sb[1] - Math.sin(t - 0.4) * 5);
    put(ln[6], sb[0], sb[1], sb[0] - Math.cos(t + 0.4) * 5, sb[1] - Math.sin(t + 0.4) * 5);
    if (!d.lab) return;
    moveNote(d.lab, (sa[0] + sb[0]) / 2 - d.mid0[0], (sa[1] + sb[1]) / 2 - d.mid0[1]);
    setText(d, (len / d.per).toFixed(1));
  }

  const between = (u1, u2) => DEG(Math.acos(Math.min(1, Math.max(-1,
    u1[0] * u2[0] + u1[1] * u2[1]))));
  function angleSegs({ o: { at: p, u1, u2 }, r, len }) {
    const out = [[p, [p[0] + u1[0] * (r + 8), p[1] + u1[1] * (r + 8)]],
      [p, [p[0] + u2[0] * (r + 8), p[1] + u2[1] * (r + 8)]]];
    if (len) out.push([p, [p[0] + u1[0] * len, p[1] + u1[1] * len]]);
    let prev = null;
    for (let k = 0; k <= 8; k++) {
      const ux = u1[0] * (1 - k / 8) + u2[0] * (k / 8), uy = u1[1] * (1 - k / 8) + u2[1] * (k / 8);
      const ul = Math.hypot(ux, uy) || 1, pt = [p[0] + ux / ul * r, p[1] + uy / ul * r];
      if (prev) out.push([prev, pt]);
      prev = pt;
    }
    return out;
  }
  function angle(rays, r = 26, stub = 0) {
    const o = { at: [0, 0], u1: [0, 0], u2: [0, 0] };
    if (!rays(o)) return false;
    const [x, y] = o.at, { u1, u2 } = o;
    if (x < 0 || y < 0 || x > L.width || y > L.height) return false;
    const a = { o, r, len: stub };
    const segs = () => angleSegs(a);
    if (segs().some(([p, q]) => overText(p, q))) return false;
    strokes.push(segs);
    const bis = [u1[0] + u2[0], u1[1] + u2[1]];
    const bl = Math.hypot(...bis) || 1;
    const mid = [x + bis[0] / bl * r, y + bis[1] / bl * r];
    const out = Math.round(DEG(Math.atan2(-bis[1], bis[0])) / 45) * 45;
    const lab = note(mid, `${between(u1, u2).toFixed(1)}°`, fallbacks(out, false,
      [12, 24, 36, 48]));
    if (!lab) {
      strokes.pop();
      return false;
    }
    Object.assign(a, { lab, mid0: mid, node: lab.nameNode, shown: lab.nameNode.textContent,
      rays: [seg(), seg()], arc: el('path', { class: 'sheet' }, measured),
      stub: stub ? seg('sheet-datum') : null });
    live.push(() => {
      rays(o);
      drawAngle(a);
    });
    drawAngle(a);
    return true;
  }
  function drawAngle(a) {
    const { at: p, u1, u2 } = a.o, r = a.r, x = p[0], y = p[1];
    put(a.rays[0], x, y, x + u1[0] * (r + 8), y + u1[1] * (r + 8));
    put(a.rays[1], x, y, x + u2[0] * (r + 8), y + u2[1] * (r + 8));
    const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0;
    a.arc.setAttribute('d', `M${x + u1[0] * r} ${y + u1[1] * r}A${r} ${r} 0 0 ${sweep} `
      + `${x + u2[0] * r} ${y + u2[1] * r}`);
    if (a.stub) put(a.stub, x, y, x + u1[0] * a.len, y + u1[1] * a.len);
    const bx = u1[0] + u2[0], by = u1[1] + u2[1], bl = Math.hypot(bx, by) || 1;
    moveNote(a.lab, x + bx / bl * r - a.mid0[0], y + by / bl * r - a.mid0[1]);
    setText(a, `${between(u1, u2).toFixed(1)}°`);
  }
  const bend = (A, B, C) => (o) => {
    at(A, sp);
    at(B, o.at);
    at(C, sq);
    unitTo(o.u1, sp, o.at);
    unitTo(o.u2, o.at, sq);
    return true;
  };
  const slope = (W, E, dir) => (o) => {
    at(W, sp);
    at(E, sq);
    unitTo(o.u2, sp, sq);
    o.u1[0] = dir;
    o.u1[1] = 0;
    o.at[0] = sp[0] + o.u2[0] * 70;
    o.at[1] = sp[1] + o.u2[1] * 70;
    return Math.sign(o.u2[0]) === dir;
  };

  function coordinate(P, first) {
    const p = at(P, [0, 0]);
    if (p[0] < INSET || p[1] < INSET || p[0] > L.width - INSET || p[1] > L.height - INSET) return;
    const lab = note(p, `x ${pad(p[0])} y ${pad(p[1])}`, fallbacks(first, false, [24, 36, 48]));
    if (!lab) return;
    const cross = el('path', { class: 'sheet', d: 'M-4 0h8M0 -4v8' }, measured);
    const move = svg.createSVGTransform();
    cross.transform.baseVal.appendItem(move);
    const c = { node: lab.nameNode, shown: lab.nameNode.textContent };
    const draw = () => {
      at(P, sp);
      move.setTranslate(sp[0], sp[1]);
      moveNote(lab, sp[0] - p[0], sp[1] - p[1]);
      setText(c, `x ${pad(sp[0])} y ${pad(sp[1])}`);
    };
    live.push(draw);
    draw();
  }

  const mesh = (h, name, nth = 0) => h.meshes.filter((x) => x.name === name)[nth];
  const pivotOf = (name) => hands[0].joints[name].pivot.getWorldPosition(new THREE.Vector3());
  function indexes() {
    const iMcp = pivotOf('i-mcp');
    const hb = (name) => mesh(hands[1], name);
    const hMcp = joint(hb('FMA24466'), hb('FMA24451'));
    return { iMcp, rTip: farthest(mesh(hands[0], 'I-IP_IP'), iMcp), hMcp,
      hTip: farthest(hb('FMA24460'), hMcp) };
  }

  const R = (world) => pin(hands[0], world), H = (world) => pin(hands[1], world);
  const hb = (name) => mesh(hands[1], name);

  function* dimensions(m, mobile) {
    const [robot, human] = hands;
    const { iMcp, rTip, hMcp, hTip } = indexes();
    dimension(R(iMcp), R(rTip), robot.scale, m);
    yield;
    dimension(H(hMcp), H(hTip), human.scale, m);
    yield;
    if (mobile) return;
    dimension(R(rTip), H(hTip), (robot.scale + human.scale) / 2, m);
    yield;
    const pMcp = pivotOf('p-mcp');
    dimension(R(iMcp), R(pMcp), robot.scale, m);
    yield;
    const h5 = joint(hb('FMA24472'), hb('FMA24454'));
    dimension(H(hMcp), H(h5), human.scale, m);
    yield;
    for (const h of hands) {
      const w = worldOf(h, h.wrist), e = worldOf(h, h.elbow);
      const cut = w.clone().add(e.clone().sub(w).setLength(h.below * h.scale));
      dimension(pin(h, w), pin(h, cut), h.scale, m);
      yield;
    }
  }

  function* marks() {
    const [robot, human] = hands;
    const { rTip, hMcp, hTip } = indexes();
    const rw = R(worldOf(robot, robot.wrist)), re = R(worldOf(robot, robot.elbow));
    angle(bend(re, rw, R(pivotOf('m-mcp'))));
    yield;
    for (const [f, ip, nth] of [['m', 'M-IP_IP', 0], ['r', 'M-IP_IP', 1], ['p', 'P-IP_IP', 0]]) {
      const mcp = pivotOf(`${f}-mcp`), pip = pivotOf(`${f}-pip`);
      angle(bend(R(mcp), R(pip), R(farthest(mesh(robot, ip, nth), pip))), 16);
      yield;
    }
    const hw = H(worldOf(human, human.wrist)), he = H(worldOf(human, human.elbow));
    angle(bend(he, hw, H(centroid(hb('FMA24468')))));
    yield;
    angle(bend(H(centroid(hb('FMA24466'))), H(hMcp), H(centroid(hb('FMA24451')))), 18);
    yield;
    angle(slope(rw, re, -1), 34, 48);
    yield;
    angle(slope(hw, he, 1), 34, 48);
    yield;
    coordinate(R(rTip), -90);
    yield;
    coordinate(H(hTip), 90);
    yield;
    coordinate(rw, -45);
    yield;
    coordinate(hw, 45);
    yield;
  }

  function layout(next) {
    L = next;
    const { width, height, mobile } = L;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    transformed = new Map();
    drawnSegs = new Map();
    columns();
    const m = mobile ? 16 : MARGIN;
    const [cx0, cy0, cx1] = L.copy ?? [];
    placed = [];
    fits = (lab, allow) => {
      const box = boxAt(lab);
      const [x0, y0, x1, y1] = box;
      return x0 >= m && x1 <= width - m && y0 >= m && y1 <= height - m
        && !(L.copy && x0 < cx1 && y1 > cy0 && x1 > cx0)
        && !crosses(lab, allow) && !stroked(box) && !placed.some((p) => clash(p, lab));
    };
    sheet.replaceChildren();
    cells = null;
    layer = sheet;
    frame(m, mobile);
    fixed = placed.slice();
    for (const lab of labels) {
      const [name, rest] = wrap(mobile && lab.short ? lab.short : lab.name);
      lab.nameNode.textContent = name;
      lab.rest.textContent = rest;
      lab.len = undefined;
    }
    [...fitAll(function* () { placeLabels(); })];
    paint();
    for (const lab of labels) {
      tweens.delete(lab);
      lab.ease.setTranslate(0, 0);
      show(lab, !!lab.call, false);
    }
  }

  let sheetPlaced = [];
  function* fitAll(fitLabels) {
    const m = L.mobile ? 16 : MARGIN;
    placed = fixed.slice();
    live = [];
    strokes = [];
    const shownGroups = [measured, notesG];
    [measured, notesG] = shownGroups.map((g) => {
      const next = el('g', { style: 'visibility: hidden' }, null);
      g.after(next);
      return next;
    });
    layer = measured;
    yield* dimensions(m, L.mobile);
    const ahead = placed.length;
    yield* fitLabels();
    const mark = placed.length;
    if (!L.mobile) yield* marks();
    layer = sheet;
    sheetPlaced = [...placed.slice(fixed.length, ahead), ...placed.slice(mark)];
    for (const g of shownGroups) g.remove();
    for (const g of [measured, notesG]) g.removeAttribute('style');
    shownLive = live;
  }

  function tries(lab) {
    const { mobile, scale } = L;
    const k = mobile ? 1 : Math.min(1, scale / REF_SCALE);
    const listed = ((mobile ? lab.mobile : lab.at) ?? [])
      .map(([a, length, face = a]) => [a, length * k, face]);
    if (!listed.length) return { first: [], dense: [] };
    return { first: [...listed, ...fallbacks(listed[0][0], mobile)],
      dense: mobile ? [] : fallbacks(lab.at[0][0], false, DENSE.lengths) };
  }

  const covered = (lab) => inside(1 - lab.hand, lab.a0[0], lab.a0[1], 0);

  function trial(lab, [a, length, face], allow) {
    lab.anchor = anchorAt(lab, face);
    if (!lab.anchor) return false;
    lab.call = [a, length];
    lab.allow = allow;
    callout(lab);
    return !covered(lab) && fits(lab, allow);
  }

  function placeLabels() {
    for (const lab of labels) {
      lab.anchors.clear();
      lab.call = null;
      lab.drawn.fill(0);
      lab.move.setTranslate(0, 0);
      Object.assign(lab, { failSince: null, okSince: null, passed: new Set(), flipAt: -Infinity });
      place(lab, tries(lab).first);
    }
    if (L.mobile) return;
    for (const lab of labels) if (!lab.call) place(lab, tries(lab).dense, DENSE.allow);
  }

  function place(lab, list, allow) {
    for (const t of list) {
      if (trial(lab, t, allow)) {
        placed.push(lab);
        return;
      }
    }
    lab.call = null;
  }

  function show(lab, on, fade, dim = false, at = performance.now()) {
    const opacity = on ? (dim ? DIM : 1) : 0;
    if (lab.visible === on && lab.opacity === opacity) return;
    if (lab.visible !== on) lab.flipAt = at;
    lab.visible = on;
    lab.opacity = opacity;
    later(() => {
      const g = lab.g.style;
      g.transition = fade
        ? `opacity ${FADE_MS}ms ease-out, visibility 0s linear ${on ? 0 : FADE_MS}ms` : 'none';
      g.opacity = opacity;
      g.visibility = on ? '' : 'hidden';
    });
  }

  function* refit(ink, final) {
    if (!L) return false;
    L.ink = ink;
    transformed = new Map();
    drawnSegs = new Map();
    columns();
    const now = performance.now();
    shadows = labels.map((lab) => Object.create(lab));
    held = [];
    const fitLabels = function* () {
      const deferred = [];
      for (const lab of shadows) {
        later(() => {
          lab.drawn.fill(0);
          lab.move.setTranslate(0, 0);
        });
        if (!lab.visible || !lab.call) {
          deferred.push(lab);
          continue;
        }
        callout(lab);
        const dim = covered(lab);
        const ok = dim || fits(lab, lab.allow);
        lab.failSince = ok ? null : lab.failSince ?? now;
        if (ok || now - lab.failSince < HOLD_MS) {
          placed.push(lab);
          show(lab, true, true, dim, now);
        } else deferred.push(lab);
      }
      yield;
      for (const lab of deferred) {
        search(lab, now);
        yield;
      }
    };
    if (final) yield* fitAll(fitLabels);
    else {
      placed = [...fixed, ...sheetPlaced];
      yield* fitLabels();
    }
    const was = new Map();
    for (const lab of labels) {
      if (!lab.visible) continue;
      const t = tweenAt(lab);
      was.set(lab, {
        bend: [lab.a0[0] + t.bend[0] + lab.drawn[0], lab.a0[1] + t.bend[1] + lab.drawn[1]],
        text: [lab.box[0] + t.text[0] + lab.drawn[0], lab.box[1] + t.text[1] + lab.drawn[1]],
      });
    }
    labels.forEach((lab, i) => Object.assign(lab, shadows[i]));
    shadows = null;
    for (const write of held) write();
    held = null;
    paint();
    const shown = performance.now();
    for (const lab of labels) {
      const old = was.get(lab);
      if (!old || !lab.visible) continue;
      const from = {
        bend: [old.bend[0] - lab.a0[0], old.bend[1] - lab.a0[1]],
        text: [old.text[0] - lab.box[0], old.text[1] - lab.box[1]],
      };
      if (Math.hypot(from.text[0], from.text[1]) < 0.5
        && Math.hypot(from.bend[0] - (lab.bend[0] - lab.a0[0]),
          from.bend[1] - (lab.bend[1] - lab.a0[1])) < 0.5) continue;
      tweens.set(lab, { t0: shown, from });
    }
    if (tweens.size) {
      cancelAnimationFrame(easing);
      tick();
    }
    return labels.some((lab) => lab.failSince !== null || lab.okSince !== null);
  }

  function search(lab, now) {
    const keep = { anchor: lab.anchor, call: lab.call, allow: lab.allow };
    const restore = () => {
      Object.assign(lab, keep);
      if (lab.call) callout(lab);
    };
    const { first, dense } = tries(lab);
    lab.anchors.clear();
    const ok = [...first.filter((t) => trial(lab, t)).map((t) => [t, undefined]),
      ...dense.filter((t) => trial(lab, t, DENSE.allow)).map((t) => [t, DENSE.allow])];
    const key = ([[a, len, face], allow]) => `${a} ${Math.round(len)} ${face} ${allow ? 1 : 0}`;
    const twice = ok.filter((c) => lab.passed.has(key(c)));
    lab.passed = new Set(ok.map(key));
    const settledFlip = now - lab.flipAt >= FLIP_MS;
    if (lab.visible) {
      if (twice.length) {
        const turn = (a) => Math.abs((((a - keep.call[0]) % 360) + 540) % 360 - 180);
        twice.sort((p, q) => turn(p[0][0]) - turn(q[0][0]));
        trial(lab, ...twice[0]);
        lab.failSince = null;
        placed.push(lab);
      } else if (!ok.length && settledFlip) {
        restore();
        lab.failSince = null;
        show(lab, false, true, false, now);
        lab.call = null;
      } else {
        restore();
        placed.push(lab);
      }
      return;
    }
    lab.okSince = ok.length ? lab.okSince ?? now : null;
    if (twice.length && now - lab.okSince >= HOLD_MS && settledFlip) {
      trial(lab, ...twice[0]);
      lab.okSince = null;
      placed.push(lab);
      show(lab, true, true, false, now);
    } else {
      restore();
      lab.call = null;
    }
  }

  const tweens = new Map();
  let easing = 0;
  const smooth = (t) => 1 - (1 - t) ** 3;
  function tweenAt(lab) {
    const bendNow = [lab.bend[0] - lab.a0[0], lab.bend[1] - lab.a0[1]];
    const tw = tweens.get(lab);
    if (!tw) return { bend: bendNow, text: [0, 0] };
    const k = smooth(Math.min(1, (performance.now() - tw.t0) / EASE_MS));
    return {
      bend: [tw.from.bend[0] + (bendNow[0] - tw.from.bend[0]) * k,
        tw.from.bend[1] + (bendNow[1] - tw.from.bend[1]) * k],
      text: [tw.from.text[0] * (1 - k), tw.from.text[1] * (1 - k)],
    };
  }
  function tick() {
    const now = performance.now();
    for (const [lab, tw] of tweens) {
      const t = tweenAt(lab);
      lab.leader.setAttribute('x1', lab.a0[0] + t.bend[0]);
      lab.leader.setAttribute('y1', lab.a0[1] + t.bend[1]);
      lab.ease.setTranslate(t.text[0], t.text[1]);
      if (now - tw.t0 >= EASE_MS) tweens.delete(lab);
    }
    easing = tweens.size ? requestAnimationFrame(tick) : 0;
  }

  function update({ turn: [yaw, pitch], segs }) {
    if (!L) return;
    for (const lab of labels) {
      if (!lab.call) continue;
      const at = toScreen(lab.mesh.matrixWorld, lab.anchor);
      const dx = at[0] - lab.a0[0], dy = at[1] - lab.a0[1];
      if (dx === lab.drawn[0] && dy === lab.drawn[1]) continue;
      lab.drawn[0] = dx;
      lab.drawn[1] = dy;
      lab.move.setTranslate(dx, dy);
    }
    for (let i = 0; i < shownLive.length; i++) shownLive[i]();
    if (!cells) return;
    setText(cells.segs, fmt(segs));
    if (cells.yaw) setText(cells.yaw, degrees(yaw));
    if (cells.pitch) setText(cells.pitch, degrees(pitch));
  }

  for (const lab of labels) {
    lab.text.addEventListener('pointerenter', () => {
      for (const n of lab.nodes) n.classList.add('active');
      onHover(lab.mesh);
    });
    lab.text.addEventListener('pointerleave', () => {
      for (const n of lab.nodes) n.classList.remove('active');
      onHover(null);
    });
  }

  return { prepare, reset, layout, refit, update, prefetch, columnsReady };
}
