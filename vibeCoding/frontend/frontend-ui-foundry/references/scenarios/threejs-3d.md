# 场景：3D 沉浸（3D Immersive）

WebGL / Three.js / R3F 沉浸式体验、3D 产品展示、创意机构、AI 产品。**视觉冲击为主，UI 浮层克制**。

---

## 适用

- 3D 产品展示
- 创意机构作品集
- AI 产品官网
- 游戏化落地页
- 沉浸式品牌体验
- 数据可视化 3D

## 不适用

- 实用工具（用 `admin-dashboard`）
- 文档（用 `docs-site`）
- 移动端优先（性能要求高，桌面优先）

---

## 核心组件

| 组件 | 说明 |
|------|------|
| **Canvas (Full)** | 全屏 WebGL 画布 |
| **HUD Overlay** | 浮在 3D 上的 UI（标题、CTA） |
| **3D Hotspot** | 3D 场景中的交互点 |
| **Loading Screen** | 3D 资源加载进度 |
| **Progress Bar** | 滚动 / 时间轴进度 |
| **Navigation Hints** | 鼠标 / 触摸操作提示 |
| **Camera Controls** | 鼠标拖拽、滚轮缩放、惯性 |
| **Sound Toggle** | 音效开关（自动播放禁用） |
| **Performance Toggle** | 画质切换（高/中/低） |
| **Share / Screenshot** | 分享、截图 |

---

## 布局基线

### 全屏 Canvas + 浮层 UI

```css
.scene-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--color-surface);
}

.scene-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.scene-hud {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;  /* 让点击穿透到 canvas */
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: var(--space-6);
}

.scene-hud > * {
  pointer-events: auto;  /* HUD 内部可交互 */
}

.scene-hud-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-hud-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-hud-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
```

---

## 浮层 UI（HUD）

```html
<div class="scene-page">
  <canvas class="scene-canvas" />
  
  <div class="scene-hud">
    <!-- 顶栏：logo + 导航 -->
    <header class="scene-hud-top">
      <Logo />
      <nav class="hud-nav">
        <a class="hud-link">产品</a>
        <a class="hud-link">关于</a>
      </nav>
      <button class="btn-primary">立即体验</button>
    </header>
    
    <!-- 中部：标题（可选） -->
    <div class="scene-hud-center">
      <div class="hud-hero">
        <h1 class="hud-title">未来已来</h1>
        <p class="hud-subtitle">实时 3D 渲染，零延迟交互</p>
      </div>
    </div>
    
    <!-- 底部：操作提示 + 控制 -->
    <footer class="scene-hud-bottom">
      <div class="hud-hint">
        <Icon name="mouse" />
        <span>拖拽旋转 · 滚轮缩放</span>
      </div>
      <div class="hud-controls">
        <button class="hud-btn" aria-label="重置视角">↻</button>
        <button class="hud-btn" aria-label="全屏">⛶</button>
        <button class="hud-btn" aria-label="声音">🔇</button>
      </div>
    </footer>
  </div>
</div>
```

```css
.hud-title {
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: white;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.hud-link {
  color: white;
  opacity: 0.85;
  font-weight: var(--font-weight-medium);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  transition: opacity 200ms;
}

.hud-link:hover {
  opacity: 1;
}

.hud-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: white;
  opacity: 0.6;
  font-size: var(--font-size-sm);
}

.hud-controls {
  display: flex;
  gap: var(--space-2);
}

.hud-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 200ms;
}

.hud-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## 加载屏幕

```html
<div class="loading-screen">
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <div class="loading-progress">
      <div class="loading-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <p class="loading-text">正在加载 3D 资源... {{ progress }}%</p>
    <p class="loading-hint">首次加载可能需要几秒</p>
  </div>
</div>
```

```css
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: var(--z-max);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 600ms var(--ease-out-quart);
}

.loading-screen.is-loaded {
  opacity: 0;
  pointer-events: none;
}

.loading-progress {
  width: 240px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin: var(--space-4) 0;
}

.loading-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 200ms linear;
}
```

---

## 性能优化

### 渲染优化

```js
// 1. 资源懒加载
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// 2. 几何体共享
const sharedGeometry = sphereGeometry.clone();

