// Ring buffer błysków absorpcji — doc-sprites zapisuje, neuron-points czyta
// (uniform uFlashes). Zero realokacji, zero przebudowy geometrii.
export const MAX_FLASHES = 4;

export interface FlashStore {
  data: Float32Array; // [x,y,z,age] * MAX_FLASHES — age rośnie 0→1
  cursor: number;
}

export function createFlashStore(): FlashStore {
  const data = new Float32Array(MAX_FLASHES * 4);
  // age=1 (wygasły)
  for (let i = 0; i < MAX_FLASHES; i++) data[i * 4 + 3] = 1;
  return { data, cursor: 0 };
}

export function pushFlash(store: FlashStore, x: number, y: number, z: number) {
  const o = store.cursor * 4;
  store.data[o] = x;
  store.data[o + 1] = y;
  store.data[o + 2] = z;
  store.data[o + 3] = 0;
  store.cursor = (store.cursor + 1) % MAX_FLASHES;
}

export function ageFlashes(store: FlashStore, dt: number) {
  for (let i = 0; i < MAX_FLASHES; i++) {
    const o = i * 4 + 3;
    if (store.data[o] < 1) store.data[o] = Math.min(1, store.data[o] + dt * 1.4);
  }
}
