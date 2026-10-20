// fx.js
export const scroll = { v: 0 };
export const clamp = (v) => Math.min(1, Math.max(0, v));

// Smooth cubic easing so scroll-scrubbed letters settle naturally instead of linearly
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;

const split = (el, cls, parts) => {
    if (!el) return [];
    const text = el.dataset.raw || el.textContent;
    el.dataset.raw = text;
    el.setAttribute("aria-label", text);
    el.innerHTML = "";
    return parts(text).map((p) => {
        const s = document.createElement("span");
        s.className = cls;
        s.setAttribute("aria-hidden", "true");
        s.innerHTML = cls === "ch" ? `<i>${p === " " ? "\u00A0" : p}</i>` : p;
        el.appendChild(s);
        return s;
    });
};

export const splitChars = (el) => split(el, "ch", (t) => [...t]);
export const splitWords = (el) => split(el, "w", (t) => t.split(/\s+/).filter(Boolean));

// e: enter 0..1, x: exit 0..1. Characters roll up with cubic easing and subtle 3D tilt.
export function roll(chars, e, x = 0) {
  const n = chars.length, k = 6;
  chars.forEach((c, i) => {
    const rawIn = clamp((e * (n + k) - i) / k);
    const rawOut = clamp((x * (n + k) - i) / k);
    const a = 1 - Math.pow(1 - rawIn, 3);
    const b = rawOut * rawOut * rawOut;
    const y = (1 - a) * 122 - b * 122;
    const rot = (1 - a) * 7 - b * 5;
    c.style.transform = `translate3d(0, ${y}%, 0) rotateZ(${rot}deg)`;
  });
}