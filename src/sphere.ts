/**
 * Планета из плиток: распределение Фибоначчи по сфере, CSS 3D без WebGL.
 * Крутится сама и от перетаскивания. Плитки, попавшие на заголовок в центре,
 * тают и размываются — так в сфере открывается окно под текст. Задняя половина не рисуется.
 */
export type Tile = { el: HTMLElement; ratio: number };
export type SphereOptions = { count: number; radius: number; tile: number; perspective: number; tilt?: number; make: (i: number) => Tile; head?: HTMLElement; blur?: boolean };

export function mountSphere(host: HTMLElement, o: SphereOptions) {
  const { count: N, radius: R, tile: TILE, perspective: PERSP, tilt = -12, make, head, blur = true } = o;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  host.classList.add('sphere'); host.style.perspective = `${PERSP}px`;
  const globe = document.createElement('div'); globe.className = 'sphere__globe'; host.append(globe);

  const pos = Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / N, phi = Math.asin(y), theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return { lat: (phi * 180) / Math.PI, lon: ((theta * 180) / Math.PI) % 360 };
  });
  const tiles: HTMLElement[] = [], ratios: number[] = [];
  for (let i = 0; i < N; i++) {
    const { el, ratio } = make(i); const w = TILE * (ratio < 1 ? 0.78 : 1), h = w / ratio;
    const t = document.createElement('div'); t.className = 'sphere__tile';
    Object.assign(t.style, { width: `${w}px`, height: `${h}px`, marginLeft: `${-w / 2}px`, marginTop: `${-h / 2}px`, transform: `rotateY(${pos[i].lon}deg) rotateX(${-pos[i].lat}deg) translateZ(${R}px)` });
    t.append(el); globe.append(t); tiles.push(t); ratios.push(ratio);
  }

  const st = { rot: 0, vel: 0, drag: false, x: 0 };
  let hw = 300, hh = 60;
  const measure = () => { const r = head?.getBoundingClientRect(); if (r) { hw = r.width / 2 + 24; hh = r.height / 2 + 20; } };
  measure(); const ro = new ResizeObserver(measure); if (head) ro.observe(head);
  const prevO: string[] = new Array(N).fill(''), prevF: string[] = new Array(N).fill('');
  const paint = () => {
    const rot = st.rot; globe.style.transform = `rotateX(${tilt}deg) rotateY(${rot}deg)`;
    const tr = (rot * Math.PI) / 180, tx = (tilt * Math.PI) / 180;
    for (let i = 0; i < N; i++) {
      const t = tiles[i]; const lat = (pos[i].lat * Math.PI) / 180, lon = (pos[i].lon * Math.PI) / 180;
      let x = Math.cos(lat) * Math.sin(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon);
      const x1 = x * Math.cos(tr) + z * Math.sin(tr), z1 = -x * Math.sin(tr) + z * Math.cos(tr); x = x1; z = z1;
      const y1 = y * Math.cos(tx) - z * Math.sin(tx), z2 = y * Math.sin(tx) + z * Math.cos(tx); y = y1; z = z2;
      if (z < -0.05) { t.style.visibility = 'hidden'; continue; }
      t.style.visibility = 'visible';
      const k = PERSP / (PERSP - z * R), sx = x * R * k, sy = y * R * k;
      const tw = (TILE * k * (ratios[i] < 1 ? 0.78 : 1)) / 2, th = tw / ratios[i];
      const gap = Math.max(Math.max(0, Math.abs(sx) - (hw + tw)), Math.max(0, Math.abs(sy) - (hh + th)));
      const win = Math.max(0, Math.min(1, 1 - gap / 48)); // пересечение с заголовком
      const edge = Math.max(0, Math.min(1, z / 0.25));     // края сферы мягко уходят
      const os = ((1 - win) * (0.25 + 0.75 * edge)).toFixed(2); if (os !== prevO[i]) { t.style.opacity = os; prevO[i] = os; }
      const f = blur && win > 0.05 ? `blur(${Math.round(win * 6) * 2}px)` : 'none'; if (f !== prevF[i]) { t.style.filter = f; prevF[i] = f; }
    }
  };
  paint();
  let raf = 0, last = 0, running = true, visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) last = 0; }); io.observe(host);
  const tick = (now: number) => {
    if (!running) return;
    if (visible) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; last = now;
      if (!st.drag) { if (Math.abs(st.vel) > 0.5) { st.rot += st.vel * dt; st.vel *= 0.94; } else st.rot += 4 * dt; }
      paint();
    }
    raf = requestAnimationFrame(tick);
  };
  if (!reduced) raf = requestAnimationFrame(tick);
  const down = (e: PointerEvent) => { st.drag = true; st.x = e.clientX; st.vel = 0; host.setPointerCapture?.(e.pointerId); };
  const move = (e: PointerEvent) => { if (!st.drag) return; const d = (e.clientX - st.x) * 0.25; st.x = e.clientX; st.rot += d; st.vel = d * 60; };
  const up = () => { st.drag = false; };
  host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move); host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); host.replaceChildren(); };
}
