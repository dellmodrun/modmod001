import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const loader = new GLTFLoader();
const deg = THREE.MathUtils.degToRad;

async function loadParts(url) {
  const gltf = await loader.loadAsync(url).catch((err) => {
    throw new Error(`${url}: ${err.message}`);
  });
  gltf.scene.updateMatrixWorld();
  const parts = new Map();
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', o.geometry.getAttribute('position').clone());
    g.setIndex(o.geometry.index.clone());
    g.applyMatrix4(o.matrixWorld);
    parts.set(o.name, g);
  });
  return parts;
}

const ROBOT_URL = 'assets/robot/orca_hand_left.glb';

const solid = (geos) => {
  const g = mergeGeometries(geos.map((x) => x.deleteAttribute('normal').deleteAttribute('uv')));
  return mergeVertices(g);
};
const box = ([w, h, d], [x, y, z]) => new THREE.BoxGeometry(w, h, d, 1, 1, Math.ceil(d / 5))
  .translate(x, y, z);
const rod = (r, a, b, segments) => {
  const [p, q] = [a, b].map((v) => new THREE.Vector3(...v));
  const d = q.clone().sub(p);
  return new THREE.CylinderGeometry(r, r, d.length(), segments, Math.ceil(d.length() / 5))
    .applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0),
      d.normalize()))
    .translate(...p.add(q).multiplyScalar(0.5).toArray());
};
const [WX, WY, WZ] = [-5, 1.877, -49.5];
const FOREARM = {
  'Forearm-rails': solid([-22, 22].map((x) => box([10, 6, 220], [WX + x, WY, WZ - 110]))),
  'Forearm-spacers': solid([0, 1, 2, 3].map((k) => box([58, 9, 2], [WX, WY, WZ - 25 - 45 * k]))),
  'Wrist-pivot': solid([rod(7, [WX - 40, WY, WZ], [WX + 40, WY, WZ], 24)]),
  'Spool-block': solid([box([30, 18, 24], [WX, WY, WZ - 190])]),
  'Tendon-rods': solid([-8, 0, 8].map((x) => rod(1, [WX + x, WY, WZ - 185], [WX + x, WY, WZ], 8))),
};
const WRIST_FLEX = -0.436;
const flex = new THREE.Matrix4().makeTranslation(WX, WY, WZ)
  .multiply(new THREE.Matrix4().makeRotationX(WRIST_FLEX))
  .multiply(new THREE.Matrix4().makeTranslation(-WX, -WY, -WZ));
for (const g of Object.values(FOREARM)) g.applyMatrix4(flex);
const ELBOW = new THREE.Vector3(WX, WY, WZ - 100).applyMatrix4(flex);

const finger = (key, [ap, pp, ip], { pos, quat, abd, mcp, pip }) => ({
  pos, quat, joint: [`${key}-abd`, [0, 0, -1], abd], meshes: [ap],
  children: [{
    pos: mcp, quat: [Math.SQRT1_2, 0, Math.SQRT1_2, 0], joint: [`${key}-mcp`, [0, 1, 0]],
    meshes: [pp],
    children: [{ pos: pip, joint: [`${key}-pip`, [0, 1, 0]], meshes: [ip] }],
  }],
});

const ORCA = {
  meshes: ['L-Carpals_CORE', 'L-Carpals_wrist', ...Object.keys(FOREARM)],
  children: [
    {
      pos: [21.213, 14.332, -21.725], quat: [0.659119, 0.359511, 0.072473, 0.656553],
      joint: ['t-cmc', [0, 0, 1], [0, 0, 3.85]], meshes: ['T-TP-L'],
      children: [{
        pos: [36, 0, 0], quat: [0.819152, -0.573576, 0, 0],
        joint: ['t-abd', [0, -0.34202, -0.939693], [-28, 0, 0]], meshes: ['L-T-AP'],
        children: [{
          quat: [0, 0.707107, 0, 0.707107], joint: ['t-mcp', [0, 1, 0]], meshes: ['T-PP_PP'],
          children: [{ pos: [-1, 0, 32], joint: ['t-pip', [0, 1, 0]], meshes: ['T-DP_T-DP'] }],
        }],
      }],
    },
    finger('i', ['I-AP-L', 'I-PP_PP', 'I-IP_IP'], {
      pos: [25.575, 0.681, 38.357], quat: [0.519647, 0.566724, -0.43173, 0.471593],
      abd: [-18.75, 0, 1], mcp: [0.401, 0, 0], pip: [-1.5, 0, 37],
    }),
    finger('m', ['M-AP', 'M-PP_PP', 'M-IP_IP'], {
      pos: [0.757, -1.146, 48.252], quat: [-0.500654, -0.500654, 0.499345, -0.499345],
      abd: [-19.25, 0, 1], mcp: [0.617, 0, 0], pip: [-2, 0, 40],
    }),
    finger('r', ['M-AP', 'M-PP_PP', 'M-IP_IP'], {
      pos: [-23.005, -0.101, 40.851], quat: [-0.485171, -0.438492, 0.554729, -0.514401],
      abd: [-19.25, 0, 1], mcp: [0.617, 0, 0], pip: [-2, 0, 40],
    }),
    finger('p', ['P-AP', 'P-PP_PP', 'P-IP_IP'], {
      pos: [-46.669, 5.001, 29.101], quat: [-0.457318, -0.340199, 0.613869, -0.546159],
      abd: [-17.75, 0, 1], mcp: [0, 0, 0], pip: [-1, 0, 31],
    }),
  ],
};

