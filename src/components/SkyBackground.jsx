import { useEffect, useRef } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t)),
  };
}

function rgba({ r, g, b }, a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// ── sky gradient ──────────────────────────────────────────────────────────────

const SKY = {
  bright: {
    top: { r: 144, g: 224, b: 239 }, // #90e0ef Frosted Blue
    mid: { r:  72, g: 202, b: 228 }, // #48cae4 Sky Aqua
    bot: { r:   0, g: 180, b: 216 }, // #00b4d8 Turquoise Surf
  },
  mid: {
    top: { r:  72, g: 202, b: 228 },
    mid: { r:   0, g: 150, b: 199 }, // #0096c7 Blue Green
    bot: { r:   0, g: 119, b: 182 }, // #0077b6 Bright Teal Blue
  },
  deep: {
    top: { r:   0, g: 119, b: 182 },
    mid: { r:   0, g: 150, b: 199 },
    bot: { r:   0, g: 180, b: 216 },
  },
};

const CLOUD_CLR = {
  bright: { r: 255, g: 255, b: 255 },
  mid:    { r: 202, g: 240, b: 248 }, // #caf0f8
  deep:   { r: 173, g: 232, b: 244 }, // #ade8f4
};

function twoPhase(t, a, b, c) {
  if (t < 0.5) return lerpColor(a, b, t * 2);
  return lerpColor(b, c, (t - 0.5) * 2);
}

function getSkyGradient(t) {
  const top = twoPhase(t, SKY.bright.top, SKY.mid.top, SKY.deep.top);
  const mid = twoPhase(t, SKY.bright.mid, SKY.mid.mid, SKY.deep.mid);
  const bot = twoPhase(t, SKY.bright.bot, SKY.mid.bot, SKY.deep.bot);
  return `linear-gradient(to bottom, ${rgba(top)} 0%, ${rgba(mid)} 50%, ${rgba(bot)} 100%)`;
}

function getCloudColor(t) {
  return twoPhase(t, CLOUD_CLR.bright, CLOUD_CLR.mid, CLOUD_CLR.deep);
}

// ── cloud geometry ────────────────────────────────────────────────────────────
//
// KEY CONSTRAINT: worldYAngle must NEVER accumulate past ±15° or a cloud at
// x=800 will project toward center (cos(90°)=0 maps x→0). We use a bounded
// sine oscillation so positions are always predictable.
//
// Clouds are anchored well past the content zone:
//   - x: side * rand(820, 1300)   ← even at ±15° rotation, cos(15°)≈0.97
//     so projected x ≈ 820*0.97 = 795px from center — safely off the text.
//   - z: rand(-80, 80)            ← tight range keeps perspective factor near 1
//
// Each cloud has 10-16 small round puffs (96×96px) scattered outward.
// Many low-opacity layers stack into a recognisable cloud silhouette.

// Each cloud is made of puffs arranged in three tiers so they merge into a
// recognisable cloud silhouette. No per-layer spin — rotateZ is gone.
// Puffs are wider than tall (160×100) to look like cloud lobes, not eggs.
function makeCloud(side) {
  const layers = [];

  // ── core: 4-5 large overlapping puffs, dense center ──────────────────────
  const coreCount = randInt(4, 5);
  for (let i = 0; i < coreCount; i++) {
    layers.push({
      ox:      side * rand(0, 50),
      oy:      rand(-18, 18),
      scaleX:  rand(1.1, 1.6),
      scaleY:  rand(0.75, 1.05),
      opacity: rand(0.55, 0.75),
    });
  }

  // ── mid: 4-6 medium puffs that form the bumpy top edge ───────────────────
  const midCount = randInt(4, 6);
  for (let i = 0; i < midCount; i++) {
    layers.push({
      ox:      side * rand(20, 110),
      oy:      rand(-35, 20),
      scaleX:  rand(0.8, 1.25),
      scaleY:  rand(0.6, 0.9),
      opacity: rand(0.4, 0.62),
    });
  }

  // ── wisps: 3-5 small translucent puffs at the trailing edge ──────────────
  const wispCount = randInt(3, 5);
  for (let i = 0; i < wispCount; i++) {
    layers.push({
      ox:      side * rand(80, 160),
      oy:      rand(-25, 30),
      scaleX:  rand(0.5, 0.85),
      scaleY:  rand(0.45, 0.7),
      opacity: rand(0.18, 0.38),
    });
  }

  return layers;
}

const CLOUDS = Array.from({ length: 24 }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  return {
    x: side * rand(820, 1300),
    y: rand(-120, 120),
    z: rand(-80, 80),
    layers: makeCloud(side),
  };
});

// ── component ────────────────────────────────────────────────────────────────

export default function SkyBackground() {
  const containerRef = useRef(null);
  const worldRef     = useRef(null);
  const layerRefs    = useRef([]);

  const state = useRef({
    worldX:  0,
    scrollT: 0,
    rafId:   null,
  });

  useEffect(() => {
    const container = containerRef.current;
    const world     = worldRef.current;
    const s         = state.current;

    function onScroll() {
      const maxScroll = Math.max(1, window.innerHeight);
      s.scrollT = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      container.style.background = getSkyGradient(s.scrollT);
      s.worldX = s.scrollT * 18;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function tick(now) {
      // Bounded sine oscillation — never accumulates past ±12°
      // so cloud x positions stay predictable and never swing through center.
      const wy = Math.sin(now * 0.00018) * 12;
      const wx = s.worldX;

      world.style.transform = `rotateX(${wx}deg) rotateY(${wy}deg)`;

      const cc = getCloudColor(s.scrollT);

      CLOUDS.forEach((cloud, ci) => {
        cloud.layers.forEach((layer, li) => {
          const el = layerRefs.current[ci]?.[li];
          if (!el) return;

          el.style.transform = [
            `rotateY(${-wy}deg)`,
            `rotateX(${-wx}deg)`,
            `translate(${layer.ox}px,${layer.oy}px)`,
            `scale(${layer.scaleX},${layer.scaleY})`,
          ].join(" ");

          el.style.background = [
            `radial-gradient(ellipse at 45% 40%,`,
            `${rgba(cc, layer.opacity)} 0%,`,
            `${rgba(cc, layer.opacity * 0.5)} 45%,`,
            `${rgba(cc, 0)} 70%)`,
          ].join(" ");
        });
      });

      s.rafId = requestAnimationFrame(tick);
    }

    s.rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(s.rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: getSkyGradient(0),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "800px",
          perspectiveOrigin: "50% 42%",
        }}
      >
        <div
          ref={worldRef}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
        >
          {CLOUDS.map((cloud, ci) => (
            <div
              key={ci}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 0,
                height: 0,
                transformStyle: "preserve-3d",
                transform: `translate3d(${cloud.x}px,${cloud.y}px,${cloud.z}px)`,
              }}
            >
              {cloud.layers.map((layer, li) => (
                <div
                  key={li}
                  ref={el => {
                    if (!layerRefs.current[ci]) layerRefs.current[ci] = [];
                    layerRefs.current[ci][li] = el;
                  }}
                  style={{
                    position: "absolute",
                    // Square puffs → rounder, more cloud-like when stacked
                    width: 96,
                    height: 96,
                    marginLeft: -48,
                    marginTop: -48,
                    borderRadius: "50%",
                    willChange: "transform, background",
                    background: `radial-gradient(circle at 40% 40%,
                      rgba(255,255,255,${layer.opacity}) 0%,
                      rgba(255,255,255,${layer.opacity * 0.55}) 40%,
                      rgba(255,255,255,0) 72%)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
