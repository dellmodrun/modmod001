const VERTEX = `#version 300 es
void main() {
  gl_Position = vec4(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0,
    0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
precision highp isampler2D;
uniform sampler2D frame;
uniform isampler2D spans;
uniform ivec3 bg;
uniform int columns;
out vec4 ink;
float inked(int c, int r) {
  if (c >= columns) return 0.0;
  int x0 = texelFetch(spans, ivec2(c, 0), 0).r, x1 = texelFetch(spans, ivec2(c, 1), 0).r;
  int y0 = texelFetch(spans, ivec2(r, 2), 0).r, y1 = texelFetch(spans, ivec2(r, 3), 0).r;
  for (int y = y0; y < y1; y++) {
    for (int x = x0; x < x1; x++) {
      ivec3 d = abs(ivec3(round(texelFetch(frame, ivec2(x, y), 0).rgb * 255.0)) - bg);
      if (d.r + d.g + d.b > 24) return 1.0 / 255.0;
    }
  }
  return 0.0;
}
void main() {
  int c = int(gl_FragCoord.x) * 4, r = int(gl_FragCoord.y);
  ink = vec4(inked(c, r), inked(c + 1, r), inked(c + 2, r), inked(c + 3, r));
}`;

function compile(gl) {
  const program = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`ink shader: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

function target(gl, format, w, h) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, format, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fbo };
}

function spans(W, H, width, height) {
  const k = W / width, size = Math.max(width, height);
  const out = new Int32Array(size * 4);
  out.fill(H, size * 2, size * 3);
  for (let x = 0; x < W; x++) {
    const c = Math.min(width - 1, Math.floor(x / k));
    if (out[size + c] === 0) out[c] = x;
    out[size + c] = x + 1;
  }
  for (let y = 0; y < H; y++) {
    const r = Math.min(height - 1, Math.floor((H - 1 - y) / k));
    out[size * 2 + r] = Math.min(out[size * 2 + r], y);
    out[size * 3 + r] = y + 1;
  }
  return { out, size };
}

function scan(gl, W, H, width, height, [r, g, b]) {
  const px = new Uint32Array(W * H);
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(px.buffer));
  const k = W / width, bg = r | (g << 8) | (b << 16);
  const column = new Int32Array(W);
  for (let x = 0; x < W; x++) column[x] = Math.min(width - 1, Math.floor(x / k));
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < H; y++) {
    const row = Math.min(height - 1, Math.floor((H - 1 - y) / k)) * width;
    for (let x = 0, i = y * W; x < W; x++, i++) {
      const p = px[i];
      if ((p & 0xffffff) === bg) continue;
      if (Math.abs((p & 255) - r) + Math.abs(((p >>> 8) & 255) - g)
        + Math.abs(((p >>> 16) & 255) - b) > 24) ink[row + column[x]] = 1;
    }
  }
  return ink;
}

export function inkReader(gl) {
  let program = null;
  try {
    program = compile(gl);
  } catch (err) {
    console.warn(`Ink map: ${err.message}; reading the canvas whole instead`);
  }
  const vao = gl.createVertexArray();
  const at = Object.fromEntries(['frame', 'spans', 'bg', 'columns']
    .map((name) => [name, program && gl.getUniformLocation(program, name)]));
  const format = gl.getContextAttributes().alpha ? gl.RGBA8 : gl.RGB8;
  let size = '', frame, reduced, spanTex, pbo = null, blits = program ? null : false;

  function resize(W, H, width, height) {
    for (const t of [frame, reduced]) {
      if (!t) continue;
      gl.deleteTexture(t.tex);
      gl.deleteFramebuffer(t.fbo);
    }
    gl.deleteTexture(spanTex);
    frame = target(gl, format, W, H);
    reduced = target(gl, gl.RGBA8, Math.ceil(width / 4), height);
    const s = spans(W, H, width, height);
    spanTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, spanTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32I, s.size, 4);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
    gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, s.size, 4, gl.RED_INTEGER, gl.INT, s.out);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  function reduce(width, height, bg) {
    const w4 = Math.ceil(width / 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, reduced.fbo);
    gl.viewport(0, 0, w4, height);
    for (const cap of [gl.DEPTH_TEST, gl.STENCIL_TEST, gl.BLEND, gl.CULL_FACE,
      gl.SAMPLE_ALPHA_TO_COVERAGE, gl.POLYGON_OFFSET_FILL, gl.RASTERIZER_DISCARD]) gl.disable(cap);
    gl.colorMask(true, true, true, true);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frame.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, spanTex);
    gl.uniform1i(at.frame, 0);
    gl.uniform1i(at.spans, 1);
    gl.uniform3i(at.bg, ...bg);
    gl.uniform1i(at.columns, width);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const bytes = w4 * 4 * height;
    if (!pbo || pbo.bytes !== bytes) {
      if (pbo) gl.deleteBuffer(pbo.buffer);
      pbo = { buffer: gl.createBuffer(), bytes };
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo.buffer);
      gl.bufferData(gl.PIXEL_PACK_BUFFER, bytes, gl.STREAM_READ);
    }
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo.buffer);
    gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
    gl.readPixels(0, 0, w4, height, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const ready = () => gl.getSyncParameter(fence, gl.SYNC_STATUS) === gl.SIGNALED;
    const take = () => {
      const out = new Uint8Array(bytes);
      if (ready()) {
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo.buffer);
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, out);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      } else {
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, reduced.fbo);
        gl.pixelStorei(gl.PACK_ALIGNMENT, 4);
        gl.readPixels(0, 0, w4, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
      }
      gl.deleteSync(fence);
      if (w4 * 4 === width) return out;
      for (let r = 1; r < height; r++) out.copyWithin(r * width, r * w4 * 4, r * w4 * 4 + width);
      return out.subarray(0, width * height);
    };
    return { ready, take };
  }

  const done = (ink) => ({ ready: () => true, take: () => ink });

  return function start(width, height, bgHex) {
    const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight;
    const bg = [bgHex >> 16, (bgHex >> 8) & 255, bgHex & 255];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (blits === false) return done(scan(gl, W, H, width, height, bg));
    const key = [W, H, width, height].join();
    if (key !== size) {
      size = key;
      resize(W, H, width, height);
    }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, frame.fbo);
    gl.disable(gl.SCISSOR_TEST);
    if (blits === null) while (gl.getError() !== gl.NO_ERROR);
    gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    if (blits === null) {
      blits = gl.getError() === gl.NO_ERROR;
      if (!blits) {
        console.warn('Ink map: the canvas cannot be copied on the GPU; reading it whole instead');
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return done(scan(gl, W, H, width, height, bg));
      }
    }
    return reduce(width, height, bg);
  };
}
