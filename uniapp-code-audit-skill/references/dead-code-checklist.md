# 冗余与死代码检查清单

> 本清单用于 `uniapp-code-audit-skill` 冗余代码/静态资源审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 目标：识别打包产物中不应存在的**未引用页面、未引用组件、未引用静态资源、死代码、重复实现**，直接关联包体积与可维护性。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 未引用的页面

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 页面文件未注册到 pages.json | P1 | 页面文件存在但不参与打包路由，属于冗余 | `src/pages/` 下有 `.vue` 文件但 `pages.json` 未声明 | `uniapp-app-generate-skill/references/project-structure.md` | 比对 `find src/pages -name '*.vue'` 与 `pages.json` 的 `pages`/`subPackages` 列表 |
| 已删除/废弃页面残留 | P2 | 旧版本页面未清理 | 存在明显废弃（备份目录、`_old`、`_bak` 后缀）的页面文件 | 通用工程规范 | `find src/pages -name '*_old*' -o -name '*_bak*' -o -name '*backup*'` |
| 页面重复实现 | P2 | 功能近似页面多套实现 | 多个页面实现同一业务场景但无差异 | 通用工程规范 | 人工比对页面文件 |
| 分包内页面长期无入口 | P3 | 分包资源浪费 | `subPackages` 中页面无任何跳转入口 | 通用工程规范 | 检查 `uni.navigateTo`/`switchTab` 引用的路径 |

## 2. 未引用的组件

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| components 中组件未被引用 | P2 | 组件文件存在但无页面 import | `src/components/` 下组件未被任何 `.vue` 引用 | `uniapp-app-generate-skill/references/component-standards.md` | 对 `src/components/**/*.vue` 逐个 `grep -rl '组件名' src/pages/ src/components/` |
| 公共组件内部存在未用子组件 | P2 | 子组件无调用方 | 组件目录下子组件未被父组件引用 | 通用工程规范 | 检查组件目录依赖关系 |
| 组件重复实现 | P2 | 相似组件多套实现 | 两个及以上组件功能一致但命名不同 | 通用工程规范 | 人工比对组件功能 |

## 3. 未引用的静态资源

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 静态图片未被引用 | P2 | 资源仍被打包 | `src/static/` 下图片未出现在任何代码/样式引用中 | `uniapp-app-generate-skill/references/static-assets-guide.md` | 对 `src/static/**/*.{png,jpg,jpeg,webp,svg,gif}` 逐个搜索引用 |
| 大体积冗余资源 | P1 | 未被引用的超大文件 | `src/static/` 中存在 > 500KB 且未被引用的资源 | 通用工程规范 | `find src/static -type f -size +500k` 后比对引用 |
| tabBar 图标文件缺失 | P2 | 打包后图标空白 | `pages.json` 的 `tabBar.list.iconPath` 指向不存在的文件 | `uniapp-app-generate-skill/references/mini-program-checklist.md` | 校验 `pages.json` 图标路径 |
| 字体/动画等静态资源未被引用 | P2 | 资源浪费 | `src/static/fonts/`、`src/static/animation/` 等目录存在未引用文件 | 通用工程规范 | 比对目录文件与代码引用 |

## 4. 死代码

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未使用的工具函数 | P2 | `src/utils/` 存在未被调用的导出函数 | 导出函数未被任何业务代码 import | `uniapp-standard-skill` R08 | 对 `src/utils/*.ts` 的导出逐个 `grep -rl '函数名' src/` |
| 未使用的 API 模块 | P2 | `src/api/modules/` 存在未被调用接口 | 接口模块未被页面/store 引用 | `uniapp-app-generate-skill/references/project-structure.md` | 检查 `src/api/modules/*.ts` 的 import 情况 |
| 注释掉的代码块 | P3 | 增加维护噪音 | 存在整段被注释的旧逻辑 | 通用工程规范 | `grep -rnE '^\s*//.*(const\|function\|return\|if )' src/` |
| 仅定义未使用的常量/枚举 | P3 | 冗余定义 | `src/constants/` 存在未被引用的常量/枚举 | 通用工程规范 | 比对常量文件与引用 |
| 不可达分支 | P3 | 逻辑冗余 | 存在永远不执行的分支（如条件恒为 false） | 通用工程规范 | 人工检查疑似死分支 |
| `export default` 后无使用方 | P2 | 模块级冗余 | `.vue`/`.ts` 文件无任何 import 方 | 通用工程规范 | 逐个文件搜索 import |

## 5. 冗余依赖

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 未被引用的 npm 依赖 | P3 | 增大包体积与安装时间 | `package.json` 依赖未被任何源码 import | 通用工程规范 | `npx depcheck` 或逐个搜索 import |
| 重复功能依赖 | P2 | 多个库做同一件事 | 同时依赖功能重叠的库（如多个请求库/图标库） | 通用工程规范 | 人工比对 `package.json` |
| 依赖锁定缺失 | P3 | 构建结果不稳定 | 无 `package-lock.json`/`pnpm-lock.yaml`/`yarn.lock` | 通用工程规范 | `ls package-lock.json pnpm-lock.yaml yarn.lock` |

## 冗余与死代码评分参考

| 级别 | 描述 |
|------|------|
| A | 无未引用页面/组件/资源，无死代码 |
| B | 少量 P3 冗余，不影响包体积与维护 |
| C | 存在 P2 未引用组件/页面/资源，包体积与维护受影响 |
| D | 大量冗余文件与死代码，包体积膨胀明显 |
