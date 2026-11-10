const BUDGET = 10;
let since = performance.now();

export async function breathe() {
  if (performance.now() - since < BUDGET) return;
  await (globalThis.scheduler?.yield?.() ?? new Promise((done) => setTimeout(done)));
  since = performance.now();
}

export async function weld(geometry, tolerance) {
  const names = Object.keys(geometry.attributes);
  if (names.length !== 1 || names[0] !== 'position') {
    throw new Error(`weld handles position-only geometry, got attributes ${names.join(', ')}`);
  }
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const count = index ? index.count : position.count;
  const scale = Math.pow(10, Math.log10(1 / tolerance)), shift = tolerance * 0.5 * scale;
  const key = (v) => Math.trunc(v * scale + shift);
  const seen = new Map(), welded = new Float32Array(position.count * 3), indices = [];
  for (let i = 0; i < count; i++) {
    if (i % 2048 === 0) await breathe();
    const at = index ? index.getX(i) : i;
    const x = position.getX(at), y = position.getY(at), z = position.getZ(at);
    const hash = `${key(x)},${key(y)},${key(z)},`;
    let next = seen.get(hash);
    if (next === undefined) {
      next = seen.size;
      seen.set(hash, next);
      welded[next * 3] = x;
      welded[next * 3 + 1] = y;
      welded[next * 3 + 2] = z;
    }
    indices.push(next);
  }
  const result = geometry.clone();
  result.setAttribute('position',
    new position.constructor(welded.slice(0, seen.size * 3), 3, position.normalized));
  result.setIndex(indices);
  return result;
}

export async function paced(list, fn) {
  const out = [];
  for (const [i, item] of list.entries()) {
    await breathe();
    out.push(await fn(item, i));
  }
  return out;
}
