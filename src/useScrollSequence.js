import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { frameAt } from "./frameMap";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const TOTAL = 300;
const MOBILE = window.matchMedia("(max-width: 767px)").matches;
const STEP = MOBILE ? 2 : 1;
const url = (n) => `/frames/${MOBILE ? "m" : "d"}/${String(n).padStart(4, "0")}.webp`;

export function useScrollSequence(canvasRef, containerRef, onFrame) {
  useGSAP(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cache = new Map();
    let target = 1, shown = 1, drawn = -1;

    const load = async (n) => {
      if (n < 1 || n > TOTAL || (n - 1) % STEP || cache.has(n)) return;
      cache.set(n, null); // reserve the spot
      const blob = await (await fetch(url(n))).blob();
      cache.set(n, await createImageBitmap(blob));
    };

    const nearest = (n) => {
      for (let d = 0; d < TOTAL; d++)
        for (const k of [n - d, n + d]) if (cache.get(k)) return cache.get(k);
    };

    const prefetch = (f) => {
      for (let n = f - 20; n <= f + 40; n++) load(n);
      for (const [n, bmp] of cache)
        if (bmp && (n < f - 60 || n > f + 80)) { bmp.close(); cache.delete(n); }
    };

    // Inside useScrollSequence.js -> replace the draw() function (lines 37-49):
    const draw = () => {
      shown += (target - shown) * 0.18; // smooth easing
      const f = Math.round(shown);
      if (f === drawn) return;
      const bmp = nearest(f);
      if (!bmp) return;
      drawn = f;
      onFrame?.(f);

      // Use Math.max instead of Math.min so the frame covers 100% of width & height
      const s = Math.max(canvas.width / bmp.width, canvas.height / bmp.height);
      const w = bmp.width * s, h = bmp.height * s;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      drawn = -1; // force redraw
    };

    resize(); window.addEventListener("resize", resize);
    for (let n = 1; n <= 31; n++) load(n); // Preload first act instantly

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { target = frameAt(self.progress); prefetch(Math.round(target)); },
    });

    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw); window.removeEventListener("resize", resize);
      cache.forEach((b) => b?.close()); cache.clear();
    };
  }, { scope: containerRef });
}