// App.jsx
import { useRef, useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONTAINER_HEIGHT, SEGMENTS, TOTAL_VH } from "./frameMap";
import { useScrollSequence } from "./useScrollSequence";
import { Preloader, preloaderTimeline } from "./Preloader";
import { EditorialFooter } from "./EditorialFooter";
import { SpecConfigurator } from "./SpecConfigurator";
import { splitChars, splitWords, roll, clamp, scroll } from "./fx";

gsap.registerPlugin(ScrollTrigger);

// peakVh = exact vh offset where the chapter's headline is fully revealed when clicked from the rail
const ACTS = [
  { name: "Awakening", from: 1, peakFrame: 2, t: ["THE ANATOMY", "OF GRIP."], b: "", o: [14, 42] },
  { name: "Deconstruction", from: 46, peakFrame: 75, t: ["TAKEN", "APART."], b: "An aramid carcass, high-tension dual steel belts and a silica carbon compound, separated at the moment of peak explosion.", s: [3, 0, "layers", "Carcass, separated"], i: [48, 66], o: [96, 110] },
  { name: "Hydrodynamics", from: 111, peakFrame: 145, t: ["WATER,", "CLEARED."], b: "Deep channels move water out from under the contact patch before it can lift the tyre off the road.", s: [42, 0, "litres / sec", "Water evacuated"], i: [113, 135], o: [165, 180] },
  { name: "Apex heat", from: 181, peakFrame: 210, t: ["HEAT,", "HELD."], b: "Through the corner the compound shears hard and stays together. Grip is what remains when the heat has nowhere to go.", s: [1.4, 1, "g", "Lateral shear force"], i: [183, 205], o: [225, 240] },
  { name: "Variants", from: 241, peakFrame: 275, t: ["THREE", "TYRES."], b: "Sport, Tour and Terra share one construction and differ in compound and tread. Select one to compare how each performs.", i: [243, 258], o: [275.2, 279] },
  { name: "Departure", from: 276, peakFrame: 294, t: ["ROLLING", "ON."], b: "Every layer you just saw is built into one tyre: the APEX.", i: [280, 292] },
];

// Converts a target frame number back into scroll progress (0..1) so rail buttons land with text visible
function progressForFrame(targetFrame) {
  let accVh = 0;
  for (const seg of SEGMENTS) {
    if (targetFrame >= seg.a && targetFrame <= seg.b) {
      const segProgress = seg.b === seg.a ? 0.5 : (targetFrame - seg.a) / (seg.b - seg.a);
      return (accVh + segProgress * seg.vh) / TOTAL_VH;
    }
    accVh += seg.vh;
  }
  return 0;
}

