import { orbit } from '../shared/orbit.js';

const q = new URLSearchParams(location.search);
const num = (k, d) => (q.has(k) ? Number(q.get(k)) : d);
const W = num('w', 1250), H = num('h', 700);
const FX = num('fx', 0.64), FW = num('fw', 1.1), BARE = num('bare', 64);
const capture = q.has('capture');
if (capture) document.body.dataset.capture = '';
const DPR = capture ? num('dpr', 2) : Math.min(devicePixelRatio || 1, 2);

const font = q.has('font') ? new URL(q.get('font'), location.href) : null;
if (font?.origin === location.origin) {
  const face = new FontFace('Recursive', `url("${font.href}")`);
  document.fonts.add(face);
  await face.load().catch(() => {});
}
const FACE = '"Recursive", -apple-system, "Helvetica Neue", sans-serif';

const C = {
  paper: '#ffffff', ink: '#111111', mid: '#6f6f6f', light: '#a8a8a8', faint: '#d6d6d6',
  accent: '#d02020',
};
const TAU = Math.PI * 2, GOLD = 2.39996, LIFT = 0.04;
const GROW = 2.8, GROWN = 2.5, TURN_IN = 0.7, SPEED = 1 / 95, GAP = 0.6, CLIMB = 0.8, FOUND = 1.1, POP = 0.7, NOTE_FADE = 1.2;
const RANK = { dismissed: 0, info: 1, low: 2, medium: 3, high: 4, critical: 5 };
const STRONG = new Set(['high', 'critical']);
const SEVERITY = { critical: '#c52335', high: '#b44700', medium: '#8a6500', low: '#187438', info: '#6f6f6f' };
const word = (s) => s[0].toUpperCase() + s.slice(1);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const clockText = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => mul(a, 1 / (Math.hypot(...a) || 1));
const turnTo = (d, u, v, inc, phi) =>
  add(mul(d, Math.cos(inc)), mul(add(mul(u, Math.cos(phi)), mul(v, Math.sin(phi))), Math.sin(inc)));

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tints = new Map();
function tint(base, toward, k, far) {
  const ks = Math.round(clamp(k) * 10), fs = Math.round(clamp(far) * 10);
  const key = `${base}${toward}${ks}/${fs}`;
  if (!tints.has(key)) {
    const [a, b, p] = [hex(base), hex(toward), hex(C.paper)];
    const rgb = a.map((v, i) => {
      const m = v + (b[i] - v) * ks / 10;
      return Math.round(m + (p[i] - m) * fs / 10 * 0.6);
    });
    tints.set(key, `rgb(${rgb.join()})`);
  }
  return tints.get(key);
}

const stage = document.querySelector('.stage');
stage.style.width = `${W}px`;
stage.style.height = `${H}px`;
const canvas = stage.querySelector('canvas');
canvas.width = Math.round(W * DPR);
canvas.height = Math.round(H * DPR);
const ctx = canvas.getContext('2d');

