/**
 * 复选树节点（全局声明，`components/CheckboxTree.vue` 的数据契约，页面免导入使用）。
 *
 * ⚠️ 一旦出现 `export`，本文件变成模块，全局类型失效，故此处不写 export。
 */
interface CheckboxTreeNode {
  id: number;
  name: string;
  children?: CheckboxTreeNode[];
}
