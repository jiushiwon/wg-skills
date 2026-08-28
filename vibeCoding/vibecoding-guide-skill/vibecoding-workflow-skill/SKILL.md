---
name: vibecoding-workflow-skill
description: VibeCoding 产品落地全流程导师：工具/模型/IDE 选型、提示词、产品模块拆解、开发、联调、测试、部署推荐。最终生成 docs/vibecoding/roadmap.md。触发词：/vibecoding-workflow、我要做商城、帮我选型模型、前后端怎么联调。
---

# VibeCoding Workflow Skill

本技能覆盖从工具选型到产品部署的完整 VibeCoding 落地流程，只推荐不执行。

## 使用方式

### 完整规划
用户描述水平和目标后，生成 `docs/vibecoding/roadmap.md`。

示例：

```
/vibecoding-workflow
我想做一个商城小程序
```

### 快捷入口
直接询问某个阶段，返回对应参考资料内容：

- 模型/IDE 选型
- 提示词怎么写
- 电商系统怎么做
- 前后端怎么联调
- 怎么测试
- 怎么部署

## 红线

- 不调用其他 skill。
- 不替用户执行安装、部署、生成代码。
- 模型价格和可用性信息必须加"需自行核实最新信息"提示。
