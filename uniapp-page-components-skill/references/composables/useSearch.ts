/**
 * useSearch — 搜索 Composable
 * ============================================================
 * 配合 search-page 使用，统一搜索、历史记录、防抖逻辑。
 *
 * 使用方式：
 *   const { keyword, history, results, searching, search, addHistory, clearHistory }
 *     = useSearch((kw) => api.search(kw))
 *
 *   // 模板里：
 *   <search-page :keyword="keyword" :history-list="history"
 *                :result-list="results" @search="onSearch"
 *                @clear-history="clearHistory"
 *                @delete-history="removeHistory" />
 */

import { ref } from 'vue'

export function useSearch<T>(
  searcher: (keyword: string) => Promise<T[]>,
  options?: { debounce?: number; historyKey?: string },
) {
  const keyword = ref('')
  const history = ref<string[]>([])
  const results = ref<T[]>([])
  const searching = ref(false)

  const debounce = options?.debounce ?? 600
  const historyKey = options?.historyKey ?? '__search_history__'
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  // 从本地存储加载历史
  try {
    const stored = uni.getStorageSync(historyKey)
    if (Array.isArray(stored)) history.value = stored
  } catch { /* ignore */ }

  async function doSearch(kw: string) {
    if (!kw.trim()) {
      results.value = []
      return
    }
    keyword.value = kw.trim()
    searching.value = true
    try {
      results.value = await searcher(keyword.value)
    } finally {
      searching.value = false
    }
  }

  /** 输入防抖搜索 */
  function onInput(kw: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doSearch(kw), debounce)
  }

  /** 立即搜索并保存历史 */
  async function search(kw?: string) {
    const q = kw || keyword.value
    if (!q.trim()) return
    keyword.value = q.trim()
    addHistory(q.trim())
    await doSearch(q)
  }

  function addHistory(kw: string) {
    if (!kw.trim()) return
    const h = [kw, ...history.value.filter((v) => v !== kw)].slice(0, 10)
    history.value = h
    try { uni.setStorageSync(historyKey, h) } catch { /* ignore */ }
  }

  function clearHistory() {
    history.value = []
    try { uni.removeStorageSync(historyKey) } catch { /* ignore */ }
  }

  function removeHistory(kw: string) {
    history.value = history.value.filter((v) => v !== kw)
    try { uni.setStorageSync(historyKey, history.value) } catch { /* ignore */ }
  }

  return {
    keyword,
    history,
    results,
    searching,
    onInput,
    search,
    addHistory,
    clearHistory,
    removeHistory,
  }
}
