import { useRef, useEffect } from 'react';

interface ParticleData {
  x: number;
  y: number;
  radius: number;
  color: string;
  isOrbiter: boolean;
  orbitRadius: number;
  angle: number;
  speed: number;
}

export default function CelestialOrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let particles: ParticleData[] = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    function drawParticle(p: ParticleData) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    const createParticle = (
      x: number,
      y: number,
      radius: number,
      color: string,
      isOrbiter = false
    ): ParticleData => ({
      x,
      y,
      radius,
      color,
      isOrbiter,
      orbitRadius: Math.random() * 160 + 80,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.018 + 0.006) * (Math.random() < 0.5 ? 1 : -1),
    });

    const centerPoint = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
    };

    const init = () => {
      particles = [];
      // Central glowing orb — warm orange-white
      particles.push(createParticle(centerPoint.x, centerPoint.y, 18, 'rgba(255, 160, 60, 0.92)'));
      // Orbiting particles — orange/amber palette to match brand
      for (let i = 0; i < 55; i++) {
        const hue = Math.random() * 50 + 15; // 15–65 = orange to amber/gold
        const lightness = Math.random() * 20 + 55;
        const alpha = Math.random() * 0.5 + 0.4;
        particles.push(
          createParticle(
            0,
            0,
            Math.random() * 2.8 + 0.8,
            `hsla(${hue}, 90%, ${lightness}%, ${alpha})`,
            true
          )
        );
      }
      // A few cool-accent particles (cyan/white)
      for (let i = 0; i < 15; i++) {
        particles.push(
          createParticle(
            0,
            0,
            Math.random() * 1.8 + 0.5,
            `hsla(${Math.random() * 40 + 190}, 70%, 75%, ${Math.random() * 0.3 + 0.2})`,
            true
          )
        );
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Trail effect: semi-transparent fill instead of clearRect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smoothly lerp center toward mouse
      centerPoint.targetX = mouse.x;
      centerPoint.targetY = mouse.y;
      centerPoint.x += (centerPoint.targetX - centerPoint.x) * 0.06;
      centerPoint.y += (centerPoint.targetY - centerPoint.y) * 0.06;

      // Draw central orb with glow rings
      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 28, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(
        centerPoint.x, centerPoint.y, 2,
        centerPoint.x, centerPoint.y, 28
      );
      grd.addColorStop(0, 'rgba(255, 140, 30, 0.18)');
      grd.addColorStop(1, 'rgba(255, 140, 30, 0)');
      ctx.fillStyle = grd;
      ctx.fill();

      // Update central orb position
      particles[0].x = centerPoint.x;
      particles[0].y = centerPoint.y;
      drawParticle(particles[0]);

      // Update orbiters
      for (let i = 1; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;
        p.x = centerPoint.x + Math.cos(p.angle) * p.orbitRadius;
        p.y = centerPoint.y + Math.sin(p.angle) * p.orbitRadius;
        drawParticle(p);
      }
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