function buildBody(spec, geos, meshes, joints, pose) {
  const body = new THREE.Group();
  if (spec.pos) body.position.fromArray(spec.pos);
  if (spec.quat) {
    const [w, x, y, z] = spec.quat;
    body.quaternion.set(x, y, z, w).normalize();
  }
  let inner = body;
  if (spec.joint) {
    const [name, axis, at = [0, 0, 0]] = spec.joint;
    const pivot = new THREE.Group();
    const joint = {
      pivot, axis: new THREE.Vector3(...axis).normalize(), rest: deg(pose[name] ?? 0),
    };
    joints[name] = joint;
    pivot.position.fromArray(at);
    pivot.quaternion.setFromAxisAngle(joint.axis, joint.rest);
    inner = new THREE.Group();
    inner.userData.joint = name;
    inner.position.fromArray(at).negate();
    pivot.add(inner);
    body.add(pivot);
  }
  for (const file of spec.meshes ?? []) {
    if (!geos[file]) throw new Error(`${ROBOT_URL} has no part named ${file}`);
    const mesh = new THREE.Mesh(geos[file]);
    mesh.name = file;
    mesh.userData = { layer: 'mech' };
    inner.add(mesh);
    meshes.push(mesh);
  }
  for (const child of spec.children ?? []) inner.add(buildBody(child, geos, meshes, joints, pose));
  return body;
}

const WRIST = new THREE.Vector3(WX, WY, WZ);

export async function loadRobot(pose) {
  const geos = { ...Object.fromEntries(await loadParts(ROBOT_URL)), ...FOREARM };
  const meshes = [];
  const joints = {};
  const model = new THREE.Group();
  model.add(buildBody(ORCA, geos, meshes, joints, pose));
  const m = new THREE.Matrix4().set(0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1);
  model.quaternion.setFromRotationMatrix(m);
  model.updateMatrixWorld(true);
  const setPose = (angles) => {
    for (const [name, a] of Object.entries(angles)) {
      const j = joints[name];
      if (!j) throw new Error(`robot pose: no hinge named ${name}`);
      j.rest = deg(a);
      j.pivot.quaternion.setFromAxisAngle(j.axis, j.rest);
    }
    model.updateMatrixWorld(true);
  };
  return {
    model, meshes, joints, wrist: WRIST.clone().applyMatrix4(model.matrixWorld), tip: 'I-IP_IP',
    elbow: ELBOW.clone().applyMatrix4(model.matrixWorld), setPose,
  };
}

const HUMAN_RIG = 'assets/human/human-rig.glb';
const LIGAMENT_RIG = 'assets/human-zanatomy/ligaments-rig.glb';
const HUMAN = [
  ['carpal', ['FMA24435', 'FMA24437', 'FMA24439', 'FMA24441', 'FMA24443', 'FMA23725', 'FMA24446',
    'FMA24448']],
  ['metacarpal', ['FMA24464', 'FMA24466', 'FMA24468', 'FMA24470', 'FMA24472']],
  ['phalanx', ['FMA24450', 'FMA24451', 'FMA24452', 'FMA24453', 'FMA24454', 'FMA24455',
    'FMA24456', 'FMA24457', 'FMA24458', 'FMA24459', 'FMA24460', 'FMA24461', 'FMA24462',
    'FMA24463']],
  ['skin', ['FMA7163']],
  ['tendon', ['FMA38638', 'FMA38640', 'FMA38479', 'FMA40120']],
  ['forearm', ['FMA23464', 'FMA23467']],
  ['ligament', ['Collateral_metacarpophalangeal_ligaments',
    'Collateral_interphalangeal_ligaments_of_hand', 'Deep_transverse_metacarpal_ligament']],
];
const SPREAD = { 2: 0.5, 4: 1, 5: 2 };
const FINGERS = [[2, 'index'], [3, 'middle'], [4, 'ring'], [5, 'little']];

