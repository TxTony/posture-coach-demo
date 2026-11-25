// Dedicated inference worker: camera images stay on this device.
const base = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
let ort, session, bytes, provider, size, canvas, ctx, data, tensor;
function validate(output) {
  if (output.type !== 'float32' || output.dims.join(',') !== '1,300,57')
    throw Error('Format ONNX inattendu : ' + output.dims);
}
async function execute() {
  let outputs;
  try {
    outputs = await session.run({images: tensor});
    validate(outputs.output0);
    return new Float32Array(outputs.output0.data);
  } finally {
    if (outputs) for (const output of Object.values(outputs)) output.dispose();
  }
}
async function cpuFallback() {
  if (session) await session.release();
  session = await ort.InferenceSession.create(bytes, {executionProviders: ['wasm']});
  provider = 'WASM';
}
async function run() {
  try { return await execute(); }
  catch (error) {
    if (provider !== 'WebGPU') throw error;
    await cpuFallback();
    return await execute();
  }
}
async function init(message) {
  if (session) { await session.release(); session = null; }
  tensor?.dispose();
  ort ??= await import(base + 'ort.webgpu.min.mjs');
  ort.env.wasm.wasmPaths = base;
  ort.env.wasm.numThreads = 1;
  size = message.size;
  const response = await fetch(message.url);
  if (!response.ok) throw Error('Modèle HTTP ' + response.status);
  bytes = await response.arrayBuffer();
  if (message.mode === 'auto' && navigator.gpu) {
    try {
      session = await ort.InferenceSession.create(bytes, {executionProviders: ['webgpu']});
      provider = 'WebGPU';
    } catch { session = null; }
  }
  if (!session) await cpuFallback();
  canvas = new OffscreenCanvas(size, size);
  ctx = canvas.getContext('2d', {willReadFrequently: true});
  data = new Float32Array(3 * size * size);
  data.fill(114 / 255);
  tensor = new ort.Tensor('float32', data, [1, 3, size, size]);
  await run(); // Warm up and validate the actual model.
  return {provider, size};
}
function decode(a, geometry) {
  let row = -1, best = .5;
  for (let i = 0; i < 300; i++) {
    const j = i * 57;
    if (a[j + 5] === 0 && a[j + 4] > best) { best = a[j + 4]; row = j; }
  }
  if (row < 0) return null;
  const l = Array.from({length: 33}, () => ({x: 0, y: 0, visibility: 0}));
  for (const [target, source] of [[11,5],[12,6],[13,7],[14,8],[15,9],[16,10],[23,11],[24,12]]) {
    const j = row + 6 + source * 3;
    l[target] = {x: (a[j] - geometry.x) / geometry.w,
      y: (a[j + 1] - geometry.y) / geometry.h, visibility: a[j + 2]};
  }
  return l;
}
async function infer(bitmap) {
  const begin = performance.now();
  const vw = bitmap?.width || size, vh = bitmap?.height || size;
  const scale = Math.min(size / vw, size / vh);
  const w = Math.round(vw * scale), h = Math.round(vh * scale);
  const x = Math.floor((size - w) / 2), y = Math.floor((size - h) / 2);
  ctx.fillStyle = 'rgb(114,114,114)';
  ctx.fillRect(0, 0, size, size);
  if (bitmap) ctx.drawImage(bitmap, x, y, w, h);
  const rgba = ctx.getImageData(0, 0, size, size).data, n = size * size;
  for (let i = 0; i < n; i++) {
    data[i] = rgba[4*i] / 255; data[n+i] = rgba[4*i+1] / 255;
    data[2*n+i] = rgba[4*i+2] / 255;
  }
  const t = performance.now(), output = await run(), ms = performance.now() - t;
  return {landmarks: decode(output, {x,y,w,h}), ms, cycle: performance.now()-begin, provider, size};
}
self.onmessage = async ({data: message}) => {
  try {
    const result = message.type === 'init' ? await init(message) : await infer(message.bitmap);
    self.postMessage({id: message.id, result});
  } catch (error) {
    self.postMessage({id: message.id, error: error?.message || String(error)});
  } finally { message.bitmap?.close(); }
};
