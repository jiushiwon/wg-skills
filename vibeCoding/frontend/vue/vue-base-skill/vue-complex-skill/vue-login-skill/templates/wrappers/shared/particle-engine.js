/*
 * particle-engine.js - ES5 全局粒子动画类
 *
 * 暴露方式：window.ParticleBackground（类）
 * Vue 组件通过 side-effect import './particle-engine' + new window.ParticleBackground(...) 使用
 *
 * 配置项（构造函数 options）：
 *   particleCount: number   粒子数量（默认 80）
 *   connectionDistance: number  连线最大距离（默认 120）
 *   particleSize: number    粒子尺寸（默认 2）
 *   speed: number           移动速度（默认 1）
 *   color: string           粒子颜色（默认 '#409eff'）
 *   opacity: number         粒子不透明度（默认 0.6）
 *   mouseRadius: number     鼠标交互半径（默认 150）
 *   responsive: boolean     响应式（默认 true）
 *
 * 方法：
 *   init() / resize() / createParticles() / bindEvents()
 *   drawParticle(p) / drawConnection(p1, p2, distance) / updateParticle(p)
 *   animate() / destroy()
 *
 * ponytail: 保持 ES5 写法是为了兼容老旧浏览器（Vue 2 / 部分移动端 WebView）。
 * 若消费方都用现代浏览器，可后续迁移到 ES6 class。
 */
(function () {
  function ParticleBackground(canvas, options) {
    options = options || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      particleCount: options.particleCount != null ? options.particleCount : 80,
      connectionDistance: options.connectionDistance != null ? options.connectionDistance : 120,
      particleSize: options.particleSize != null ? options.particleSize : 2,
      speed: options.speed != null ? options.speed : 1,
      color: options.color || '#409eff',
      opacity: options.opacity != null ? options.opacity : 0.6,
      mouseRadius: options.mouseRadius != null ? options.mouseRadius : 150,
      responsive: options.responsive !== false,
    };
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationFrame = null;
    this.resizeHandler = null;
  }

  ParticleBackground.prototype.init = function () {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  };

  ParticleBackground.prototype.resize = function () {
    var dpr = window.devicePixelRatio || 1;
    var rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  };

  ParticleBackground.prototype.createParticles = function () {
    this.particles = [];
    for (var i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: this.options.particleSize,
      });
    }
  };

  ParticleBackground.prototype.bindEvents = function () {
    var self = this;
    this.canvas.addEventListener('mousemove', function (e) {
      var rect = self.canvas.getBoundingClientRect();
      self.mouse.x = e.clientX - rect.left;
      self.mouse.y = e.clientY - rect.top;
    });
    this.canvas.addEventListener('mouseleave', function () {
      self.mouse.x = null;
      self.mouse.y = null;
    });
    if (this.options.responsive) {
      this.resizeHandler = function () { self.resize(); self.createParticles(); };
      window.addEventListener('resize', this.resizeHandler);
    }
  };

  ParticleBackground.prototype.drawParticle = function (particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.options.color;
    this.ctx.globalAlpha = this.options.opacity;
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  };

  ParticleBackground.prototype.drawConnection = function (p1, p2, distance) {
    var opacity = 1 - distance / this.options.connectionDistance;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = this.options.color;
    this.ctx.globalAlpha = opacity * this.options.opacity;
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  };

  ParticleBackground.prototype.updateParticle = function (particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
    // 鼠标排斥
    if (this.mouse.x != null) {
      var dx = particle.x - this.mouse.x;
      var dy = particle.y - this.mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.options.mouseRadius) {
        var angle = Math.atan2(dy, dx);
        var force = (this.options.mouseRadius - dist) / this.options.mouseRadius;
        particle.x += Math.cos(angle) * force * 2;
        particle.y += Math.sin(angle) * force * 2;
      }
    }
  };

  ParticleBackground.prototype.animate = function () {
    var self = this;
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.particles.length; i++) {
      this.updateParticle(this.particles[i]);
      this.drawParticle(this.particles[i]);
      for (var j = i + 1; j < this.particles.length; j++) {
        var dx = this.particles[i].x - this.particles[j].x;
        var dy = this.particles[i].y - this.particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.options.connectionDistance) {
          this.drawConnection(this.particles[i], this.particles[j], dist);
        }
      }
    }
    this.animationFrame = requestAnimationFrame(function () { self.animate(); });
  };

  ParticleBackground.prototype.destroy = function () {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    this.particles = [];
  };

  if (typeof window !== 'undefined') {
    window.ParticleBackground = ParticleBackground;
  }
})();