async function loadRig(url) {
  const gltf = await loader.loadAsync(url).catch((err) => {
    throw new Error(`${url}: ${err.message}`);
  });
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const skinned = new Map();
  let armature = null;
  root.traverse((o) => {
    if (o.isSkinnedMesh) skinned.set(o.name, o);
    if (o.userData.rig) armature = o;
  });
  if (!armature) throw new Error(`${url}: no armature with rig extras`);
  const meta = JSON.parse(armature.userData.rig);
  const toArm = armature.matrixWorld.clone().invert();
  const bones = new Map();
  const rot = new THREE.Quaternion();
  armature.traverse((o) => {
    const entry = meta.bones[o.userData.name];
    if (!o.isBone || !entry) return;
    new THREE.Matrix4().multiplyMatrices(toArm, o.matrixWorld).decompose(new THREE.Vector3(), rot,
      new THREE.Vector3());
    rot.invert();
    bones.set(o.userData.name, {
      bone: o, entry, rest: o.quaternion.clone(),
      axis: new THREE.Vector3(...entry.axis).applyQuaternion(rot).normalize(),
      palm: new THREE.Vector3(...meta.palm).applyQuaternion(rot).normalize(),
    });
  });
  return { root, skinned, bones };
}

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
function poseRig(rig, pose) {
  const [cmc, abduct, mcp, ip] = pose.thumb;
  const targets = { carpus: pose.wrist, 'r1.0': cmc, 'r1.1': mcp, 'r1.2': ip };
  for (const [ray, key] of FINGERS) {
    pose[key].forEach((a, k) => { targets[`r${ray}.${k + 1}`] = a; });
  }
  for (const [name, target] of Object.entries(targets)) {
    const b = rig.bones.get(name);
    if (!b) throw new Error(`human rig: no bone named ${name}`);
    qa.setFromAxisAngle(b.axis, deg(target - b.entry.rest));
    let turn = 0;
    if (name === 'r1.0') turn = -b.entry.toward * abduct;
    else if (name === 'carpus') turn = b.entry.ulnar * pose.deviation;
    else if (b.entry.toward) turn = -b.entry.toward * SPREAD[name[1]] * pose.spread;
    if (turn) qa.premultiply(qb.setFromAxisAngle(b.palm, deg(turn)));
    b.bone.quaternion.copy(b.rest).multiply(qa);
  }
  rig.root.updateMatrixWorld(true);
}

const sv = new THREE.Vector3(), sw = new THREE.Vector3(), sm = new THREE.Matrix4();
function skinInto(skinnedMesh, geo) {
  const { skeleton, bindMatrix, bindMatrixInverse, matrixWorld } = skinnedMesh;
  skeleton.update();
  const bm = skeleton.boneMatrices;
  const rest = skinnedMesh.geometry.attributes.position;
  const si = skinnedMesh.geometry.attributes.skinIndex;
  const ws = skinnedMesh.geometry.attributes.skinWeight;
  const out = geo.attributes.position.array;
  sm.multiplyMatrices(matrixWorld, bindMatrixInverse);
  for (let i = 0; i < rest.count; i++) {
    sv.fromBufferAttribute(rest, i).applyMatrix4(bindMatrix);
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 4; k++) {
      const w = ws.getComponent(i, k);
      if (!w) continue;
      const e = si.getComponent(i, k) * 16;
      x += w * (bm[e] * sv.x + bm[e + 4] * sv.y + bm[e + 8] * sv.z + bm[e + 12]);
      y += w * (bm[e + 1] * sv.x + bm[e + 5] * sv.y + bm[e + 9] * sv.z + bm[e + 13]);
      z += w * (bm[e + 2] * sv.x + bm[e + 6] * sv.y + bm[e + 10] * sv.z + bm[e + 14]);
    }
    sw.set(x, y, z).applyMatrix4(sm).toArray(out, i * 3);
  }
  geo.attributes.position.needsUpdate = true;
}