export default function App() {
  const root = useRef(null), containerRef = useRef(null), canvasRef = useRef(null);
  const lenis = useRef(null), update = useRef(null);

  useEffect(() => {
    const l = new Lenis({
      lerp: 0.045,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });
    lenis.current = l;
    l.stop();

    const pct = root.current.querySelector(".pct");
    const bar = root.current.querySelector(".bar");
    const stage = root.current.querySelector(".stage");

    l.on("scroll", (e) => {
      ScrollTrigger.update();
      scroll.v = e.velocity;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? clamp(e.scroll / maxScroll) : 0;
      pct.textContent = Math.round(p * 100) + "%";
      bar.style.transform = `scaleX(${p})`;
    });

    const tick = (t) => {
      l.raf(t * 1000);
      // Smoothly decay velocity to 0 when wheel stops so transforms never get stuck
      scroll.v *= 0.9;
      if (Math.abs(scroll.v) < 0.01) scroll.v = 0;
      // Subtle vertical shear on active chapter text driven by scroll momentum
      if (stage) {
        const skew = gsap.utils.clamp(-2.5, 2.5, scroll.v * 0.08);
        stage.style.setProperty("--vel-skew", `${skew}deg`);
      }
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  useScrollSequence(canvasRef, containerRef, (f) => update.current?.(f));

  useGSAP(() => {
    const el = root.current, q = gsap.utils.selector(el);
    const chars = [], words = [], nums = [];

    q(".chap").forEach((c, k) => {
      chars[k] = q(`.p${k + 1} [data-c]`).flatMap(splitChars);
      words[k] = splitWords(c.querySelector("[data-w]"));
      nums[k] = c.querySelector("[data-n]");
    });

    const rail = q(".rail button"), cnt = q(".cnt")[0];
    let act = -1;

    update.current = (f) => {
      ACTS.forEach((a, k) => {
        const e = a.i ? clamp((f - a.i[0]) / (a.i[1] - a.i[0])) : 1;
        const x = a.o ? clamp((f - a.o[0]) / (a.o[1] - a.o[0])) : 0;
        const chapEl = el.querySelector(`.p${k + 1}`);

        const isVisible = e > 0 && x < 1;
        if (chapEl) {
          chapEl.style.visibility = isVisible ? "visible" : "hidden";
        }

        roll(chars[k], e, x);

        const enterGate = a.i ? clamp(e * 6) : 1;
        const exitGate = 1 - Math.pow(x, 1.5);

        words[k].forEach((w, j) => {
          // For Act 1 (k === 0), entrance is handled by the preloader; scroll only handles smooth exit
          if (k === 0) {
            const wOut = clamp(1 - (x * (words[0].length + 4) - j) / 4);
            w.style.opacity = wOut;
            w.style.transform = `translate3d(0, ${(1 - wOut) * -10}px, 0)`;
          } else {
            const wIn = clamp((e * (words[k].length + 4) - j) / 4);
            w.style.opacity = enterGate * (0.12 + 0.88 * wIn) * exitGate;
            w.style.transform = `translate3d(0, ${(1 - wIn) * 8 - x * 8}px, 0)`;
          }
        });

        if (nums[k]) {
          nums[k].textContent = (a.s[0] * (1 - Math.pow(1 - e, 3))).toFixed(a.s[1]);
          nums[k].parentElement.style.opacity = enterGate * exitGate;
          nums[k].parentElement.style.transform = `translate3d(0, ${(1 - enterGate) * 14 - x * 14}px, 0)`;
        }
      });

      const k = ACTS.reduce((r, a, i) => (f >= a.from ? i : r), 0);
      if (k !== act) {
        act = k;
        rail.forEach((b, i) => {
          b.classList.toggle("on", i === k);
          b.setAttribute("aria-current", i === k ? "step" : "false");
        });
        cnt.textContent = `0${k + 1} / 06`;
      }

      const showPanel = f >= 256 && f < 279;
      if (el.dataset.panel !== (showPanel ? "1" : "0")) {
        el.dataset.panel = showPanel ? "1" : "0";
      }
    };

    // Initialize frame 1 before preloader starts
    update.current(1);

    // Opening sequence: animate .p1 .ch i and the parent .p1 .bd container (zero conflict with update.current)
    const heroI = q(".p1 .ch i"), heroPara = q(".p1 .bd")[0];
    gsap.set(heroI, { yPercent: 115, rotateZ: 5 });
    gsap.set(heroPara, { y: 18, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.add(preloaderTimeline(el))
      .to(heroI, { yPercent: 0, rotateZ: 0, duration: 1.2, stagger: 0.026, ease: "expo.out" }, "-=0.55")
      .to(heroPara, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=0.85")
      .from(".hud > *, .rail", { opacity: 0, y: 8, duration: 0.9, stagger: 0.06, ease: "power2.out" }, "<0.1")
      .add(() => {
        lenis.current.start();
        ScrollTrigger.refresh();
      }, "-=0.6");

    document.fonts.ready.then(() =>
      matchMedia("(prefers-reduced-motion: reduce)").matches ? tl.progress(1) : tl.play()
    );
  }, { scope: root });

  const go = (k) => {
    const targetProgress = progressForFrame(ACTS[k].peakFrame);
    const maxScroll = containerRef.current.offsetHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + targetProgress * maxScroll;
    lenis.current.scrollTo(targetY, {
      duration: 2.1,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
  };

  return (
    <div ref={root} data-panel="0" style={{ "--v": "#F4C20D" }}>
      <Preloader />

      <div ref={containerRef} style={{ height: CONTAINER_HEIGHT }} className="relative">
        <div className="stage">
          <div className="glow" />
          <canvas ref={canvasRef} role="img" aria-label="Scroll-driven animation of the APEX tyre being taken apart" />

          <div className="hud">
            <div className="bar" />
            <span className="mark disp">APEX</span>
            <span className="cnt">01 / 06</span>
            <span className="scrollhint">Scroll <span className="pct">0%</span></span>
          </div>

          <nav className="rail" aria-label="Chapters">
            {ACTS.map((a, k) => (
              <button key={a.name} type="button" onClick={() => go(k)}>
                <span>{a.name}</span>
              </button>
            ))}
          </nav>

          {ACTS.map((a, k) => (
            <section key={a.name} className={`chap p${k + 1}`}>
              <h2 className="ttl">
                {a.t.map((l) => (
                  <span className="mask" key={l}>
                    <span data-c>{l}</span>
                  </span>
                ))}
              </h2>
              <p className="bd" data-w>{a.b}</p>
              {a.s && (
                <div className="st">
                  <b data-n className="disp">0</b>
                  <span>{a.s[2]}</span>
                  <small>{a.s[3]}</small>
                </div>
              )}
            </section>
          ))}

          <SpecConfigurator
            onVariant={(c) => gsap.to(root.current, { "--v": c, duration: 0.9, ease: "power2.out" })}
          />
        </div>
      </div>

      <EditorialFooter />
    </div>
  );
}