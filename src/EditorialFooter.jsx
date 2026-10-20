// EditorialFooter.jsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { splitWords, scroll } from "./fx";

gsap.registerPlugin(ScrollTrigger);

export function EditorialFooter() {
  const root = useRef(null), track = useRef(null), btn = useRef(null);

  useGSAP(() => {
    const words = splitWords(root.current.querySelector("[data-w]"));
    gsap.fromTo(
      words,
      { opacity: 0.12, y: 10 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".foot-st",
          start: "top 85%",
          end: "bottom 55%",
          scrub: true,
        },
      }
    );

    // Spec rows stagger reveal
    gsap.from(".foot-side dl div", {
      y: 18,
      opacity: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".foot-side",
        start: "top 88%",
      },
    });

    // Marquee: drifts continuously and reacts smoothly to scroll velocity
    let x = 0;
    const setX = gsap.quickSetter(track.current, "xPercent");
    const setSkew = gsap.quickSetter(track.current, "skewX", "deg");

    const tick = () => {
      x -= 0.035 + Math.abs(scroll.v) * 0.025;
      if (x <= -50) x += 50;
      setX(x);
      setSkew(gsap.utils.clamp(-8, 8, scroll.v * 0.45));
    };

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) gsap.ticker.add(tick);

    // Magnetic button with inner text parallax
    const buttonEl = btn.current;
    const btnText = buttonEl.querySelector("span");
    const mx = gsap.quickTo(buttonEl, "x", { duration: 0.45, ease: "power3" });
    const my = gsap.quickTo(buttonEl, "y", { duration: 0.45, ease: "power3" });
    const tx = gsap.quickTo(btnText, "x", { duration: 0.35, ease: "power3" });
    const ty = gsap.quickTo(btnText, "y", { duration: 0.35, ease: "power3" });

    const move = (e) => {
      const r = buttonEl.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = e.clientY - r.top - r.height / 2;
      mx(dx * 0.28);
      my(dy * 0.28);
      tx(dx * 0.12);
      ty(dy * 0.12);
    };
    const leave = () => {
      mx(0);
      my(0);
      tx(0);
      ty(0);
    };

    buttonEl.addEventListener("mousemove", move);
    buttonEl.addEventListener("mouseleave", leave);

    return () => {
      gsap.ticker.remove(tick);
      buttonEl.removeEventListener("mousemove", move);
      buttonEl.removeEventListener("mouseleave", leave);
    };
  }, { scope: root });

  return (
    <footer ref={root} className="foot">
      <div className="foot-top">
        <p className="foot-st disp" data-w>
          Grip is the only thing that ever touches the road.
        </p>
        <div className="foot-side">
          <dl>
            <div><dt>Carcass</dt><dd>Aramid, three layers</dd></div>
            <div><dt>Belts</dt><dd>High-tension dual steel</dd></div>
            <div><dt>Compound</dt><dd>Silica carbon</dd></div>
          </dl>
          <a
            ref={btn}
            href="#dossier"
            onClick={(e) => e.preventDefault()}
            className="btn"
          >
            <span>Read the technical dossier</span>
          </a>
        </div>
      </div>
      <div className="marquee" aria-hidden="true">
        <div ref={track} className="track disp">
          {[0, 1].map((n) => (
            <div key={n}>
              {["Wet grip", "Lateral grip", "Wet grip", "Lateral grip"].map((t, i) => (
                <span key={i}>{t}<i className="dot" /></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}