/**
 * usePageList — 分页列表 Composable
 * ============================================================
 * 配合 tab-list-page / home-page / search-page 使用，
 * 统一分页、刷新、加载更多、列表重置逻辑。
 *
 * 使用方式：
 *   const { list, loading, finished, loadMore, refresh, reset }
 *     = usePageList((page, size) => api.getOrders(page, size))
 *
 *   // 模板里直接绑：
 *   <tab-list-page :list="list" :loading="loading" :finished="finished"
 *                   @load-more="loadMore" />
 */

import { ref } from 'vue'

interface PageResult<T> {
  list: T[]
  total?: number
}

export function usePageList<T>(
  fetcher: (page: number, pageSize: number) => Promise<PageResult<T>>,
  options?: { pageSize?: number; immediate?: boolean },
) {
  const pageSize = options?.pageSize ?? 10
  const immediate = options?.immediate ?? true

  const list = ref<T[]>([])
  const page = ref(1)
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)
  const total = ref(0)

  let lock = false

  async function doFetch(p: number) {
    if (lock) return
    lock = true
    refreshing.value = p === 1 && list.value.length > 0
    loading.value = true

    try {
      const res = await fetcher(p, pageSize)
      if (p === 1) {
        list.value = res.list
      } else {
        list.value = [...list.value, ...res.list]
      }
      total.value = res.total ?? 0
      finished.value = res.list.length < pageSize
      page.value = p
    } finally {
      loading.value = false
      refreshing.value = false
      lock = false
    }
  }

  async function loadMore() {
    if (finished.value || loading.value) return
    await doFetch(page.value + 1)
  }

  async function refresh() {
    await doFetch(1)
  }

  /** 重置列表后重新加载（如切换 tab） */
  async function reset() {
    list.value = []
    page.value = 1
    finished.value = false
    await doFetch(1)
  }

  if (immediate) {
    doFetch(1)
  }

  return { list, page, total, loading, finished, refreshing, loadMore, refresh, reset }
}