function grow(files) {
  const R = rng(11);
  const root = { path: '', depth: 0, kids: [], files: [], parent: null };
  const dirs = new Map([['', root]]);
  for (const f of files) {
    const parts = f.split('/modmod001/');
    let n = root;
    for (let i = 1; i < parts.length; i++) {
      const path = parts.slice(0, i).join('/modmod001/');
      let k = dirs.get(path);
      if (!k) {
        k = { path, depth: i, kids: [], files: [], parent: n };
        dirs.set(path, k);
        n.kids.push(k);
      }
      n = k;
    }
    n.files.push(f);
  }
  const size = (n) => (n.size = n.files.length + n.kids.reduce((a, k) => a + size(k), 0));
  size(root);
  let top = root;
  while (!top.files.length && top.kids.length === 1) top = top.kids[0];
  top.parent = null;
  const level = (n, d) => { n.depth = d; n.kids.forEach((k) => level(k, d + 1)); };
  level(top, 0);
  const nodes = [], leaves = [], leafOf = new Map();
  const branch = (n, incl, phi, len, w, t) => {
    Object.assign(n, { incl, phi, len, w, t, bend: (R() - 0.5) * 0.8, phase: R() * TAU, order: nodes.length });
    nodes.push(n);
    const items = n.kids.map((k) => ({ k, size: k.size }));
    for (let i = 0; i < n.files.length; i += 7) {
      items.push({ files: n.files.slice(i, i + 7), size: Math.min(7, n.files.length - i) });
    }
    items.sort((a, b) => b.size - a.size);
    let turn = R() * TAU;
    items.forEach((it, i) => {
      const share = it.size / n.size;
      const at = i === 0 ? 1 : 0.45 + 0.5 * R();
      const inc = i === 0 ? R() * 0.12 : 0.6 + 0.65 * (1 - Math.sqrt(share)) + R() * 0.25;
      turn += GOLD + (R() - 0.5) * 0.5;
      if (!it.files) {
        const reach = i === 0 ? 0.35 + 0.4 * Math.sqrt(share) : 0.55 + 0.5 * Math.sqrt(share);
        branch(it.k, inc, turn, Math.max(22, len * reach), Math.max(0.7, w * Math.pow(share, 0.45)), at);
        return;
      }
      const twig = { path: `${n.path}#${i}`, depth: n.depth + 1, parent: n, kids: [], files: [] };
      branch(twig, inc, turn, 14 + it.files.length * 3.2, 0.7, at);
      it.files.forEach((file, j) => {
        const last = j === it.files.length - 1;
        const leaf = {
          file, node: twig, t: Math.min(1, 0.25 + (0.75 * (j + 1)) / it.files.length),
          rel: last ? 0 : 0.7 + R() * 0.3, side: (j % 2 ? 0 : Math.PI) + (R() - 0.5) * 0.6,
          size: 7 + R() * 4, phase: R() * TAU, readAt: Infinity, titles: [],
        };
        leaves.push(leaf);
        leafOf.set(file, leaf);
      });
    });
  };
  branch(top, 0, 0, 115, 12, 0);
  return { root: top, nodes, leaves, leafOf, R };
}

function pose(nodes, time, still) {
  for (const n of nodes) {
    const p = n.parent;
    const sway = still ? 0
      : Math.sin(time * 0.7 + n.phase) * 0.012 * Math.min(4, n.depth)
        + Math.sin(time * 0.31 + n.phase * 2) * 0.006 * n.depth;
    if (!p) {
      n.p0 = [0, 0, 0];
      n.dir = unit([still ? 0 : Math.sin(time * 0.4) * 0.008, -1, 0]);
      n.u = [1, 0, 0];
    } else {
      n.p0 = at(p, n.t);
      n.dir = unit(add(turnTo(p.dir, p.u, p.v, n.incl + sway, n.phi), [0, -LIFT, 0]));
      const u = add(p.u, mul(n.dir, -dot(p.u, n.dir)));
      n.u = Math.hypot(...u) > 1e-3 ? unit(u) : p.v;
    }
    n.v = cross(n.dir, n.u);
    const len = n.len * (n.grow ?? 1);
    n.p1 = add(n.p0, mul(n.dir, len));
    n.c = add(mul(add(n.p0, n.p1), 0.5), mul(n.u, len * n.bend * 0.25));
  }
}

function at(n, t) {
  const u = 1 - t;
  return add(add(mul(n.p0, u * u), mul(n.c, 2 * u * t)), mul(n.p1, t * t));
}

let yaw = 0, cosY = 1, sinY = 0;
const P = (a, p) => {
  const x = p[0] * cosY - p[2] * sinY, z = p[0] * sinY + p[2] * cosY;
  return [a.ox + x * a.scale, a.oy + p[1] * a.scale, z];
};

