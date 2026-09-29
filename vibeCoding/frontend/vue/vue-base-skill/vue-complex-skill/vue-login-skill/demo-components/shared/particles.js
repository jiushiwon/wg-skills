/**
 * Particle Background - 粒子连线动画
 * 不依赖任何第三方库，纯 Canvas 实现
 */

class ParticleBackground {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.mouse = { x: null, y: null };

    // 配置
    this.options = {
      particleCount: options.particleCount || 80,
      connectionDistance: options.connectionDistance || 120,
      particleSize: options.particleSize || 2,
      speed: options.speed || 1,
      color: options.color || '#409eff',
      opacity: options.opacity || 0.6,
      mouseRadius: options.mouseRadius || 150,
      responsive: options.responsive !== false
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    if (this.options.responsive) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: Math.random() * this.options.particleSize + 1
      });
    }
  }

  bindEvents() {
    if (this.options.responsive) {
      window.addEventListener('resize', () => {
        this.resize();
        this.createParticles();
      });
    }

    this.canvas.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.options.color;
    this.ctx.globalAlpha = this.options.opacity;
    this.ctx.fill();
  }

  drawConnection(p1, p2, distance) {
    const opacity = 1 - (distance / this.options.connectionDistance);
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = this.options.color;
    this.ctx.globalAlpha = opacity * 0.5;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  updateParticle(particle) {
    // 移动
    particle.x += particle.vx;
    particle.y += particle.vy;

    // 边界检测
    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.vx *= -1;
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.vy *= -1;
    }

    // 鼠标交互
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.options.mouseRadius) {
        const force = (this.options.mouseRadius - distance) / this.options.mouseRadius;
        particle.vx -= (dx / distance) * force * 0.02;
        particle.vy -= (dy / distance) * force * 0.02;
      }
    }

    // 速度限制
    const maxSpeed = this.options.speed * 2;
    const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (currentSpeed > maxSpeed) {
      particle.vx = (particle.vx / currentSpeed) * maxSpeed;
      particle.vy = (particle.vy / currentSpeed) * maxSpeed;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 更新和绘制粒子
    for (let i = 0; i < this.particles.length; i++) {
      this.updateParticle(this.particles[i]);
      this.drawParticle(this.particles[i]);

      // 绘制连线
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.options.connectionDistance) {
          this.drawConnection(this.particles[i], this.particles[j], distance);
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.resize);
  }
}

// 导出
window.ParticleBackground = ParticleBackground;
