import { project, edgesOf, outline } from './outline.js';

let hands = [];

onmessage = ({ data }) => {
  if (data.geometry) {
    hands = data.geometry.map((meshes) => meshes.map(({ positions, index }) => ({
      positions, ...edgesOf(index, positions.length / 3),
    })));
    return;
  }
  const cols = data.poses.map((pose, h) => outline(hands[h].map((m, i) => ({
    ...project(m.positions, pose.matrices[i], pose.inverse, pose.place, pose.plane),
    pairs: m.pairs, ways: m.ways,
  }))));
  postMessage({ id: data.id, cols }, cols.flatMap((c) => [c.lo.buffer, c.hi.buffer]));
};
