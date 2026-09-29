# Remotion 核心概念速查

## 常用命令

```bash
# 安装依赖
npm install

# 预览
npx remotion preview

# 渲染
npx remotion render src/index.ts out/video.mp4

# 升级
npx remotion upgrade
```

## 核心 API

- `Composition`：定义一个可渲染的合成
- `useCurrentFrame()`：获取当前帧号
- `useVideoConfig()`：获取 fps、width、height、durationInFrames
- `interpolate()`：数值插值动画
- `spring()`：弹簧动画
- `Sequence`：按时间轴编排子组件
- `Audio`：嵌入音频

## 本模板约定

- `Root.tsx` 中只注册 Composition，不直接写视觉逻辑
- 视觉组件读取 `src/script.json`，不硬编码文案
- 所有动画基于 `useCurrentFrame()` 计算，不使用 CSS 动画
