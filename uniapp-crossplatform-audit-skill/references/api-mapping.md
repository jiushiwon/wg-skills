# 浏览器 API 到 uniapp API 映射表

> 本表用于将浏览器/Node.js API 转换为 uniapp 兼容的 API

## 网络请求

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `fetch(url, options)` | `uni.request({ url, method, data, ... })` | 网络请求 |
| `axios` | `uni.request` (或保留 axios) | 建议用 uni.request |
| `XMLHttpRequest` | `uni.request` | - |

```javascript
// 浏览器
fetch('/api/user').then(res => res.json())

// uniapp
uni.request({
  url: '/api/user',
  success: (res) => { /* 处理数据 */ }
})

// 或者使用 async/await
const res = await uni.request({ url: '/api/user' })
```

## 路由与导航

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `window.location.href` | `uni.navigateTo({ url })` | 跳转页面 |
| `window.location.hash` | `uni.switchTab` / `uni.reLaunch` | Tab 切换 |
| `history.back()` | `uni.navigateBack()` | 返回 |
| `window.open(url)` | `uni.navigateToMiniProgram()` | 跳转小程序 |

```javascript
// 浏览器
window.location.href = '/pages/profile/profile'

// uniapp
uni.navigateTo({ url: '/pages/profile/profile' })
uni.switchTab({ url: '/pages/index/index' })
uni.navigateBack()
```

## 本地存储

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `localStorage.setItem(k, v)` | `uni.setStorageSync(k, v)` | 存储 |
| `localStorage.getItem(k)` | `uni.getStorageSync(k)` | 读取 |
| `localStorage.removeItem(k)` | `uni.removeStorageSync(k)` | 删除 |
| `localStorage.clear()` | `uni.clearStorageSync()` | 清空 |

```javascript
// 浏览器
localStorage.setItem('token', 'xxx')
const token = localStorage.getItem('token')

// uniapp - 推荐 sync 版本
uni.setStorageSync('token', 'xxx')
const token = uni.getStorageSync('token')

// 也支持 async 版本
uni.setStorage({ key: 'token', data: 'xxx' })
```

## 弹窗与提示

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `alert(msg)` | `uni.showToast({ title: msg })` | 轻提示 |
| `confirm(msg)` | `uni.showModal({ title: '提示', content: msg })` | 确认框 |
| `prompt(msg)` | `uni.showModal` + input | 输入框 |

```javascript
// 浏览器
alert('操作成功')

// uniapp
uni.showToast({ title: '操作成功' })
uni.showToast({ title: '操作成功', icon: 'none' }) // 不显示图标

// 确认框
uni.showModal({
  title: '提示',
  content: '确定要删除吗？',
  success: (res) => {
    if (res.confirm) { /* 确认 */ }
  }
})
```

## 计时器

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `setTimeout(fn, ms)` | `setTimeout(fn, ms)` | 定时器（可用） |
| `setInterval(fn, ms)` | `setInterval(fn, ms)` | 定时器（可用） |
| `clearTimeout(id)` | `clearTimeout(id)` | 清除定时器 |
| `clearInterval(id)` | `clearInterval(id)` | 清除定时器 |

```javascript
// uniapp 中与浏览器完全一致
const timer = setTimeout(() => { /* ... */ }, 1000)
clearTimeout(timer)
```

## 系统信息

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `navigator.userAgent` | `uni.getSystemInfoSync()` | 系统信息 |
| `window.devicePixelRatio` | `uni.getSystemInfoSync().pixelRatio` | 像素比 |
| `window.innerWidth` | `uni.getSystemInfoSync().windowWidth` | 窗口宽度 |
| `screen.width` | `uni.getSystemInfoSync().screenWidth` | 屏幕宽度 |

```javascript
// 浏览器
const isMobile = /Mobile/.test(navigator.userAgent)

// uniapp
const sysInfo = uni.getSystemInfoSync()
const isMobile = sysInfo.platform === 'ios' || sysInfo.platform === 'android'
```

## 页面与滚动

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `window.scrollTo(x, y)` | `uni.pageScrollTo({ scrollTop: y })` | 滚动到位置 |
| `element.scrollIntoView()` | `uni.createSelectorQuery()` | 元素滚动到可见区 |
| `window.scrollY` | `onPageScroll` 生命周期 | 监听滚动 |

```javascript
// 滚动到顶部
uni.pageScrollTo({ scrollTop: 0, duration: 300 })

// 获取元素位置
const query = uni.createSelectorQuery()
query.select('#id').boundingClientRect(data => {
  console.log(data.top)
}).exec()
```

## 分享

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| `navigator.share()` | `uni.showShareMenu()` | 分享菜单 |
| - | `onShareAppMessage()` | 定制分享内容 |

```javascript
// 页面中定义
onShareAppMessage(() => {
  return {
    title: '分享标题',
    path: '/pages/index/index'
  }
})

// 显示分享按钮
uni.showShareMenu()
```

## 登录

| 浏览器 API | uniapp API | 说明 |
|------------|------------|------|
| OAuth 流程 | `uni.login()` | 微信登录 |
| - | `uni.getUserProfile()` | 获取用户信息 |

```javascript
// 微信小程序登录
uni.login({
  provider: 'weixin',
  success: (loginRes) => {
    // 获得 code，换取 token
  }
})

// 获取用户信息（新接口）
uni.getUserProfile({
  desc: '用于完善用户资料',
  success: (res) => {
    // res.userInfo
  }
})
```

## 条件编译示例

当需要区分平台时：

```javascript
// #ifdef MP-WEIXIN
uni.login({ provider: 'weixin', ... })
// #endif

// #ifdef H5
// H5 登录逻辑
// #endif

// #ifdef APP-PLUS
// App 登录逻辑
// #endif
```

## 禁止使用

以下浏览器 API 在 uniapp 小程序端**完全不可用**：

- `document` 相关：getElementById、querySelector、createElement 等
- `window` 相关：open、close、scrollTo（用 uni API）
- `localStorage` 以外：sessionStorage 不存在
- `fetch` 以外的网络 API
- 任何操作 DOM 的方式
