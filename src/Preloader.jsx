// Preloader.jsx
// A tyre spools up (tread, sidewall text, rim, tachometer ticks), then its bore
// opens as a circular iris onto the site.
import gsap from "gsap";

const BLOCKS = 48;
const TICKS = 60;
const PHASES = [
    "Mixing compound",
    "Laying aramid carcass",
    "Winding steel belts",
    "Cutting tread",
    "Curing",
    "Balancing",
];
const SIDEWALL = "APEX 245/35 ZR19 93Y ANATOMY OF GRIP SILICA CARBON ARAMID ";

const C = 200;
const rad = (deg) => (deg * Math.PI) / 180;
const polar = (r, deg) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))];

export function Preloader() {
    return (
        <>
            <div className="pre" aria-hidden="true">
                <span className="pre-s">{PHASES[0]}</span>
                <span className="pre-meta">Compound: silica carbon</span>

                <svg className="pre-wheel" viewBox="0 0 400 400">
                    <defs>
                        <path id="pre-arc" d="M42 200 a158 158 0 1 1 316 0 a158 158 0 1 1 -316 0" />
                    </defs>

                    {/* Tread blocks (spin) */}
                    <g className="pre-tread">
                        {Array.from({ length: BLOCKS }, (_, i) => (
                            <g key={i} transform={`rotate(${(i * 360) / BLOCKS} ${C} ${C})`}>
                                <rect
                                    className={`pre-block${i % 2 ? " lo" : ""}`}
                                    x="195.5"
                                    y="8"
                                    width="9"
                                    height={i % 2 ? 9 : 14}
                                    rx="1.2"
                                />
                            </g>
                        ))}
                    </g>

                    <circle className="pre-ring" cx={C} cy={C} r="172" />

                    {/* Sidewall lettering (counter-spin) */}
                    <g className="pre-sidewall">
                        <text className="pre-sw">
                            <textPath href="#pre-arc" textLength="992" lengthAdjust="spacing">
                                {SIDEWALL + SIDEWALL}
                            </textPath>
                        </text>
                    </g>

                    {/* Tachometer ticks = progress */}
                    <g>
                        {Array.from({ length: TICKS }, (_, i) => {
                            const long = i % 5 === 0;
                            const [x1, y1] = polar(long ? 124 : 130, (i * 360) / TICKS);
                            const [x2, y2] = polar(140, (i * 360) / TICKS);
                            return <line key={i} className="pre-tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
                        })}
                    </g>

                    {/* Rim */}
                    <circle className="pre-ring" cx={C} cy={C} r="116" />
                    <g className="pre-rim">
                        <circle className="pre-ring" cx={C} cy={C} r="106" />
                        {[0, 1, 2, 3, 4].map((i) => (
                            <path
                                key={i}
                                className="pre-spoke"
                                d="M194 176 L187 98 L213 98 L206 176 Z"
                                transform={`rotate(${i * 72} ${C} ${C})`}
                            />
                        ))}
                        {[0, 1, 2, 3, 4].map((i) => {
                            const [x, y] = polar(46, 36 + i * 72);
                            return <circle key={i} className="pre-bolt" cx={x} cy={y} r="3" />;
                        })}
                        <circle className="pre-ring" cx={C} cy={C} r="24" />
                    </g>
                    <circle className="pre-dot" cx={C} cy={C} r="5" />
                </svg>

                <span className="pre-n disp">000</span>
                <span className="pre-w disp">APEX</span>
            </div>
            <div className="pre-edge" aria-hidden="true" />
        </>
    );
}

export function preloaderTimeline(root) {
    const q = gsap.utils.selector(root);
    const pre = q(".pre")[0];
    const edge = q(".pre-edge")[0];
    const wheel = q(".pre-wheel")[0];
    const num = q(".pre-n")[0];
    const status = q(".pre-s")[0];
    const ticks = q(".pre-tick");
    const blocks = q(".pre-block");
    const rings = q(".pre-ring");
    const chrome = q(".pre-n, .pre-s, .pre-w, .pre-meta");
    const reach = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 60;
    const state = { v: 0 };
    let lit = -1, phase = -1;

    // Starting states
    gsap.set([pre, edge], { "--r": "-2px" });
    gsap.set(edge, { opacity: 0 });
    gsap.set(blocks, { opacity: 0, attr: { y: 34 } });
    rings.forEach((c) => {
        const len = c.getTotalLength();
        gsap.set(c, { strokeDasharray: len, strokeDashoffset: len });
    });

    const paint = () => {
        const v = state.v;
        num.textContent = String(Math.round(v)).padStart(3, "0");
        const n = Math.round((v / 100) * TICKS);
        if (n !== lit) {
            lit = n;
            ticks.forEach((t, i) => t.classList.toggle("on", i < n));
        }
        const p = Math.min(PHASES.length - 1, Math.floor((v / 100) * PHASES.length));
        if (p !== phase) {
            phase = p;
            status.textContent = PHASES[p];
        }
    };

    const spin = { duration: 2.6, ease: "power2.inOut", svgOrigin: "200 200" };

    return gsap
        .timeline()
        // Build the tyre
        .to(rings, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out", stagger: 0.1 }, 0)
        .to(blocks, { opacity: 1, attr: { y: 8 }, duration: 0.6, ease: "power3.out", stagger: 0.014 }, 0.1)
        // Spool up: one shared ease so count, tread, rim and lettering stay in sync
        .to(state, { v: 100, duration: 2.6, ease: "power2.inOut", onUpdate: paint }, 0.3)
        .to(q(".pre-tread"), { rotation: 900, ...spin }, 0.3)
        .to(q(".pre-sidewall"), { rotation: -360, ...spin }, 0.3)
        .to(q(".pre-rim"), { rotation: 540, ...spin }, 0.3)
        .to(q(".pre-dot"), { attr: { r: 8 }, duration: 0.32, ease: "sine.inOut", yoyo: true, repeat: 7 }, 0.3)
        // Exit: labels clear, tyre rushes the camera, bore opens
        .addLabel("exit", ">+0.2")
        .to(chrome, { opacity: 0, y: -16, duration: 0.45, ease: "power2.in", stagger: 0.05 }, "exit")
        .to(wheel, { scale: 1.5, duration: 1.3, ease: "expo.inOut" }, "exit+=0.15")
        .to(edge, { opacity: 1, duration: 0.2 }, "exit+=0.3")
        .to([pre, edge], { "--r": `${reach}px`, duration: 1.2, ease: "expo.inOut" }, "exit+=0.3")
        .to(edge, { opacity: 0, duration: 0.3 }, ">-0.3")
        .set([pre, edge], { display: "none" });
}