# 一致性基线决策

## 决策顺序

| 优先级 | 来源 | 报告标记 | 是否可自动修复 |
|---|---|---|---|
| 1 | 项目 Token、组件 API、设计规范 | 已确认基线 | 是，仍需用户确认 |
| 2 | 已接入公共组件 / UI 库 | 已确认基线 | 是，仍需用户确认 |
| 3 | 多页面稳定复用且可访问的实现 | 建议基线 | 否，先确认 |
| 4 | 出现频率最高的实现 | 待确认基线 | 否 |

## 不可直接取众数的情况

- 已有主题 Token，但历史页面还未迁移。
- 公共组件支持多个合规 Variant。
- 一个高频旧组件本身不满足可访问性或响应式要求。
- 不同终端、不同密度、不同业务风险等级的页面本应有不同规格。

## 基线文件格式

仅在用户确认后写 `<项目>/docs/ui-consistency-baseline.md`：

```markdown
# UI Consistency Baseline

## 事实来源
- Token：src/styles/tokens.css
- Button：src/components/base-button.vue

## 已确认契约
| 类型 | 基线 | 来源 |
|---|---|---|
| 列表搜索框 | 左图标 + 统一 md 高度 + clearable | SearchField |
| 主按钮 | primary / md / loading 支持 | BaseButton |

## 允许例外
| 页面 | 组件 | 差异 | 原因 |
|---|---|---|---|
| campaign/hero | 搜索框 | 无左图标 | 沉浸式营销视觉 |
```

基线文件是团队后续审查的输入，不是替代主题或组件 Skill 的第二份实现规范。