function prepare(data) {
  const tree = grow(data.files);
  const { nodes, leaves, leafOf, R } = tree;
  pose(nodes, 0, true);
  const top = Math.min(...nodes.map((n) => n.p1[1]));
  const radii = nodes.map((n) => Math.hypot(n.p1[0], n.p1[2])).sort((x, y) => x - y);
  const h = 11 - top, r = radii[Math.floor(radii.length * 0.97)] + 11;
  const fork = Math.min(...nodes.filter((n) => n.parent === tree.root).map((n) => n.t)) * tree.root.len;
  const scale = Math.min((H - BARE - 12) / (h - fork), (W * FW) / (2 * r));
  const audit = {
    ...tree, name: data.name, notes: data.notes, scale, ox: W * FX, oy: H - BARE + fork * scale, reach: r,
  };
  let last = 0;
  for (const n of nodes) {
    n.d = n.len * (1 + 0.1 * n.depth);
    n.s = n.parent ? n.parent.s + n.parent.d * n.t : 0;
    last = Math.max(last, n.s + n.d);
  }
  for (const n of nodes) { n.s = n.s * GROWN / last - 0.3; n.d *= GROWN / last; }
  for (const l of leaves) l.s = l.node.s + l.node.d * l.t;
  audit.byWidth = [...nodes].sort((x, y) => x.w - y.w);
  if (data.run) {
    const { agents, reads, steps, end } = data.run;
    const T = (s) => GROW + s * SPEED;
    const total = reads.at(-1)[1];
    leaves.map((_, i) => i).sort(() => R() - 0.5).slice(0, total).forEach((i, k) => {
      let j = 1;
      while (reads[j][1] < k + 1) j++;
      const [t0, c0] = reads[j - 1], [t1, c1] = reads[j];
      leaves[i].readAt = T(t0 + ((t1 - t0) * (k + 1 - c0)) / (c1 - c0));
    });
    audit.events = agents.map(([file, s, e, st]) => ({ leaf: leafOf.get(file), s: T(s), e: T(e), st }))
      .filter((ev) => ev.leaf);
    for (const [file, title] of Object.entries(data.titles)) leafOf.get(file)?.titles.push(title);
    const confirmed = new Set(agents.filter((a) => a[3] !== 'dismissed').map((a) => a[0])).size;
    audit.run = { end, steps, total, confirmed };
    audit.end = T(end);
  } else {
    audit.events = data.findings.flatMap((f, i) => f.files.map((file) => {
      const leaf = leafOf.get(file);
      leaf.titles.push(f.title);
      const s = GROW + 0.6 + i * GAP;
      return { leaf, s, e: s + CLIMB, st: f.severity, i };
    }));
    audit.count = data.findings.length;
    for (const l of leaves) l.readAt = l.s;
    audit.end = GROW + 0.6 + (data.findings.length - 1) * GAP + CLIMB + POP;
  }
  audit.settle = audit.end + NOTE_FADE + 0.2;
  return audit;
}

function leafGeom(a, l, time, still) {
  const n = l.node, base = at(n, l.t);
  const [px, py, z] = P(a, base);
  let r = l.rel * l.unfold + (still ? 0 : Math.sin(time * 1.7 + l.phase) * 0.05);
  if (mouse && !still) {
    const d = Math.hypot(px - mouse.x, py - mouse.y);
    if (d < 90) r += Math.sin(time * 9 + l.phase) * 0.35 * (1 - d / 90);
  }
  const s = l.size * l.open * l.pop, dir = turnTo(n.dir, n.u, n.v, r, l.side);
  const [bx, by] = P(a, add(base, mul(dir, s * 0.18)));
  const [fx, fy] = P(a, add(base, mul(dir, s)));
  return { px, py, bx, by, fx, fy, z, mx: (bx + fx) / 2, my: (by + fy) / 2 };
}

function drawLeaf(g, fill, stroke, lw) {
  const { px, py, bx, by, fx, fy } = g;
  const dx = fx - bx, dy = fy - by, nx = -dy * 0.3, ny = dx * 0.3;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(bx + dx * 0.08 + nx, by + dy * 0.08 + ny, bx + dx * 0.62 + nx * 0.8, by + dy * 0.62 + ny * 0.8, fx, fy);
  ctx.bezierCurveTo(bx + dx * 0.62 - nx * 0.8, by + dy * 0.62 - ny * 0.8, bx + dx * 0.08 - nx, by + dy * 0.08 - ny, bx, by);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(bx, by);
  if (Math.hypot(dx, dy) > 8) ctx.lineTo(bx + dx * 0.78, by + dy * 0.78);
  ctx.lineWidth = Math.min(lw, 0.6);
  ctx.stroke();
}

function chain(leaf) {
  const out = [];
  for (let n = leaf.node; n; n = n.parent) out.unshift(n);
  return out;
}

function path(a, leaf) {
  const c = chain(leaf), pts = [];
  c.forEach((n, i) => {
    const end = i < c.length - 1 ? c[i + 1].t : leaf.t;
    const m = Math.max(2, Math.ceil(8 * end));
    for (let k = i ? 1 : 0; k <= m; k++) pts.push(P(a, at(n, (end * k) / m)));
  });
  if (leaf.g) pts.push([leaf.g.mx, leaf.g.my]);
  return pts;
}

