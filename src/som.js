export function obterVolume() {
  try {
    const v = parseFloat(localStorage.getItem('vs_volume'));
    return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
  } catch { return 1; }
}

export function guardarVolume(vol) {
  try { localStorage.setItem('vs_volume', String(vol)); } catch {}
}

export function restaurarVolume(scene) {
  scene.sound.setVolume(obterVolume());
}
