export const SEGMENTS = [
  { a: 1,   b: 45,  vh: 100 }, // Act I: Awakening
  { a: 46,  b: 75,  vh: 102 }, // Act II: Deconstruction
  { a: 75,  b: 75,  vh: 25  }, // HOLD: peak explosion (read time)
  { a: 75,  b: 110, vh: 123 }, // Act II: Reassemble
  { a: 111, b: 180, vh: 200 }, // Act III: Hydro-Dynamic
  { a: 181, b: 240, vh: 200 }, // Act IV: Apex Heat
  { a: 241, b: 275, vh: 70  }, // Act V: Camera goes overhead
  { a: 275, b: 275, vh: 130 }, // HOLD: User picks spec here
  { a: 276, b: 300, vh: 80  }, // Act VI: Tyre rolls away
];

// This calculates how tall the webpage should be based on the numbers above (1030)
export const TOTAL_VH = SEGMENTS.reduce((s, g) => s + g.vh, 0); 
// We add 100 for the height of the user's screen itself.
export const CONTAINER_HEIGHT = `${TOTAL_VH + 100}vh`; 

// This function translates how far the user scrolled into an exact Frame Number.
export function frameAt(progress) { 
  let v = progress * TOTAL_VH;
  for (const g of SEGMENTS) {
    if (v <= g.vh) return g.a + (g.b - g.a) * (v / g.vh);
    v -= g.vh;
  }
  return SEGMENTS[SEGMENTS.length - 1].b;
}