function stroke(pts, p, color, width) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let left = total * p;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let head = pts[0];
  for (let i = 1; i < pts.length && left > 0; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], d = Math.hypot(bx - ax, by - ay);
    const k = Math.min(1, left / (d || 1));
    head = [ax + (bx - ax) * k, ay + (by - ay) * k];
    ctx.lineTo(...head);
    left -= d;
  }
  ctx.stroke();
  return head;
}

function settleLeaves(a, T) {
  const traces = [];
  for (const l of a.leaves) {
    const k = (T - l.s) / 0.55;
    l.open = k <= 0 ? 0 : k >= 1 ? 1 : ease(k) + 0.35 * Math.sin(Math.PI * k) * (1 - k);
    l.unfold = 0.2 + 0.8 * ease(k);
    l.fresh = clamp(1 - (T - l.s - 0.3) / 1.6);
    l.read = T >= l.readAt;
    l.flash = l.read && a.run ? clamp(1 - (T - l.readAt) / 0.6) : 0;
    l.active = false;
    l.sev = null;
    l.found = Infinity;
    l.dismissed = false;
    l.pop = 1;
  }
  a.checking = 0;
  a.reading = a.leaves.filter((l) => l.read).length;
  for (const ev of a.events) {
    if (T < ev.s) continue;
    const l = ev.leaf;
    if (T < ev.e) {
      a.checking++;
      const climb = Math.min(CLIMB, ev.e - ev.s);
      traces.push({ l, p: ease((T - ev.s) / climb), kind: T < ev.s + climb ? 'climb' : 'hold' });
      if (T >= ev.s + climb) l.active = true;
      continue;
    }
    const k = T - ev.e;
    if (ev.st === 'dismissed') {
      l.dismissed = true;
      if (k < 0.5) traces.push({ l, p: 1, kind: 'gone', k: k / 0.5 });
      continue;
    }
    if (!l.sev || RANK[ev.st] > RANK[l.sev]) l.sev = ev.st;
    l.found = Math.min(l.found, ev.e);
    if (k < FOUND) traces.push({ l, p: 1, kind: 'found', k: k / FOUND });
  }
  for (const l of a.leaves) {
    if (!l.sev) continue;
    const k = (T - l.found) / POP;
    if (k < 1) l.pop = 0.35 + 0.65 * ease(k) + 0.55 * Math.sin(Math.PI * k) * (1 - k);
  }
  return traces;
}

function limb(a, n) {
  const pts = [];
  for (let k = 0; k <= 16; k++) pts.push(P(a, at(n, k / 16)));
  const left = [], right = [];
  pts.forEach(([x, y], k) => {
    const [ax, ay] = pts[Math.max(0, k - 1)], [bx, by] = pts[Math.min(16, k + 1)];
    const dx = bx - ax, dy = by - ay, t = k / 16;
    const r = (Math.max(0.6, n.w * n.wk * (1 - 0.35 * t)) * a.scale) / 2 / (Math.hypot(dx, dy) || 1);
    left.push([x - dy * r, y + dx * r]);
    right.push([x + dy * r, y - dx * r]);
  });
  ctx.beginPath();
  for (const [x, y] of [...left, ...right.reverse()]) ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
  const width = n.w * n.wk * a.scale;
  if (width > 6) {
    right.reverse();
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = C.paper;
    ctx.lineWidth = Math.max(0.6, width * 0.14);
    ctx.beginPath();
    pts.forEach(([x, y], k) => {
      const side = left[k][0] < right[k][0] ? left[k] : right[k];
      ctx.lineTo(x + (side[0] - x) * 0.45, y + (side[1] - y) * 0.45);
    });
    ctx.stroke();
    ctx.restore();
  }
  for (const k of [0, 16]) {
    ctx.beginPath();
    ctx.arc(pts[k][0], pts[k][1], (Math.max(0.6, n.w * n.wk * (1 - 0.35 * (k / 16))) * a.scale) / 2, 0, TAU);
    ctx.fill();
  }
}

