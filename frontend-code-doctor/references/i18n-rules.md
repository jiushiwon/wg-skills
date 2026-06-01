# i18n 国际化审查规则

本文档定义前端项目的国际化审查规则。

---

## 1. 硬编码文案检测

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-001 | JS/TS 文件中中文字符串 | Warning |
| I18N-002 | Vue 模板中硬编码中文 | Warning |
| I18N-003 | placeholder/text/label 硬编码 | Warning |
| I18N-004 | 报错信息未使用 i18n key | Warning |

### 检查模式

```bash
# 检查中文字符
Grep "[一-龥]" --output_mode content

# 检查 Vue 模板中的硬编码
Grep "(placeholder=|title=|alt=).*[一-龥]" --glob "*.vue" --output_mode content

# 检查 Toast/提示文字
Grep "(showToast|message|alert).*[一-龥]" --output_mode content
```

### 正确示例

```typescript
// 使用 t() 或 $t()
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// template
// {{ t('user.name') }}
// <input :placeholder="t('user.namePlaceholder')" />

// JS
toast(t('success.save'));
```

---

## 2. 翻译 key 命名规范

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-010 | key 命名不一致 | Warning |
| I18N-011 | 短横线命名未统一 | Warning |
| I18N-012 | 数字作为 key | Warning |

### 正确示例

```json
{
  "common": {
    "confirm": "确定",
    "cancel": "取消",
    "save": "保存"
  },
  "user": {
    "name": "用户名",
    "namePlaceholder": "请输入用户名"
  },
  "error": {
    "network": "网络错误",
    "server": "服务器错误"
  }
}
```

---

## 3. 复数形式

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-020 | 复数未使用 ICU 格式 | Warning |
| I18N-021 | 单复数 key 重复 | Warning |

### 正确示例

```json
{
  "itemCount": "{count, plural, =0 {没有项目} one {# 个项目} other {# 个项目}"
}
```

```typescript
t('itemCount', { count: 5 }); // 5 个项目
t('itemCount', { count: 0 }); // 没有项目
```

---

## 4. 占位符与参数

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-030 | 动态参数未使用占位符 | Error |
| I18N-031 | key 中包含变量值 | Error |

### 正确示例

```json
{
  "welcome": "欢迎 {name}",
  "itemsRemaining": "还剩 {count} 项"
}
```

```typescript
t('welcome', { name: user.name });
t('itemsRemaining', { count: remaining });
```

---

## 5. 语言切换

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-040 | 未保存语言偏好 | Warning |
| I18N-041 | 切换语言未刷新内容 | Warning |

### 正确示例

```typescript
const savedLocale = localStorage.getItem('locale') || 'zh-CN';

// 切换时通知
function setLocale(locale: string) {
  locale.value = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
}
```

---

## 6. RTL 支持（阿拉伯语/希伯来语）

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-050 | 方向样式硬编码 | Warning |
| I18N-051 | 图标方向未镜像 | Warning |
| I18N-052 | 箭头方向未适配 | Warning |

### 正确示例

```css
/* 使用 start/end 而非 left/right */
.my-component {
  margin-inline-start: 10px;
  padding-inline-end: 20px;
  text-align: start;
}
```

```typescript
// 镜像图标
import { Flip } from '@vueuse/core';
const iconClass = computed(() => 
  isRTL.value ? 'transform: scaleX(-1)' : ''
);
```

---

## 7. 日期/数字格式化

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| I18N-060 | 日期格式未本地化 | Warning |
| I18N-061 | 数字格式未本地化 | Warning |
| I18N-062 | 货币符号硬编码 | Warning |

### 正确示例

```typescript
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// 日期
const date = new Date().toLocaleDateString(locale.value);

// 数字
const num = 1234.56.toLocaleString(locale.value, {
  style: 'currency',
  currency: locale.value === 'en-US' ? 'USD' : 'CNY',
});
```