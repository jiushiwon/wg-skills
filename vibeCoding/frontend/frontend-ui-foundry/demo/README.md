# Frontend UI Foundry — 联调 Demo

这个 demo 演示 `frontend-ui-foundry` SKILL 的端到端工作流。

## 演示内容

1. **Forge**：用 `forge admin-dashboard --brand supabase --stack react-nextjs` 生成一个 Next.js 后台 demo
2. **Optimize**：对 demo 跑优化（用 conservative 策略）
3. **Audit**：跑一次设计 + 代码审查
4. **Tokens**：导出 Token 到多平台

## 目录

```
demo/
├── README.md
├── before/                  # 优化前的"野生"代码
│   └── ...
└── after/                   # 优化后的统一代码
    └── ...
```

## 演示流程

```bash
# 1. Forge：生成 admin dashboard
cd demo
forge admin-dashboard --brand supabase --stack react-nextjs

# 2. 演示 Optimize：对一个未统一的项目跑优化
node ../scripts/detect-stack.mjs ./before
node ../scripts/extract-tokens.mjs ./before > before-tokens.json
node ../scripts/match-profile.mjs before-tokens.json > before-profile.json
# 看到：当前是混乱的中性灰，匹配到 data-dark 0.65
# 应用 gradual 策略
optimize ./before --strategy gradual

# 3. 演示 Audit
audit ./after --depth standard

# 4. 演示 Tokens 多平台导出
tokens export tailwind --output ./after/tailwind.config.ts
tokens export css --output ./after/tokens.css
tokens export swift --output ./after/Theme.swift
```

## 验证脚本

`verify.sh` 一键跑完所有 demo + 验证：

```bash
bash verify.sh
```

输出：
- Forge 生成的截图
- Optimize 报告（`optimize-report.md`）
- Audit 报告（`audit-report.md`）
- Token 导出文件