function drawBranches(a, thick) {
  for (const n of a.byWidth) {
    if (n.grow <= 0 || (n.w * a.scale > 2.5) !== thick) continue;
    const [ax, ay, az] = P(a, n.p0), [cx, cy] = P(a, n.c), [bx, by] = P(a, n.p1);
    const tone = 168 - 151 * clamp((n.w - 0.7) / 3.5);
    const v = Math.round(tone + (255 - tone) * 0.6 * clamp(az / a.reach));
    const color = `rgb(${v},${v},${v})`;
    if (thick) {
      ctx.fillStyle = color;
      limb(a, n);
      continue;
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.6, n.w * n.wk * 0.83 * a.scale);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cx, cy, bx, by);
    ctx.stroke();
  }
}

function drawTraces(a, traces) {
  for (const { l, p, kind, k } of traces) {
    if (kind === 'hold') continue;
    const pts = path(a, l);
    if (kind === 'gone') {
      ctx.globalAlpha = 1 - k;
      stroke(pts, 1, C.light, 1);
      ctx.globalAlpha = 1;
      continue;
    }
    if (kind === 'found') {
      ctx.globalAlpha = 1 - ease(k);
      stroke(pts, 1, C.paper, 4.5);
      stroke(pts, 1, C.accent, 2);
      ctx.globalAlpha = 1;
      continue;
    }
    stroke(pts, p, C.paper, 4.5);
    const head = stroke(pts, p, C.ink, 1.6);
    ctx.beginPath();
    ctx.arc(head[0], head[1], 3, 0, TAU);
    ctx.fillStyle = C.ink;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = C.paper;
    ctx.stroke();
  }
}

function drawFocus(a, l) {
  const pts = path(a, l);
  ctx.lineJoin = 'round';
  stroke(pts, 1, C.paper, 5);
  stroke(pts, 1, C.accent, 2.4);
  drawLeaf(l.g, STRONG.has(l.sev) ? C.accent : C.paper, C.accent, 1.4);
}

function rows(text, max) {
  if (ctx.measureText(text).width <= max) return [text];
  const words = text.split(' ');
  let best = [text], widest = Infinity;
  for (let i = 1; i < words.length; i++) {
    const pair = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    const w = Math.max(...pair.map((r) => ctx.measureText(r).width));
    if (w < widest) { widest = w; best = pair; }
  }
  return best;
}

function drawNotes(a, T) {
  const k = ease((T - a.end) / NOTE_FADE);
  if (k <= 0 || W < 600) return;
  ctx.globalAlpha = k;
  ctx.font = `12.5px ${FACE}`;
  ctx.textAlign = 'left';
  const taken = [];
  for (const file of a.notes) {
    const l = a.leafOf.get(file);
    if (!l?.g || !l.sev) continue;
    const { fx: lx, fy: ly } = l.g;
    const lines = rows(l.titles[0], 150);
    const bw = Math.max(...lines.map((r) => ctx.measureText(r).width), 12 + ctx.measureText(word(l.sev)).width) + 16;
    const bh = (lines.length + 1) * 16 + 10;
    const right = lx > a.ox ? lx + 46 + bw < W - 16 : lx - 46 - bw < 16;
    const bx = right ? lx + 40 : lx - 40 - bw;
    let by = clamp(ly < 90 ? ly + 24 : ly - 24 - bh, 8, H - bh - 8);
    for (const y of taken) if (Math.abs(by - y) < bh + 8) by = y + bh + 8;
    taken.push(by);
    ctx.strokeStyle = C.mid;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(right ? bx : bx + bw, by + (ly < by ? 0 : bh));
    ctx.stroke();
    ctx.fillStyle = C.paper;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = C.ink;
    lines.forEach((r, i) => ctx.fillText(r, bx + 8, by + 17 + i * 16));
    const y = by + 17 + lines.length * 16;
    ctx.fillStyle = SEVERITY[l.sev];
    ctx.fillRect(bx + 8, y - 8, 7, 7);
    ctx.fillStyle = C.mid;
    ctx.fillText(word(l.sev), bx + 20, y);
  }
  ctx.globalAlpha = 1;
}

