export interface DemoItem {
  id: string;
  title: string;
  summary: string;
  createdAt: number;
}

const MOCK_DATA: DemoItem[] = [
  {
    id: '1',
    title: '示例条目一',
    summary: '这是列表页的第一个示例条目，用于演示下拉刷新与空状态。',
    createdAt: Date.now() - 86400000,
  },
  {
    id: '2',
    title: '示例条目二',
    summary: '点击条目可进入表单页，表单支持校验与本地草稿。',
    createdAt: Date.now(),
  },
];

export function getDemoList(): Promise<DemoItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_DATA), 300);
  });
}
