# 性能检查清单

> 本清单用于 `uniapp-code-audit-skill` 性能审计时参考。所有条目仅用于识别风险并输出报告，不输出修复方案。
> 提示：表格内"检测命令"列中的 `\|` 为 markdown 表格转义，实际执行时按 `|`（POSIX ERE 分组交替符）处理；命令基于 Unix 工具，Windows 环境可用内置 Grep 工具或 ripgrep（`rg`）替代。

## 1. 包体积

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 主包 > 2MB | P0 | 微信小程序主包超过限制，审核被拒 | 编译后主包大小 > 2MB | `uniapp-standard-skill` 4.1 / 微信小程序官方限制 | `du -sh dist/build/mp-weixin` |
| 总包 > 20MB | P0 | 小程序总包超过限制 | 编译后总包大小 > 20MB | 微信小程序官方限制 | `du -sh dist/build/mp-weixin` |
| `node_modules` 过大 | P2 | 依赖体积膨胀 | `node_modules` 占用明显过大 | `uniapp-app-generate-skill` | `du -sh node_modules` |
| 存在无用图片/资源 | P2 | 未引用资源仍被打包 | `static/` 或 `src/static/` 中存在未被引用的图片 | 通用工程规范 | 检查 `static/` 与 `src/static/` 中文件引用情况 |

## 2. 图片优化

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 大图未压缩 | P1 | 加载慢、包体积大 | 单张图片 > 100KB 或列表图 > 50KB | `uniapp-standard-skill` 4.4 | `find static src/static -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) -size +100k` |
| 图片尺寸过大 | P2 | 实际使用尺寸远小于原图 | 图片分辨率明显超出使用场景 | `uniapp-app-generate-skill` 3.4 | 检查 `static/images/` 中图片尺寸 |
| 大图作为 base64 | P1 | 显著增加包体积与 setData 压力 | 代码中出现超过 10KB 的 base64 图片 | `uniapp-app-generate-skill` 3.4 | `grep -rnE 'data:image/[^;]+;base64,[A-Za-z0-9+/=]{5000,}' src/` |
| 图片未懒加载 | P2 | 长列表/页面一次性加载全部图片 | `<image>` 组件未使用 `lazy-load` | `uniapp-standard-skill` 4.4 | `grep -rn '<image' src/ \| grep -v 'lazy-load'` |

## 3. 网络请求

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 请求未防抖/去重 | P1 | 重复点击导致重复请求 | 同一接口在 1 秒内可被多次触发且无 pending Promise 缓存 | `uniapp-standard-skill` R09 / `frontend-request-skill` | 检查 `src/api/request.ts` 与页面调用 |
| 请求未缓存 | P2 | 静态数据重复请求 | 配置类/字典类接口每次进入页面都重新请求 | `uniapp-standard-skill` 4.3 | 检查配置接口调用逻辑 |
| 大数据未分页 | P1 | 一次性返回/渲染大量数据 | 列表接口无分页参数或分页大小 > 20 | `uniapp-standard-skill` 4.3 | 检查 API 调用与页面渲染逻辑 |
| 请求未防重提交 | P2 | 提交类接口重复触发 | 表单提交无 loading 状态锁定 | `uniapp-standard-skill` R09 | 检查提交按钮与 API 调用 |
| 页面直接使用 `uni.request` | P1 | 缺少统一错误处理与拦截 | `src/pages/` 中出现 `uni.request(` | `uniapp-standard-skill` R17 / `uniapp-standardization-skill` 2.1 | `grep -rnE 'uni\.request\(' src/pages/` |

## 4. 长列表与渲染

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 长列表未分页/虚拟化 | P0 | 一次性渲染大量节点导致卡顿 | 列表数据 > 50 条且无分页或虚拟列表 | `uniapp-standard-skill` 4.1 / 4.3 | 检查列表页面逻辑 |
| 单个列表项节点过多 | P1 | 超出每屏节点建议上限 | 单个 `v-for` 项内部节点数 > 100 | `uniapp-standard-skill` 4.1 | 人工检查列表项模板 |
| 页面总节点数过多 | P1 | 超出页面总节点建议上限 | 页面节点总数 > 1000 | `uniapp-standard-skill` 4.1 | 人工评估或使用开发者工具 |
| 嵌套 `v-for` | P0 | 渲染性能差，违反红线 | 模板中存在嵌套 `v-for` | `uniapp-standard-skill` R01 | `grep -rnE 'v-for.*v-for' src/` |

## 5. setData 与渲染性能

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 单次 setData 数据量过大 | P1 | 单次数据量 > 100KB | 代码中一次性 setData 大对象 | `uniapp-standard-skill` 4.2 | 检查页面 setData 调用 |
| setData 调用频率过高 | P1 | 每秒调用 > 20 次 | 滚动/动画中频繁 setData | `uniapp-standard-skill` 4.2 | 检查高频事件回调 |
| 无 `:key` 的 `v-for` | P2 | 列表渲染效率低 | `v-for` 未绑定 `:key` | `uniapp-standard-skill` 4.2 | `grep -rnE 'v-for' src/ \| grep -v ':key'` |
| `wxs` 过度实时渲染 | P2 | 增加渲染负担 | 模板中大量使用 wxs 实时计算 | `uniapp-standard-skill` 4.2 | 检查 `.wxs` 文件与模板引用 |

## 6. 缓存策略

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 静态数据重复请求 | P2 | 浪费资源 | 字典/配置类接口未做缓存 | `uniapp-standard-skill` 4.3 | 检查 App.vue 或 store 中初始化逻辑 |
| 缓存未设置过期 | P2 | 数据可能长期不更新 | Storage 缓存无时间戳或过期判断 | 通用工程规范 | 检查缓存封装逻辑 |
| 缓存未清理 | P2 | 存储空间持续增长 | 未定期清理过期缓存 | 通用工程规范 | 检查缓存清理逻辑 |

## 7. 内存与生命周期

| 检查项 | 风险等级 | 风险描述 | 判定依据 | 参考标准 | 检测命令 |
|--------|----------|----------|----------|----------|----------|
| 定时器未清理 | P1 | 页面卸载后仍运行，导致内存泄漏 | `setInterval`/`setTimeout` 未在 `onUnmounted` 中清理 | 通用代码规范（内存与生命周期） | `grep -rnE 'setInterval\|setTimeout' src/ \| grep -v 'clear'` |
| 事件未解绑 | P1 | 页面卸载后事件仍触发 | `uni.$on` 等全局事件未在 `onUnmounted` 中 off | 通用代码规范（内存与生命周期） | 检查 `uni.$on` 与 `uni.$off` 配对 |
| 页面栈超限 | P1 | 调用 `navigateTo` 深度 > 10 导致跳转失败 | 页面跳转未合理选择 `redirectTo`/`reLaunch` | 微信小程序页面栈限制 | 检查 `uni.navigateTo` 使用场景 |

## 性能优化优先级参考

| 优先级 | 问题 | 影响 |
|--------|------|------|
| P0 | 主包超 2MB、长列表未分页 | 审核被拒或无法使用 |
| P1 | 图片未压缩、请求未防抖、setData 数据量过大 | 明显影响体验 |
| P2 | 缓存策略、命名不规范、无 key 的 v-for | 可维护性与体验 |
| P3 | 未使用代码、冗余资源 | 体积与维护成本 |
