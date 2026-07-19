# icon-catch-skill — 图标抓取子技能

输入语义关键词，从 Iconify 聚合的多个开源图标库中搜索并下载 SVG 图标。**免费、无需 Key**。

完整抓取流程与规范见 [SKILL.md](SKILL.md)。

## 快速使用

对 Claude 说：

```
帮我抓一个 home 图标
给"个人中心、订单、设置"三个入口各配一个图标，灰色 24px
把页面里的 Emoji 都换成 lucide 专业图标
```

Claude 会询问你想用的图标库，确认后直接调用 Iconify API 下载到项目目录。

图标下载完成后，如果你需要「展示图标」样式，可以直接说：

```
图标展示
展示图标
图标样式
给这个图标加上展示背景
输出图标展示 class
图标容器样式
```

Claude 会输出一个 `.icon-box` 公共 class（居中 icon + 圆角正方形浅色背景）。

## 目录说明

- `SKILL.md` — 完整抓取流程与规范
- `references/icon-sources.md` — 图标库对照、选择策略、中英文映射

## 图标展示

抓取完成后，可额外输出一个 `.icon-box` 公共 class，效果为：icon 居中、正方形背景、圆角、浅色主题色背景。

```css
.icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--color-primary-light, rgba(59, 130, 246, 0.12));
}

.icon-box svg,
.icon-box image,
.icon-box img {
  width: 24px;
  height: 24px;
  color: var(--color-primary, #3B82F6);
}
```

使用示例：

```html
<view class="icon-box">
  <image src="/static/icons/home.svg" />
</view>
```

## 备注

- 默认优先级：Iconify 聚合 → lucide → tabler → heroicons → phosphor → remix → feather → simple-icons → mdi
- 搜不到时换英文词重试；仍不行建议改用 `icon-forge` 技能生成
- 需要 PNG 时，建议优先使用 SVG；确需 PNG 可用 `icon-forge` 或其他渲染工具
