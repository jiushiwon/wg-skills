# 表单页面模板

## 页面概述

用户信息填写、数据提交页面，支持多种表单布局和交互。

## 适用场景

- 用户资料编辑
- 地址管理
- 实名认证
- 申请表单
- 问卷调查

## 模板结构

```
form-page/
├── form-header.vue     # 表单头部
├── form-item.vue       # 表单项组件
├── form-group.vue      # 表单分组
├── form-validator.vue  # 表单验证
├── step-form.vue       # 步骤表单
└── mock.json
```

## 布局变体

### 变体1：简洁输入

```
┌─────────────────────────────┐
│  编辑资料                   │
├─────────────────────────────┤
│  头像                       │
│  ┌────┐                     │
│  │头像│  [点击更换]         │
│  └────┘                     │
├─────────────────────────────┤
│  昵称                       │
│  ┌─────────────────────┐   │
│  │ 请输入昵称           │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  性别                       │
│  ○ 男  ● 女                 │
├─────────────────────────────┤
│  生日                       │
│  ┌─────────────────────┐   │
│  │ 2024-01-01         >│   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  [保存]                     │
└─────────────────────────────┘
```

**特点**：
- 标签在字段上方
- 简洁布局
- 适合字段较少的表单

### 变体2：卡片分组

```
┌─────────────────────────────┐
│  完善信息                   │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 基础信息             │   │
│  ├─────────────────────┤   │
│  │ 昵称    [输入框]     │   │
│  ├─────────────────────┤   │
│  │ 性别    [选择器]    │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 联系方式             │   │
│  ├─────────────────────┤   │
│  │ 手机    [输入框]     │   │
│  ├─────────────────────┤   │
│  │ 邮箱    [输入框]    │   │
│  └─────────────────────┘   │
│                             │
│  [保存]                     │
└─────────────────────────────┘
```

**特点**：
- 卡片包裹分组
- 分组标题
- 适合字段较多的表单

### 变体3：步骤表单

```
┌─────────────────────────────┐
│  步骤1: 填写基本信息        │
│  ━━━━━━━○━━━━━━━          │
├─────────────────────────────┤
│                             │
│  昵称： [输入框]            │
│                             │
│  性别： [选择器]            │
│                             │
│  [下一步]                   │
│                             │
└─────────────────────────────┘
```

**特点**：
- 分步骤填写
- 进度指示
- 适合复杂表单
- 减少用户压力

## 表单项类型

### 1. 文本输入

```vue
<view class="form-item">
  <text class="label">昵称</text>
  <input class="input" v-model="form.nickname" placeholder="请输入昵称" />
</view>
```

### 2. 单选/多选

```vue
<view class="form-item">
  <text class="label">性别</text>
  <radio-group @change="onGenderChange">
    <label><radio value="1" />男</label>
    <label><radio value="2" />女</label>
  </radio-group>
</view>
```

### 3. 选择器

```vue
<view class="form-item" @click="showPicker">
  <text class="label">生日</text>
  <text class="value">{{ form.birthday }}</text>
  <text class="arrow">></text>
</view>
```

### 4. 上传图片

```vue
<view class="form-item">
  <text class="label">头像</text>
  <view class="upload-box">
    <image :src="form.avatar" />
    <view class="upload-icon">+</view>
  </view>
</view>
```

### 5. 开关

```vue
<view class="form-item">
  <text class="label">接收通知</text>
  <switch v-model="form.notify" />
</view>
```

### 6. 文本域

```vue
<view class="form-item">
  <text class="label">简介</text>
  <textarea class="textarea" v-model="form.bio" placeholder="请输入简介" />
</view>
```

## 验证规则

### 常用验证

| 类型 | 规则 | 提示 |
|------|------|------|
| 手机号 | /^1[3-9]\d{9}$/ | 请输入正确的手机号 |
| 邮箱 | /^[^\s@]+@[^\s@]+\.[^\s@]+$/ | 请输入正确的邮箱 |
| 密码 | /^.{6,20}$/ | 密码6-20位 |
| 必填 | - | 请填写此项 |
| 验证码 | /^\d{4,6}$/ | 请输入正确的验证码 |

### 验证提示位置

- 紧跟表单项下方
- 红色文字
- 错误图标

## 风格变体

### 风格1：简约现代

```scss
--bg-page: #F5F5F5;
--bg-card: #FFFFFF;
--text-primary: #333333;
--text-secondary: #999999;
--border: #E5E5E5;
--radius: 8px;
--focus-color: #333333;
```

### 风格2：活力炫彩

```scss
--bg-page: #FFFFFF;
--primary: #FF6B6B;
--focus-color: #FF6B6B;
--radius: 12px;
--shadow: 0 2px 12px rgba(255, 107, 107, 0.15);
```

### 风格3：高端商务

```scss
--bg-page: #0F0F1A;
--bg-card: #1A1A2E;
--text-primary: #FFFFFF;
--border: #2D2D44;
--accent: #D4AF37;
--focus-color: #D4AF37;
```

### 风格4：清新自然

```scss
--bg-page: #F0F9F6;
--bg-card: #FFFFFF;
--primary: #2ECC71;
--focus-color: #2ECC71;
--radius: 16px;
```

## 交互规范

1. **键盘适配**：输入框获取焦点时，页面不上移遮挡
2. **自动填充**：支持浏览器/系统自动填充
3. **错误定位**：验证失败时，页面滚动到错误项
4. **防重复提交**：提交按钮点击后禁用

## Mock数据

```json
{
  "formConfig": {
    "groups": [
      {
        "title": "基础信息",
        "items": [
          {
            "name": "nickname",
            "label": "昵称",
            "type": "input",
            "placeholder": "请输入昵称",
            "required": true
          },
          {
            "name": "gender",
            "label": "性别",
            "type": "radio",
            "options": [
              { "value": "1", "label": "男" },
              { "value": "2", "label": "女" }
            ]
          },
          {
            "name": "birthday",
            "label": "生日",
            "type": "picker",
            "mode": "date"
          }
        ]
      },
      {
        "title": "联系方式",
        "items": [
          {
            "name": "phone",
            "label": "手机号",
            "type": "input",
            "inputType": "tel",
            "required": true
          },
          {
            "name": "email",
            "label": "邮箱",
            "type": "input",
            "inputType": "email"
          }
        ]
      }
    ]
  }
}
```