function label(text, x, y, color) {
  ctx.textAlign = 'left';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.paper;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawCaption(a, T) {
  const k = ease((T - GROW) / 0.8);
  if (k <= 0) return;
  ctx.globalAlpha = k;
  ctx.font = `12.5px ${FACE}`;
  const from = a.ox + a.root.w * a.scale * 0.5 + 16, edge = W - 12;
  const name = [a.name, `${a.leaves.length.toLocaleString('en-US')} files`];
  let line;
  if (!a.run) {
    const found = new Set(a.events.filter((ev) => T >= ev.e).map((ev) => ev.i)).size;
    line = [T < a.end ? `${found} of ${a.count} findings` : `${a.count} findings`];
  } else if (T >= a.end) line = [clockText(a.run.end), `${a.run.confirmed} files with findings`];
  else {
    const s = clamp((T - GROW) / SPEED, 0, a.run.end);
    const step = a.run.steps.filter(([at]) => at <= s).at(-1)[1];
    const doing = step === 'reading the code' ? `${a.reading} of ${a.run.total} files read`
      : step === 'checking files' ? `${a.checking} agents checking` : step;
    line = [`Run time ${clockText(s)}`, doing];
  }
  const fits = (t, room) => ctx.measureText(t).width <= room;
  const longest = captionProbes(a);
  const split = ![name, ...longest].every((parts) => fits(parts.join(', '), edge - from));
  const x = split ? Math.max(12, Math.min(from, edge - Math.max(...name.map((t) => ctx.measureText(t).width)))) : from;
  const lay = (parts) => (split ? parts.flatMap((t) => wrapWords(t, edge - x)) : [parts.join(', ')]);
  const top = lay(name);
  const below = Math.max(...longest.map((parts) => lay(parts).length));
  const rows = [...top.map((t) => [t, C.ink]), ...lay(line).map((t) => [t, C.mid])];
  const y0 = H - 24 - (top.length + below - 1) * 16;
  rows.forEach(([text, color], i) => label(text, x, y0 + i * 16, color));
  ctx.globalAlpha = 1;
}

function captionProbes(a) {
  if (!a.run) return [[`${a.count} of ${a.count} findings`]];
  const clock = clockText(a.run.end);
  return [
    ...a.run.steps.map(([, step]) => [`Run time ${clock}`,
      step === 'reading the code' ? `${a.run.total} of ${a.run.total} files read`
        : step === 'checking files' ? `${a.events.length} agents checking` : step]),
    [clock, `${a.run.confirmed} files with findings`],
  ];
}

function wrapWords(text, max) {
  const out = [];
  for (const word of text.split(' ')) {
    const last = out.at(-1);
    if (last && ctx.measureText(`${last} ${word}`).width <= max) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  return out;
}

let audit = null, mouse = null, hovered = null, pinned = null, turn = null, moving = false;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const still = () => q.has('t') || capture || reduce.matches;

function renderAt(t) {
  const a = audit;
  moving = turn ? turn.update() : false;
  yaw = (turn?.yaw ?? 0) + num('yaw', 0) * Math.PI / 180 - TURN_IN * (1 - ease(t / (GROW + 1.6)));
  cosY = Math.cos(yaw);
  sinY = Math.sin(yaw);
  for (const n of a.nodes) {
    n.grow = clamp((t - n.s) / n.d);
    n.wk = 0.3 + 0.7 * ease((t - n.s) / (n.d + 1.4));
  }
  pose(a.nodes, t, still());
  const traces = settleLeaves(a, t);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  drawBranches(a, false);
  const shown = [];
  for (const l of a.leaves) {
    if (l.open <= 0.01) { l.g = null; continue; }
    l.g = leafGeom(a, l, t, still());
    shown.push(l);
  }
  shown.sort((x, y) => y.g.z - x.g.z);
  for (const l of shown) {
    const far = Math.max(0, l.g.z / a.reach);
    if (l.sev) {
      const strong = STRONG.has(l.sev);
      drawLeaf(l.g, strong ? C.accent : C.paper, C.accent, strong ? 0.8 : 1.3);
      const k = (t - l.found) / POP;
      if (k > 0 && k < 1) {
        ctx.beginPath();
        ctx.arc(l.g.mx, l.g.my, 4 + 24 * ease(k), 0, TAU);
        ctx.globalAlpha = 0.9 * (1 - k);
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    } else if (l.active) {
      drawLeaf(l.g, C.paper, C.ink, 1.2);
      ctx.beginPath();
      ctx.arc(l.g.mx, l.g.my, 7 + 2 * Math.sin(t * 6 + l.phase), 0, TAU);
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    else {
      const base = l.dismissed ? C.mid : l.read ? C.light : C.faint;
      const toward = l.flash > l.fresh ? C.ink : C.mid;
      drawLeaf(l.g, C.paper, tint(base, toward, Math.max(l.flash, l.fresh * 0.8), far), 0.8);
    }
  }
  drawBranches(a, true);
  drawTraces(a, traces);
  const focus = hovered || pinned;
  if (focus?.g) drawFocus(a, focus);
  drawCaption(a, t);
  drawNotes(a, t);
}

const data = new Map();
async function load(name) {
  if (!data.has(name)) {
    data.set(name, fetch(`${name}.json`).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${name}.json: ${r.status}`);
      return r.json();
    }).then(prepare));
  }
  return data.get(name);
}

let t0 = null, from = num('from', 0), stopped = 0, raf = 0, shown = true;
const T = () => (still() && !q.has('t') ? audit.settle
  : q.has('t') ? Number(q.get('t'))
    : t0 === null ? from : (performance.now() - t0) / 1000);
const live = () => shown && !document.hidden && t0 !== null && !still();

function pick(x, y) {
  let best = null, bd = 16;
  for (const l of audit.leaves) {
    if (!l.g || !l.sev) continue;
    const d = Math.hypot(l.g.mx - x, l.g.my - y);
    if (d < bd) { bd = d; best = l; }
  }
  return best;
}

let told = null;
function tell(l, x, y) {
  const tip = l ? { file: l.file, titles: l.titles, sev: l.sev, x, y, w: W, h: H } : null;
  const key = JSON.stringify(tip);
  if (key === told) return;
  told = key;
  parent.postMessage({ tip }, '*');
}

function hover() {
  if (!mouse || mouse.drag) { hovered = null; tell(null); return; }
  hovered = pick(mouse.x, mouse.y);
  tell(hovered, mouse.x, mouse.y);
  stage.style.cursor = hovered ? 'pointer' : 'grab';
}

function frame() {
  raf = 0;
  renderAt(T());
  if (mouse) hover();
  if (live() || moving) raf = requestAnimationFrame(frame);
  else stopped = performance.now();
}
function wake() {
  if (raf) return;
  if (stopped && t0 !== null) t0 += performance.now() - stopped;
  stopped = 0;
  raf = requestAnimationFrame(frame);
}

audit = await load(q.get('audit') ?? 'fider');
window.renderAt = renderAt;
window.CAPTURE = audit.settle;

if (q.has('hover')) {
  renderAt(T());
  pinned = audit.leafOf.get(q.get('hover')) ?? null;
}

if (still()) renderAt(T());
if (!q.has('t') && !capture) {
  if (!q.has('wait')) t0 = performance.now() - from * 1000;
  turn = orbit(stage, { yaw: [-Infinity, Infinity], pitch: [0, 0], inertia: reduce.matches ? 0 : 0.95 });
  stage.style.touchAction = 'pan-y';
  let down = null;
  const point = (e) => {
    const r = stage.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  stage.addEventListener('pointerdown', (e) => { down = point(e); });
  stage.addEventListener('pointermove', (e) => {
    mouse = point(e);
    if (down && e.buttons) mouse.drag = Math.hypot(mouse.x - down.x, mouse.y - down.y) > 4;
    hover();
    wake();
  });
  stage.addEventListener('pointerleave', () => {
    mouse = null;
    hovered = null;
    tell(null);
    wake();
  });
  stage.addEventListener('click', (e) => {
    const p = point(e), moved = down && Math.hypot(p.x - down.x, p.y - down.y) > 4;
    down = null;
    if (moved) return;
    const l = pick(p.x, p.y);
    pinned = l && l !== pinned ? l : null;
    tell(pinned, p.x, p.y);
    wake();
  });
  addEventListener('message', async (e) => {
    if (e.data === 'play') {
      if (t0 !== null) return;
      t0 = performance.now() - from * 1000;
      stopped = 0;
      return wake();
    }
    if (typeof e.data?.audit !== 'string') return;
    const next = await load(e.data.audit);
    if (next === audit) return;
    audit = next;
    hovered = pinned = null;
    tell(null);
    window.CAPTURE = audit.settle;
    const at = e.data.settled ? audit.settle : 0;
    if (t0 !== null) t0 = performance.now() - at * 1000;
    else from = at;
    stopped = 0;
    wake();
  });
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
  if (t0 === null) parent.postMessage('ready', '*');
  frame();
}
document.title = 'ready';
window.ready = true;
