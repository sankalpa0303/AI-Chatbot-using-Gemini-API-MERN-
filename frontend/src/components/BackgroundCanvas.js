import React, { useEffect, useRef } from "react";

// Dynamic AI network animation using brand palette
function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let frameId;

    const palette = [
      { r: 237, g: 101, b: 83, a: 0.32 },  // #ed6553
      { r: 246, g: 167, b: 91, a: 0.30 },  // #f6a75b
      { r: 140, g: 137, b: 245, a: 0.34 }, // #8c89f5
      { r: 175, g: 209, b: 233, a: 0.26 }, // #afd1e9
    ];

    const nodes = Array.from({ length: 62 }, () => createNode());

    function pickColor() {
      return palette[Math.floor(Math.random() * palette.length)];
    }

    function createNode() {
      const color = pickColor();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 2 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        alpha: color.a,
        color,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          const maxDist = 230;
          if (dist2 < maxDist * maxDist) {
            const dist = Math.sqrt(dist2);
            const opacity = Math.max(0, 0.32 - dist / maxDist) * 0.9;
            const mix = Math.random() < 0.5 ? a.color : b.color;
            ctx.strokeStyle = `rgba(${mix.r}, ${mix.g}, ${mix.b}, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      nodes.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
        if (p.y < -12) p.y = height + 12;
        if (p.y > height + 12) p.y = -12;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26);
        glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`);
        glow.addColorStop(1, "rgba(13, 8, 26, 0)");

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.9)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (idx % 9 === 0) {
          p.alpha = 0.24 + Math.random() * 0.18;
        }
      });

      frameId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />;
}

export default BackgroundCanvas;