function skinRelax(source) {
  const { skinIndex: si, skinWeight: sw } = source.geometry.attributes;
  const ray = source.skeleton.bones.map((b) => b.userData.name?.match(/^r(\d)\./)?.[1] ?? b.name);
  const near = Array.from({ length: si.count }, () => new Set());
  const index = source.geometry.index.array;
  for (let f = 0; f < index.length; f += 3) {
    for (let k = 0; k < 3; k++) {
      const a = index[f + k], b = index[f + (k + 1) % 3];
      near[a].add(b);
      near[b].add(a);
    }
  }
  const zone = [], weight = [], start = [0], list = [];
  for (let i = 0; i < si.count; i++) {
    const share = {};
    for (let k = 0; k < 4; k++) {
      const r = ray[si.getComponent(i, k)];
      share[r] = (share[r] ?? 0) + sw.getComponent(i, k);
    }
    const second = Object.values(share).sort((x, y) => y - x)[1] ?? 0;
    if (!second) continue;
    zone.push(i);
    weight.push(Math.min(1, second / 0.25));
    list.push(...near[i]);
    start.push(list.length);
  }
  return {
    zone: Uint32Array.from(zone), weight: Float32Array.from(weight),
    start: Uint32Array.from(start), list: Uint32Array.from(list),
    tmp: new Float32Array(zone.length * 3),
  };
}

function relax(geo, { zone, weight, start, list, tmp }) {
  const pos = geo.attributes.position.array;
  for (let it = 0; it < 20; it++) {
    const k = it % 2 ? -0.53 : 0.5;
    for (let z = 0; z < zone.length; z++) {
      const i = zone[z] * 3, n = start[z + 1] - start[z];
      let x = 0, y = 0, sz = 0;
      for (let j = start[z]; j < start[z + 1]; j++) {
        const o = list[j] * 3;
        x += pos[o]; y += pos[o + 1]; sz += pos[o + 2];
      }
      const f = weight[z] * k;
      tmp[z * 3] = pos[i] + f * (x / n - pos[i]);
      tmp[z * 3 + 1] = pos[i + 1] + f * (y / n - pos[i + 1]);
      tmp[z * 3 + 2] = pos[i + 2] + f * (sz / n - pos[i + 2]);
    }
    for (let z = 0; z < zone.length; z++) {
      pos[zone[z] * 3] = tmp[z * 3];
      pos[zone[z] * 3 + 1] = tmp[z * 3 + 1];
      pos[zone[z] * 3 + 2] = tmp[z * 3 + 2];
    }
  }
}

export async function loadHuman(pose) {
  const rigs = await Promise.all([HUMAN_RIG, LIGAMENT_RIG].map(loadRig));
  const skins = [];
  const meshes = HUMAN.flatMap(([layer, names]) => names.map((name) => {
    const source = rigs.map((r) => r.skinned.get(name)).find(Boolean);
    if (!source) throw new Error(`${HUMAN_RIG} and ${LIGAMENT_RIG} have no part named ${name}`);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', source.geometry.attributes.position.clone());
    geo.setIndex(source.geometry.index.clone());
    const mesh = new THREE.Mesh(geo);
    mesh.name = name;
    mesh.userData = { layer };
    skins.push([source, geo, layer === 'skin' ? skinRelax(source) : null]);
    return mesh;
  }));
  const setPose = (next) => {
    for (const rig of rigs) poseRig(rig, next);
    for (const [source, geo, smooth] of skins) {
      skinInto(source, geo);
      if (smooth) relax(geo, smooth);
    }
  };
  setPose(pose);
  const model = new THREE.Group();
  for (const m of meshes) model.add(m);
  const m = new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1);
  model.quaternion.setFromRotationMatrix(m);
  model.updateMatrixWorld(true);
  const radius = new THREE.Box3().setFromBufferAttribute(
    meshes.find((x) => x.name === 'FMA23464').geometry.attributes.position);
  const wrist = radius.getCenter(new THREE.Vector3()).setZ(radius.min.z)
    .applyMatrix4(model.matrixWorld);
  const elbow = radius.getCenter(new THREE.Vector3()).applyMatrix4(model.matrixWorld);
  return { model, meshes, wrist, elbow, tip: 'FMA24460', setPose };
}
