// SpecConfigurator.jsx
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

const LABELS = ["Dry", "Wet", "Track", "Off-road", "Comfort", "Acoustic"];
const VARIANTS = {
  Sport: { color: "#F4C20D", specs: "19 / 20 / 21 inch, Y rated, 300+ km/h", ratings: [99, 86, 96, 20, 68, 72] },
  Tour: { color: "#8FD3B6", specs: "18 / 19 / 20 inch, W rated, 270 km/h", ratings: [88, 97, 74, 30, 95, 94] },
  Terra: { color: "#E07B39", specs: "18 / 20 inch, V rated, 240 km/h", ratings: [82, 92, 52, 98, 84, 80] },
};

const pt = (val, i, extra = 0) => {
  const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const r = (val / 100) * 40 + extra;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a), Math.cos(a)];
};
const points = (rs) => rs.map((v, i) => pt(v, i).slice(0, 2).join(",")).join(" ");

export function SpecConfigurator({ onVariant }) {
  const [key, setKey] = useState("Sport");
  const poly = useRef(null);
  const dotsRef = useRef([]);
  const numsRef = useRef([]);
  const currentRatings = useRef([...VARIANTS.Sport.ratings]);
  const v = VARIANTS[key];

  useEffect(() => {
    // 1. Morph polygon
    gsap.to(poly.current, {
      attr: { points: points(v.ratings) },
      duration: 0.75,
      ease: "expo.out",
    });

    // 2. Morph radar vertex dots and count numbers smoothly
    v.ratings.forEach((targetVal, i) => {
      const [cx, cy] = pt(targetVal, i);
      if (dotsRef.current[i]) {
        gsap.to(dotsRef.current[i], {
          attr: { cx, cy },
          duration: 0.75,
          ease: "expo.out",
        });
      }

      const proxy = { val: currentRatings.current[i] };
      gsap.to(proxy, {
        val: targetVal,
        duration: 0.65,
        ease: "power3.out",
        onUpdate: () => {
          currentRatings.current[i] = proxy.val;
          if (numsRef.current[i]) {
            numsRef.current[i].textContent = Math.round(proxy.val);
          }
        },
      });
    });

    onVariant?.(v.color);
  }, [key]);

  return (
    <aside className="spec" aria-label="Compare tyre variants">
      <div className="spec-tabs" role="group" aria-label="Variant">
        {Object.keys(VARIANTS).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={k === key}
            onClick={() => setKey(k)}
            className="disp"
          >
            {k}
          </button>
        ))}
      </div>
      <p className="spec-meta">{v.specs}</p>

      <svg viewBox="-24 -8 148 116" className="spec-radar" role="img" aria-label={`${key} ratings`}>
        {/* Axis spokes */}
        {LABELS.map((_, i) => {
          const [x, y] = pt(100, i);
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity=".1"
              strokeWidth=".35"
            />
          );
        })}
        {/* Concentric rings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((s) => (
          <polygon
            key={s}
            points={points(Array(6).fill(s * 100))}
            fill="none"
            stroke="currentColor"
            strokeOpacity=".15"
            strokeWidth=".4"
          />
        ))}
        {/* Data shape */}
        <polygon
          ref={poly}
          points={points(VARIANTS.Sport.ratings)}
          fill={v.color + "2E"}
          stroke={v.color}
          strokeWidth="1.25"
        />
        {/* Vertex nodes */}
        {VARIANTS.Sport.ratings.map((val, i) => {
          const [cx, cy] = pt(val, i);
          return (
            <circle
              key={i}
              ref={(el) => (dotsRef.current[i] = el)}
              cx={cx}
              cy={cy}
              r="1.6"
              fill={v.color}
            />
          );
        })}
        {/* Axis labels */}
        {LABELS.map((l, i) => {
          const [x, y, c] = pt(100, i, 7.5);
          return (
            <text
              key={l}
              x={x}
              y={y + 1.5}
              fontSize="4.2"
              fill="currentColor"
              fillOpacity=".65"
              textAnchor={c > 0.3 ? "start" : c < -0.3 ? "end" : "middle"}
            >
              {l}
            </text>
          );
        })}
      </svg>

      <dl className="spec-list">
        {LABELS.map((l, i) => (
          <div key={l}>
            <dt>{l}</dt>
            <dd ref={(el) => (numsRef.current[i] = el)}>{v.ratings[i]}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}