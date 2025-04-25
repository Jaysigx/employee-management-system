import {
  useEffect,
  useRef,
} from 'react';

const InfinityParticles = () => {
  const canvasRef = useRef(null);

  // ==== Configuration ====
  const CONFIG = {
    scale: 500, // Infinity curve scale
    particleCount: 500, // Total particles
    wanderingChance: 0.08, // Chance a particle starts as wandering
    baseSpeedMin: 0.001,
    baseSpeedMax: 0.0025,
    spreadMax: 65,
    alphaTrail: 0.15, // Background trail fade
    particleAlpha: 0.5, // Particle opacity
    hueBase: 220, // Base hue
    hueRange: 60, // Added to base hue depending on distance
    shadowBlurThreshold: 1.5, // Size threshold to apply glow
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Adjust canvas size to match screen and handle high DPI
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const particles = [];

    // Returns a point on the infinity path based on time t
    const infinityPath = (t) => {
      const sinT = Math.sin(t);
      const denom = 1 + sinT ** 2;
      return {
        x: (Math.cos(t) / denom) * CONFIG.scale + w() / 2,
        y: ((Math.cos(t) * sinT) / denom) * CONFIG.scale + h() / 2,
      };
    };

    // Approximates the tangent vector of the infinity path at time t
    const getTangent = (t) => {
      const delta = 0.01;
      const p1 = infinityPath(t);
      const p2 = infinityPath(t + delta);
      return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
      };
    };

    // Particle class represents either a drifting or path-following particle
    class Particle {
      constructor(offset, wandering = false) {
        this.reset(offset, wandering);
      }

      // Initialize or reinitialize a particle
      reset(offset = 0, wandering = false) {
        this.t = offset;
        this.baseSpeed =
          CONFIG.baseSpeedMin +
          Math.random() * (CONFIG.baseSpeedMax - CONFIG.baseSpeedMin);
        this.baseSize = 0.5 + Math.random();
        this.spread = Math.random() * CONFIG.spreadMax;
        this.angleOffset = Math.random() * Math.PI * 2;
        this.wandering = wandering;

        if (wandering) {
          this.x = Math.random() * w();
          this.y = Math.random() * h();
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.age = 0;
          this.maxAge = 400 + Math.random() * 300;
        }
      }

      // Update particle position
      update() {
        if (this.wandering) {
          // Wandering particles move slowly and randomly
          this.x = (this.x + this.vx + w()) % w();
          this.y = (this.y + this.vy + h()) % h();
          if (++this.age > this.maxAge) {
            this.reset(this.t + Math.random() * Math.PI * 2, false);
          }
          this.size = this.baseSize;
        } else {
          // Path-following particles orbit around the infinity curve
          const base = infinityPath(this.t);
          const tangent = getTangent(this.t);
          const mag = Math.hypot(tangent.x, tangent.y);
          const nx = -tangent.y / mag;
          const ny = tangent.x / mag;
          const offsetX = nx * Math.cos(this.angleOffset) * this.spread;
          const offsetY = ny * Math.sin(this.angleOffset) * this.spread;

          this.x = base.x + offsetX;
          this.y = base.y + offsetY;

          const dx = this.x - w() / 2;
          const dy = this.y - h() / 2;
          const dist = Math.hypot(dx, dy);
          const factor = 1 - Math.min(dist / CONFIG.scale, 1);

          this.speed = this.baseSpeed + factor * 0.01;
          this.size = this.baseSize + (1 - factor);
          this.t += this.speed;

          // Occasionally reset into wandering state
          if (Math.random() < 0.0015) this.reset(0, true);
        }
      }

      // Draw particle on canvas
      draw() {
        const dx = this.x - w() / 2;
        const dy = this.y - h() / 2;
        const dist = Math.hypot(dx, dy);
        const colorFactor = 1 - Math.min(dist / CONFIG.scale, 1);
        const hue = CONFIG.hueBase + colorFactor * CONFIG.hueRange;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${CONFIG.particleAlpha})`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = this.size > CONFIG.shadowBlurThreshold || colorFactor > 0.8 ? 5 : 0;
        ctx.fill();
        ctx.restore();
      }
    }

    // Create particles
    for (let i = 0; i < CONFIG.particleCount; i++) {
      const isWandering = Math.random() < CONFIG.wanderingChance;
      particles.push(new Particle((Math.PI * 2 * i) / CONFIG.particleCount, isWandering));
    }

    // Animation loop
    const animate = () => {
      // Semi-transparent fill to create trailing effect
      ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.alphaTrail})`;
      ctx.fillRect(0, 0, w(), h());

      // Update and draw each particle
      for (const p of particles) {
        p.update();
        p.draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-screen h-screen -z-10" />
      <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-40 -z-10" />
    </>
  );
};

export default InfinityParticles;
