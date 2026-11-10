const ANGLE = [-180, 180, 0.1];
const JOINT = [-90, 120, 0.1];
const VIEW = ['tilt', 'yaw', 'lean', 'roll'];
const FIT = [['scale', [0.5, 5, 0.001]], ['x', [-0.5, 0.5, 0.001]], ['y', [-0.5, 0.5, 0.001]]];
const HUMAN_POSE = [
  ['wrist', 'wrist', null], ['deviation', 'deviation', null], ['spread', 'spread', null],
  ...['index', 'middle', 'ring', 'little'].flatMap((f) => ['MCP', 'PIP', 'DIP']
    .map((j, k) => [`${f} ${j}`, f, k])),
  ...['CMC flex', 'CMC abd', 'MCP', 'IP'].map((j, k) => [`thumb ${j}`, 'thumb', k]),
];

const CSS = `
.tuner {
  position: fixed; top: 0; right: 0; z-index: 10; width: 288px; max-height: 100vh;
  overflow: auto; box-sizing: border-box; padding: 8px 12px;
  background: color-mix(in srgb, var(--ink) 4%, var(--surface)); color: var(--mid);
  font: 10px/16px var(--mono); font-variation-settings: "MONO" 0.5;
  & summary { color: var(--ink); cursor: pointer; }
  & h3 { margin: 8px 0 0; font: inherit; color: var(--ink); }
  & label { display: grid; grid-template-columns: 88px 1fr 56px; gap: 6px; align-items: center; }
  & input[type=range] { width: 100%; margin: 0; accent-color: var(--ink); }
  & input[type=number] {
    width: 100%; box-sizing: border-box; font: inherit; color: var(--ink); text-align: right;
    background: var(--surface); border: 0; padding: 0 2px;
  }
  & .actions { display: flex; gap: 6px; margin-top: 8px; }
  & button {
    font: inherit; color: var(--ink); background: var(--surface); border: 0; border-radius: 4px;
    padding: 2px 8px; cursor: pointer;
  }
  & textarea {
    width: 100%; box-sizing: border-box; height: 120px; margin-top: 6px; font: inherit;
    color: var(--ink); background: var(--surface); border: 0; resize: vertical;
  }
}`;

export function mountTuner(shipped, apply) {
  let state = structuredClone(shipped);
  const narrow = matchMedia('(width < 960px)');
  const fitOf = (hand) => (narrow.matches ? state[hand].mobile.fit : state[hand].fit);
  document.head.insertAdjacentHTML('beforeend', `<style>${CSS}</style>`);
  const root = document.createElement('details');
  root.className = 'tuner';
  root.open = true;
  root.innerHTML = '<summary>Tune</summary>';
  document.body.append(root);

  let pending = false;
  const kick = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      root.dataset.ms = apply(state).toFixed(1);
    });
  };

  const rows = [];
  function row(parent, label, [min, max, coarse], get, set) {
    const decimals = String(get()).split('.')[1]?.length ?? 0;
    const step = Math.min(coarse, 10 ** -decimals);
    const el = document.createElement('label');
    el.innerHTML = `<span>${label}</span><input type="range"><input type="number">`;
    const [range, number] = el.querySelectorAll('input');
    for (const input of [range, number]) Object.assign(input, { min, max, step });
    const show = () => { range.value = number.value = get(); };
    const take = (input) => {
      const v = Number(input.value);
      if (!Number.isFinite(v)) return;
      set(v);
      show();
      kick();
    };
    range.addEventListener('input', () => take(range));
    number.addEventListener('change', () => take(number));
    show();
    rows.push(show);
    parent.append(el);
  }

  for (const hand of ['robot', 'human']) {
    const h3 = document.createElement('h3');
    h3.textContent = hand === 'robot' ? 'Robot' : 'Human';
    root.append(h3);
    for (const k of VIEW) {
      row(root, k, ANGLE, () => state[hand].view[k] ?? 0, (v) => { state[hand].view[k] = v; });
    }
    FIT.forEach(([label, range], i) => {
      row(root, label, range, () => fitOf(hand)[i], (v) => { fitOf(hand)[i] = v; });
    });
    if (hand === 'robot') {
      for (const k of Object.keys(state.robot.pose)) {
        row(root, k, JOINT, () => state.robot.pose[k], (v) => { state.robot.pose[k] = v; });
      }
    } else {
      for (const [label, k, i] of HUMAN_POSE) {
        const p = () => state.human.pose;
        row(root, label, JOINT, () => (i === null ? p()[k] : p()[k][i]), (v) => {
          if (i === null) p()[k] = v;
          else p()[k][i] = v;
        });
      }
    }
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.innerHTML = '<button type="button">Copy</button><button type="button">Reset</button>';
  const [copy, reset] = actions.querySelectorAll('button');
  const text = document.createElement('textarea');
  text.readOnly = true;
  text.spellcheck = false;
  root.append(actions, text);
  copy.addEventListener('click', () => {
    text.value = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(text.value)
      .catch((err) => console.warn(`Copying the tuning state failed: ${err.message}`));
  });
  narrow.addEventListener('change', () => { for (const show of rows) show(); });
  reset.addEventListener('click', () => {
    state = structuredClone(shipped);
    for (const show of rows) show();
    kick();
  });
}
