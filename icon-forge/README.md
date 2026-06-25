# icon-forge 🎨

> 一个**只做一件事**的图标生成技能：把 SVG path 或完整 SVG 批量渲染成 PNG。
> 说清「要哪些图标、什么颜色、放哪个目录」，AI 自动生成，无需手改脚本。

## 这是什么

`icon-forge` 是一个 Agent Skill（Claude Code / Codex 等通用）。它把「维护图标配置 → 一键批量渲染 PNG」固化成技能：

- 你用自然语言描述需求（图标语义、主题色、输出目录）；
- AI 按 heroicons / feather 语义补全 SVG path，写好 JSON 配置；
- 内置 `forge-icons.js`（基于 [sharp](https://sharp.pixelplumbing.com/)）批量渲染 PNG。

适合 **uniapp / 小程序 / React Native / H5** 等需要成套单色 PNG 图标的场景，避免手动导出、命名混乱、尺寸不一致。技能**自包含**：脚本、依赖、示例 SVG、文档全在本目录，clone 即用。

## 安装

仓库存源 + 本地软链接激活（与 `frontend-ui-foundry` 同款）：

```bash
# 软链接到个人技能目录（一次即可）
ln -s /你的路径/wg-skills/icon-forge ~/.claude/skills/icon-forge

# 安装依赖（sharp）
cd ~/.claude/skills/icon-forge && npm install
```

> Windows 原生符号链接需管理员/开发者模式；推荐用目录联接（无需管理员）：
> `mklink /J "%USERPROFILE%\.claude\skills\icon-forge" "D:\你的路径\wg-skills\icon-forge"`

## 使用

安装后直接对 AI 说需求即可触发，例如：

> 「给登录页生成一套图标，绿色 `#059669`，放 `src/static/icons/login`，要数据、看板、洞察、计划、记录、重测」

AI 会生成配置并运行 `forge-icons.js`，回报每个 `[OK] 路径`。

### 手动调用

```bash
cd ~/.claude/skills/icon-forge
# 从 stdin 传配置
echo '{"outDir":"./out","size":72,"color":"#059669","icons":[{"name":"data.png","path":"M9 12h6"}]}' | node forge-icons.js -
# 或从文件
node forge-icons.js spec.json
```

## 配置字段

| 字段 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `outDir` | ✅ | — | 输出目录，自动创建 |
| `size` | | `72` | 输出像素（正方形） |
| `color` | | `#059669` | 描边色（仅对 `path` 模式生效） |
| `strokeWidth` | | `2` | 描边宽度 |
| `icons[].name` | ✅ | — | 输出文件名（含 `.png`） |
| `icons[].path` | ※ | — | heroicons/feather 风格 path（viewBox `0 0 24 24`） |
| `icons[].svg` | ※ | — | 完整 SVG 字符串（可彩色/多色） |

※ `path` 与 `svg` 二选一。

完整配置示例：

```json
{
  "outDir": "../my-app/src/static/icons",
  "size": 72,
  "color": "#059669",
  "strokeWidth": 2,
  "icons": [
    { "name": "feature-data.png", "path": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { "name": "brand.png", "svg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#059669'><circle cx='12' cy='12' r='10'/></svg>" }
  ]
}
```

## 文件结构

```
icon-forge/
├── SKILL.md        # 技能定义（AI 读取：工作流 + 常用 path 速查）
├── forge-icons.js  # 生成器（Node + sharp）
├── package.json    # 依赖声明（sharp）
├── svgs/           # 示例 SVG 源（可作 path/svg 参考）
└── README.md       # 本文件
```

## 常见问题

**Q: 图标有白边或模糊？** SVG 用标准 `viewBox="0 0 24 24"`，输出尺寸用标准值（48 / 72 / 81）。

**Q: 要彩色/多色图标？** 用 `svg` 字段传完整 SVG，自带 `fill`/`stroke`；`color` 字段只对 `path` 模式生效。

**Q: 换电脑后失效？** 重新建软链接 + `npm install`（见「安装」）。

## License

MIT