// 3. 材质按需创建
const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMapIntensity: 1.0,
});

// 4. 像素比限制
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 5. 视锥剔除
const frustum = new THREE.Frustum();
const matrix = new THREE.Matrix4();

// 6. 阴影优化
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
```

### 性能等级切换

```js
function getPerformanceLevel() {
  const renderer = ...;
  const gl = renderer.getContext();
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  
  if (/Apple M[1-9]|RTX|GTX|Radeon Pro/i.test(gpu)) {
    return 'high';
  } else if (/Intel|Quadro/i.test(gpu)) {
    return 'medium';
  }
  return 'low';
}
```

### 帧率控制

```js
let lastTime = 0;
const targetFPS = 60;
const interval = 1000 / targetFPS;

function animate(currentTime) {
  requestAnimationFrame(animate);
  const delta = currentTime - lastTime;
  if (delta < interval) return;
  lastTime = currentTime - (delta % interval);
  
  // 渲染逻辑
  renderer.render(scene, camera);
}
```

---

## 交互模式

### 相机控制（OrbitControls）

```js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.5;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
```

### 3D Hotspot

```js
// 把屏幕坐标投影到 3D
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspots);
  
  if (intersects.length > 0) {
    const hotspot = intersects[0].object;
    showHotspotDetail(hotspot.userData);
  }
});
```

---

## 关键 Token 偏向

```css
/* 暗色为主（沉浸感） */
--color-surface: oklch(0.10 0.02 280);
--color-primary: oklch(0.70 0.20 320);  /* 霓虹紫/青 */

/* 圆角中等，浮层用玻璃 */
--radius-hud: var(--radius-md);
--radius-button: var(--radius-md);

/* 字体大、戏剧 */
--font-size-h1: clamp(3rem, 8vw, 7rem);
--font-size-h2: clamp(2rem, 5vw, 4rem);

/* 动效丰富 */
--duration-3d-load: 1500ms;
--duration-camera: 800ms;
--ease-camera: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 推荐调色板

- **3D 沉浸**（默认）— 紫黑 + 霓虹
- **数据深色**（冷色）— 数据可视化
- **创意广告**（白底）— 消费产品展示
- **金融稳重** — 高端品牌 3D 展示

---

## 反模式

- ❌ 自动播放视频/音频（无障碍）
- ❌ 强制 WebGL 不可降级
- ❌ 鼠标光标自定义到看不见
- ❌ 没有加载进度
- ❌ 性能差不提供降级
- ❌ 没有 FPS 显示
- ❌ 移动端直接上 desktop 级 3D（必须降级）
- ❌ 装饰性发光/眩光干扰内容
- ❌ 相机自动旋转无法停止
- ❌ 滚动监听卡顿

---

## 可访问性

- 提供 **2D 降级版**（不支持 WebGL 时）
- **键盘操作** 替代鼠标拖拽（方向键旋转）
- **prefers-reduced-motion** 时关闭自动旋转、镜头动画
- **色彩对比度** 文字 ≥4.5:1（深色背景用浅色文字）
- **可关闭** 装饰动画和音效
- **alt / aria-label** 描述 3D 内容

---

## 性能预算

| 设备等级 | FPS | DPR | 阴影 | 像素比 |
|---------|-----|-----|------|--------|
| 高 | 60 | 2 | 1024×1024 | ≤2 |
| 中 | 30 | 1.5 | 512×512 | ≤1.5 |
| 低 | 30 | 1 | 无阴影 | 1 |
| 移动端 | 30 | 1 | 无 | 1 |

**加载预算**：3D 资源总大小 ≤ 10MB（移动端 ≤ 5MB）

---

## 验证清单

- [ ] 全屏 Canvas + 浮层 UI
- [ ] 加载进度可见
- [ ] 性能等级自适应
- [ ] 移动端降级
- [ ] 不支持 WebGL 降级到 2D
- [ ] 鼠标 / 触摸 / 键盘都能操作
- [ ] prefers-reduced-motion 支持
- [ ] 触摸目标 ≥44pt（HUD 按钮）
- [ ] 文字对比度 ≥4.5:1
- [ ] 没有 AI slop
- [ ] 帧率稳定 30-60fps
