# 测试指南

一句话：VibeCoding 场景下的测试策略建议。

## 测试分层

| 层级 | 工具 | 覆盖场景 |
|------|------|----------|
| 单元测试 | Vitest / Jest | 工具函数、Hook |
| 组件测试 | Vitest + Testing Library | 组件渲染、交互 |
| E2E 测试 | Playwright / Cypress | 关键用户流程 |

## 测试优先级

1. **关键业务流程**：下单、支付、登录
2. **核心业务逻辑**：计算、转换
3. **边缘情况**：空数据、错误输入

## 前端测试建议

```typescript
// 组件测试示例
import { render, screen } from '@testing-library/vue';
import LoginForm from './LoginForm.vue';

test('登录表单提交', async () => {
  render(LoginForm);
  await fireEvent.update(screen.getByLabelText('用户名'), 'test');
  await fireEvent.click(screen.getByText('登录'));
  // 断言...
});
```

## VibeCoding 测试策略

- 不追求 100% 覆盖率
- 优先覆盖核心路径
- 使用 AI 生成测试用例（节省时间）
