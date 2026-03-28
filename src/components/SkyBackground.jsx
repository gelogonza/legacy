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

// ── sky gradient color stops ──────────────────────────────────────────────────
//   three keyframes: golden hour → dusk → night

const SKY = {
  golden: {
    top: { r: 255, g: 145, b:  70 },
    mid: { r: 255, g: 100, b:  50 },
    bot: { r: 195, g:  70, b:  35 },
  },
  dusk: {
    top: { r:  75, g:  35, b: 115 },
    mid: { r: 175, g:  70, b: 130 },
    bot: { r: 235, g: 120, b:  90 },
  },
  night: {
    top: { r:   8, g:   8, b:  38 },
    mid: { r:  18, g:  18, b:  72 },
    bot: { r:  28, g:  28, b:  58 },
  },
};

const CLOUD_CLR = {
  golden: { r: 255, g: 230, b: 200 },
  dusk:   { r: 220, g: 175, b: 220 },
  night:  { r: 135, g: 145, b: 175 },
};

function twoPhase(t, a, b, c) {
  if (t < 0.5) return lerpColor(a, b, t * 2);
  return lerpColor(b, c, (t - 0.5) * 2);
}

function getSkyGradient(t) {
  const top = twoPhase(t, SKY.golden.top, SKY.dusk.top, SKY.night.top);
  const mid = twoPhase(t, SKY.golden.mid, SKY.dusk.mid, SKY.night.mid);
  const bot = twoPhase(t, SKY.golden.bot, SKY.dusk.bot, SKY.night.bot);
  return `linear-gradient(to bottom, ${rgba(top)} 0%, ${rgba(mid)} 50%, ${rgba(bot)} 100%)`;
}

function getCloudColor(t) {
  return twoPhase(t, CLOUD_CLR.golden, CLOUD_CLR.dusk, CLOUD_CLR.night);
}

// ── static cloud geometry (generated once at module load) ────────────────────

const CLOUDS = Array.from({ length: 12 }, () => ({
  x: rand(-280, 280),
  y: rand(-60, 60),
  z: rand(-280, 280),
  layers: Array.from({ length: randInt(4, 8) }, () => ({
    ox:      rand(-70, 70),          // offset within base
    oy:      rand(-25, 25),
    initZ:   rand(0, 360),           // starting rotateZ
    speed:   rand(0.04, 0.25) * (Math.random() > 0.5 ? 1 : -1),
    scale:   rand(0.8, 1.9),
    opacity: rand(0.55, 0.88),
  })),
}));

// ── component ────────────────────────────────────────────────────────────────

export default function SkyBackground() {
  const containerRef  = useRef(null);
  const worldRef      = useRef(null);
  const sunRef        = useRef(null);
  // flat arrays for DOM refs — filled during render
  const layerRefs     = useRef([]);

  // mutable state kept outside React to avoid re-renders
  const state = useRef({
    worldY:    0,
    worldX:    0,
    scrollT:   0,
    layerZ:    CLOUDS.map(c => c.layers.map(l => l.initZ)),
    rafId:     null,
  });

  useEffect(() => {
    const container = containerRef.current;
    const world     = worldRef.current;
    const sun       = sunRef.current;
    const s         = state.current;

    // ── scroll ──────────────────────────────────────────────────────────────
    function onScroll() {
      const maxScroll = Math.max(1, window.innerHeight);
      s.scrollT = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      container.style.background = getSkyGradient(s.scrollT);

      const sunTop = 15 + s.scrollT * 42;
      sun.style.top     = `${sunTop}%`;
      sun.style.opacity = String(Math.max(0, 1 - s.scrollT * 1.3));

      s.worldX = s.scrollT * 22; // tilt world up to 22 ° on scroll
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── animation loop ───────────────────────────────────────────────────────
    let prev = 0;

    function tick(now) {
      const dt = Math.min(now - prev, 50); // cap to avoid huge jumps
      prev = now;

      // slow sine-drifted Y rotation
      s.worldY += 0.025;
      const wy = s.worldY + Math.sin(now * 0.00025) * 6;
      const wx = s.worldX;

      world.style.transform = `rotateX(${wx}deg) rotateY(${wy}deg)`;

      const cc = getCloudColor(s.scrollT);

      CLOUDS.forEach((cloud, ci) => {
        cloud.layers.forEach((layer, li) => {
          const el = layerRefs.current[ci]?.[li];
          if (!el) return;

          s.layerZ[ci][li] += layer.speed * (dt / 16);
          const lz = s.layerZ[ci][li];

          // billboard: undo world rotation, then apply local offset + spin
          el.style.transform = [
            `rotateY(${-wy}deg)`,
            `rotateX(${-wx}deg)`,
            `translate(${layer.ox}px,${layer.oy}px)`,
            `rotateZ(${lz}deg)`,
            `scale(${layer.scale})`,
          ].join(" ");

          el.style.background = [
            `radial-gradient(ellipse at center,`,
            `${rgba(cc, layer.opacity)} 0%,`,
            `${rgba(cc, layer.opacity * 0.4)} 45%,`,
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
      {/* Sun */}
      <div
        ref={sunRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "15%",
          transform: "translateX(-50%)",
          width: 76,
          height: 76,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #fffae8 0%, #ffdd55 35%, #ff9900 65%, transparent 100%)",
          boxShadow: [
            "0 0  55px 28px rgba(255,175,55,0.55)",
            "0 0 110px 55px rgba(255,120,30,0.22)",
          ].join(", "),
          pointerEvents: "none",
        }}
      />

      {/* CSS 3D viewport */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "800px",
          perspectiveOrigin: "50% 42%",
        }}
      >
        {/* World — rotated each frame */}
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
                    width: 210,
                    height: 130,
                    marginLeft: -105,
                    marginTop: -65,
                    borderRadius: "50%",
                    willChange: "transform, background",
                    // initial paint — overwritten each frame
                    background: `radial-gradient(ellipse at center,
                      rgba(255,230,200,${layer.opacity}) 0%,
                      rgba(255,230,200,${layer.opacity * 0.4}) 45%,
                      rgba(255,230,200,0) 70%)`,
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
