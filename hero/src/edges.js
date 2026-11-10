import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export const palette = {
  ink: new THREE.Color(), light: new THREE.Color(),
  faint: new THREE.Color(), accent: new THREE.Color(),
};

export function lineMaterial({ tone, msaa }) {
  const m = new LineMaterial({
    color: palette[tone], linewidth: 1, worldUnits: false, alphaToCoverage: msaa,
  });
  m.userData = { tone };
  m.depthWrite = false;
  return m;
}

export function depthMaterial(offset = 1) {
  return new THREE.MeshBasicMaterial({
    colorWrite: false, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: offset, polygonOffsetUnits: offset,
  });
}

export function creaseLines(geo, angle, material, rims = true) {
  const { pos, normals: n, edges, open } = adjacency(geo);
  const cos = Math.cos(THREE.MathUtils.degToRad(angle));
  const out = [];
  const put = (u, v) => out.push(pos[u * 3], pos[u * 3 + 1], pos[u * 3 + 2],
    pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
  for (let e = 0; e < edges.length; e += 4) {
    const f = edges[e + 2] * 3, g = edges[e + 3] * 3;
    const dot = n[f] * n[g] + n[f + 1] * n[g + 1] + n[f + 2] * n[g + 2];
    const len = Math.hypot(n[f], n[f + 1], n[f + 2]) * Math.hypot(n[g], n[g + 1], n[g + 2]);
    if (dot <= cos * len) put(edges[e], edges[e + 1]);
  }
  for (let e = 0; rims && e < open.length; e += 2) put(open[e], open[e + 1]);
  return new LineSegments2(new LineSegmentsGeometry().setPositions(out), material);
}

const adjCache = new WeakMap();
function adjacency(geo) {
  if (!adjCache.has(geo)) adjCache.set(geo, buildAdjacency(geo));
  return adjCache.get(geo);
}

function faceNormals(pos, idx, out) {
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let f = 0; f < idx.length / 3; f++) {
    a.fromArray(pos, idx[f * 3] * 3);
    b.fromArray(pos, idx[f * 3 + 1] * 3).sub(a);
    c.fromArray(pos, idx[f * 3 + 2] * 3).sub(a);
    b.cross(c).toArray(out, f * 3);
  }
  return out;
}

export function refreshAdjacency(geo) {
  const adj = adjCache.get(geo);
  if (adj) faceNormals(adj.pos, geo.index.array, adj.normals);
}

function buildAdjacency(geo) {
  const pos = geo.attributes.position.array;
  const idx = geo.index.array;
  const faces = idx.length / 3;
  const normals = faceNormals(pos, idx, new Float32Array(faces * 3));
  const open = new Map();
  const edges = [];
  for (let f = 0; f < faces; f++) {
    const i0 = idx[f * 3], i1 = idx[f * 3 + 1], i2 = idx[f * 3 + 2];
    for (const [u, v] of [[i0, i1], [i1, i2], [i2, i0]]) {
      const key = u < v ? u * 4194304 + v : v * 4194304 + u;
      const other = open.get(key);
      if (other === undefined) open.set(key, f);
      else { edges.push(u, v, other, f); open.delete(key); }
    }
  }
  const unpaired = [...open.keys()].flatMap((key) => [Math.floor(key / 4194304), key % 4194304]);
  return {
    pos, normals, edges: Int32Array.from(edges), open: unpaired, facing: new Uint8Array(faces),
  };
}

const view = new THREE.Vector3();
const unit = new THREE.Vector3();
const inv = new THREE.Matrix3();
const REBASE = Math.cos(THREE.MathUtils.degToRad(12));
const STEADY = Math.sin(THREE.MathUtils.degToRad(12.5));

function candidates({ normals, edges }, axis) {
  const state = new Int8Array(normals.length / 3);
  for (let f = 0; f < state.length; f++) {
    const nx = normals[f * 3], ny = normals[f * 3 + 1], nz = normals[f * 3 + 2];
    const len = Math.hypot(nx, ny, nz);
    const c = len ? (nx * axis.x + ny * axis.y + nz * axis.z) / len : 0;
    state[f] = c > STEADY ? 1 : c < -STEADY ? -1 : 0;
  }
  const picked = [], used = new Uint8Array(state.length);
  for (let e = 0; e < edges.length; e += 4) {
    const a = state[edges[e + 2]], b = state[edges[e + 3]];
    if (a !== 0 && a === b) continue;
    picked.push(e);
    used[edges[e + 2]] = 1;
    used[edges[e + 3]] = 1;
  }
  const faces = [];
  for (let f = 0; f < used.length; f++) if (used[f]) faces.push(f);
  return { axis: axis.clone(), edges: Int32Array.from(picked), faces: Int32Array.from(faces) };
}

export class Silhouette {
  constructor(mesh, materialsList) {
    this.adj = adjacency(mesh.geometry);
    this.mesh = mesh;
    this.lastView = new THREE.Vector3(NaN, NaN, NaN);
    this.near = null;
    const cap = this.adj.edges.length / 4;
    this.geometry = new LineSegmentsGeometry().setPositions(new Float32Array(cap * 6));
    this.lines = materialsList.map((m) => {
      const line = new LineSegments2(this.geometry, m);
      line.frustumCulled = false;
      mesh.add(line);
      return line;
    });
  }

  invalidate() {
    this.lastView.setScalar(NaN);
    this.near = null;
  }

  update() {
    inv.setFromMatrix4(this.mesh.matrixWorld).invert();
    view.set(0, 0, 1).applyMatrix3(inv);
    if (view.equals(this.lastView)) return;
    this.lastView.copy(view);
    unit.copy(view).normalize();
    if (!this.near || unit.dot(this.near.axis) < REBASE) this.near = candidates(this.adj, unit);
    const { pos, normals, edges, facing } = this.adj;
    const { faces, edges: near } = this.near;
    const { x, y, z } = view;
    for (let k = 0; k < faces.length; k++) {
      const f = faces[k];
      facing[f] = normals[f * 3] * x + normals[f * 3 + 1] * y + normals[f * 3 + 2] * z > 0 ? 1 : 0;
    }
    const start = this.geometry.attributes.instanceStart.data;
    const out = start.array;
    let n = 0;
    for (let k = 0; k < near.length; k++) {
      const e = near[k];
      if (facing[edges[e + 2]] === facing[edges[e + 3]]) continue;
      const u = edges[e] * 3, v = edges[e + 1] * 3, o = n * 6;
      out[o] = pos[u]; out[o + 1] = pos[u + 1]; out[o + 2] = pos[u + 2];
      out[o + 3] = pos[v]; out[o + 4] = pos[v + 1]; out[o + 5] = pos[v + 2];
      n++;
    }
    start.clearUpdateRanges(); start.addUpdateRange(0, n * 6); start.needsUpdate = true;
    this.geometry.instanceCount = n;
  }
}
