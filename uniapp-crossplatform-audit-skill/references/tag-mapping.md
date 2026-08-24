# H5 标签到 uniapp 组件映射表

> 本表用于将 H5 标签转换为 uniapp 兼容的组件

## 常用标签映射

| H5 标签 | uniapp 组件 | 示例 |
|---------|-------------|------|
| `<div>` | `<view>` | `<view class="container">...</view>` |
| `<span>` | `<text>` | `<text class="label">文字</text>` |
| `<p>` | `<text>` | `<text class="paragraph">段落</text>` |
| `<h1>` | `<text>` | `<text class="h1">标题1</text>` |
| `<h2>` | `<text>` | `<text class="h2">标题2</text>` |
| `<h3>` | `<text>` | `<text class="h3">标题3</text>` |
| `<h4>` | `<text>` | `<text class="h4">标题4</text>` |
| `<h5>` | `<text>` | `<text class="h5">标题5</text>` |
| `<h6>` | `<text>` | `<text class="h6">标题6</text>` |
| `<img>` | `<image>` | `<image src="/static/logo.png" mode="aspectFit" />` |
| `<a>` | `<text>` + `@tap` | `<text class="link" @tap="goLink">链接</text>` |
| `<ul>` | `<view>` + `v-for` | `<view class="list"><view v-for="...">...</view></view>` |
| `<ol>` | `<view>` + `v-for` | 同上 |
| `<li>` | `<view>` | `<view class="item">...</view>` |
| `<section>` | `<view>` | `<view class="section">...</view>` |
| `<article>` | `<view>` | `<view class="article">...</view>` |
| `<main>` | `<view>` | `<view class="main">...</view>` |
| `<header>` | `<view>` | `<view class="header">...</view>` |
| `<footer>` | `<view>` | `<view class="footer">...</view>` |
| `<nav>` | `<view>` | `<view class="nav">...</view>` |
| `<aside>` | `<view>` | `<view class="aside">...</view>` |
| `<table>` | `<view>` | 建议用 flex 布局重写 |
| `<tr>` | `<view>` | - |
| `<td>` | `<view>` | - |
| `<th>` | `<view>` | - |
| `<form>` | `<form>` | 可直接使用 |
| `<input>` | `<input>` | 可直接使用 |
| `<button>` | `<button>` | 可直接使用 |
| `<textarea>` | `<textarea>` | 可直接使用 |
| `<select>` | `<picker>` | 使用 picker 组件 |
| `<label>` | `<text>` | - |

## 样式等效

### 标题样式等效

```scss
// H5
h1 { font-size: 32px; font-weight: bold; }
h2 { font-size: 24px; font-weight: bold; }
h3 { font-size: 20px; font-weight: bold; }

// uniapp - 在 text 组件上应用
.h1 { font-size: 32rpx; font-weight: bold; }
.h2 { font-size: 24rpx; font-weight: bold; }
.h3 { font-size: 20rpx; font-weight: bold; }
```

### 链接样式等效

```scss
// H5
a { color: #1890ff; text-decoration: underline; }

// uniapp
.link { color: #1890ff; text-decoration: underline; }
```

### 段落样式等效

```scss
// H5
p { margin-bottom: 16px; line-height: 1.6; }

// uniapp
.paragraph { margin-bottom: 16rpx; line-height: 1.6; }
```

## 注意事项

1. **text 组件是行内元素**，如果需要块级效果，用 view
2. **image 组件默认宽高 300x225**，需要手动设置 width/height
3. **image 组件的 mode 属性** 替代了 CSS 的 object-fit
4. **链接需要自己实现跳转逻辑**，使用 @tap 事件

## 批量替换建议

如果是旧项目大量 H5 标签，可以使用正则批量替换（需人工复核）：

```
<div> → <view>
</div> → </view>
<span> → <text>
</span> → </text>
<p> → <text>
</p> → </text>
<img src= → <image src=
/> → />
```
