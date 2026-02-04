import React, { useEffect, useRef } from "react";

// Dynamic AI-inspired canvas with flowing signal waves and grid
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
      { r: 237, g: 101, b: 83, a: 0.26 },  // coral
      { r: 246, g: 167, b: 91, a: 0.24 },  // amber
      { r: 140, g: 137, b: 245, a: 0.30 }, // lavender
      { r: 141, g: 217, b: 255, a: 0.24 }, // cyan
    ];

    const waves = Array.from({ length: 3 }, (_, i) => createWave(i));

    function createWave(idx) {
      return {
        offset: Math.random() * Math.PI * 2,
        speed: 0.15 + idx * 0.05,
        amp: 16 + idx * 8,
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

      // faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 140) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // flowing waves
      const t = performance.now() / 1000;
      waves.forEach((w, idx) => {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const c = palette[idx % palette.length];
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.07)`);
        grad.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0.16)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        const baseY = height * (0.3 + idx * 0.2);
        for (let x = 0; x <= width; x += 12) {
          const y = baseY + Math.sin((x / 160) + t * w.speed + w.offset) * w.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
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