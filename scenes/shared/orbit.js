const RATE = Math.PI / 180 * 0.3;
const INERTIA = 0.9;
const ZOOM_RATE = 0.0015;

export function orbit(stage, limits) {
  const rad = (d) => d * Math.PI / 180;
  const lim = { yaw: limits.yaw.map(rad), pitch: limits.pitch.map(rad), zoom: limits.zoom };
  const inertia = limits.inertia ?? INERTIA;
  const clamp = (v, [a, b]) => Math.min(b, Math.max(a, v));
  const view = { yaw: 0, pitch: 0, zoom: 1, changed: true };
  let drag = null, x = 0, y = 0, v = [0, 0];

  const turnBy = (dx, dy) => {
    const yaw = clamp(view.yaw + dx, lim.yaw), pitch = clamp(view.pitch + dy, lim.pitch);
    if (yaw !== view.yaw + dx) v[0] = 0;
    if (pitch !== view.pitch + dy) v[1] = 0;
    view.yaw = yaw;
    view.pitch = pitch;
    view.changed = true;
  };

  stage.style.touchAction = 'none';
  const rest = limits.cursor ?? 'grab';
  stage.style.cursor = rest;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || drag !== null) return;
    drag = e.pointerId;
    x = e.clientX;
    y = e.clientY;
    v = [0, 0];
    stage.setPointerCapture(e.pointerId);
    stage.style.cursor = 'grabbing';
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerId !== drag) return;
    v = [(e.clientX - x) * RATE, (e.clientY - y) * RATE];
    x = e.clientX;
    y = e.clientY;
    turnBy(...v);
  });
  const release = (e) => {
    if (e.pointerId !== drag) return;
    drag = null;
    stage.style.cursor = rest;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  if (lim.zoom) {
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * ZOOM_RATE), lim.zoom);
      view.changed = true;
    }, { passive: false });
  }

  view.update = () => {
    if (drag === null && (Math.abs(v[0]) > 1e-5 || Math.abs(v[1]) > 1e-5)) {
      v = [v[0] * inertia, v[1] * inertia];
      turnBy(...v);
    }
    const changed = view.changed;
    view.changed = false;
    return changed;
  };
  return view;
}
