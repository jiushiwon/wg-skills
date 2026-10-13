# Go Module Skills

Go 后端模块技能集合

## 包含的技能

| 技能 | 功能 |
|------|------|
| `go-storage-module-skill` | 文件存储（本地/OSS/COS） |

## 设计原则

每个 module 独立可叠加，可以按需选择组装。

## 使用方式

```bash
# 选择需要的模块叠加到 go-gin-init-skill 生成的项目
cp -r go-storage-module-skill/* my-project/
```

## 与 go-auth-module-skill 的关系

- `go-auth-module-skill` - 权限底座（必选）
- `go-module/*` - 业务模块（按需叠加）
