import { useEffect, useRef } from 'react';

interface Props {
  variant?: 'dots' | 'squares';
  color?: string;
  opacity?: number;
}

/**
 * Subtle animated background — floating dot grid or square grid.
 * Pure canvas, no dependencies. ~60fps, pauses when tab is hidden.
 * Position: fixed, behind all content (z-index: -1).
 */
export default function AnimatedBackground({
  variant = 'dots',
  color = '#111827',
  opacity = 0.06,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SPACING = 36;   // grid cell size
    const SIZE = variant === 'dots' ? 1.5 : 3; // dot radius or square half-size
    const SPEED = 0.0004; // wave speed
    const WAVE_AMP = 0.4; // how much each point pulses (0–1 opacity multiplier)

    let animId: number;
    let t = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / SPACING) + 1;
      const rows = Math.ceil(canvas.height / SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;

          // Wave: diagonal ripple based on position + time
          const wave = Math.sin(c * 0.4 + r * 0.3 + t) * WAVE_AMP + (1 - WAVE_AMP);
          const alpha = opacity * wave;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;

          if (variant === 'dots') {
            ctx.beginPath();
            ctx.arc(x, y, SIZE, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // squares — rotated 45° for diamond look
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-SIZE, -SIZE, SIZE * 2, SIZE * 2);
            ctx.restore();
          }
        }
      }

      ctx.globalAlpha = 1;
      t += SPEED;
      animId = requestAnimationFrame(draw);
    }

    function handleVisibility() {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [variant, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
