import React, { useMemo } from 'react'
import './pagination.css'

export interface PaginationProps {
  /** 当前页码 */
  current?: number
  /** 每页条数 */
  pageSize?: number
  /** 总数据量 */
  total: number
  /** 页码变化回调 */
  onChange?: (page: number, pageSize: number) => void
  /** 分页器风格：default-简约 | rounded-圆角胶囊 | modern-现代紧凑 */
  variant?: 'default' | 'rounded' | 'modern'
  /** 是否显示页码输入跳转 */
  showQuickJumper?: boolean
  /** 是否显示总条数 */
  showTotal?: boolean
  /** 最多显示的页码按钮数量 */
  pagerCount?: number
  /** 替代页码 */
  pageSizeOptions?: number[]
  /** 每页条数变化回调 */
  onPageSizeChange?: (pageSize: number) => void
}

export default function Pagination({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  variant = 'default',
  showQuickJumper = false,
  showTotal = false,
  pagerCount = 7,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange
}: PaginationProps) {
  // 计算总页数
  const totalPage = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])

  // 生成页码数组
  const getPages = useMemo(() => {
    const pages: (number | '...')[] = []
    const half = Math.floor(pagerCount / 2)

    if (totalPage <= pagerCount) {
      // 总页数少于 pagerCount，全部显示
      for (let i = 1; i <= totalPage; i++) {
        pages.push(i)
      }
    } else {
      // 总页数大于 pagerCount，需要省略
      if (current <= half + 1) {
        // 左边固定
        for (let i = 1; i <= pagerCount - 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPage)
      } else if (current >= totalPage - half) {
        // 右边固定
        pages.push(1)
        pages.push('...')
        for (let i = totalPage - pagerCount + 2; i <= totalPage; i++) {
          pages.push(i)
        }
      } else {
        // 中间部分
        pages.push(1)
        pages.push('...')
        for (let i = current - half + 1; i <= current + half - 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPage)
      }
    }

    return pages
  }, [current, totalPage, pagerCount])

  // 处理页码点击
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPage && page !== current) {
      onChange?.(page, pageSize)
    }
  }

  // 处理每页条数变化
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10)
    onPageSizeChange?.(newPageSize)
    // 重置到第一页
    onChange?.(1, newPageSize)
  }

  // 处理快速跳转
  const handleQuickJumper = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value, 10)
      if (value >= 1 && value <= totalPage) {
        onChange?.(value, pageSize)
      }
    }
  }

  // 上一页
  const handlePrev = () => {
    if (current > 1) {
      onChange?.(current - 1, pageSize)
    }
  }

  // 下一页
  const handleNext = () => {
    if (current < totalPage) {
      onChange?.(current + 1, pageSize)
    }
  }

  if (totalPage === 0) {
    return null
  }

  return (
    <div className={`t-pagination t-pagination--${variant}`}>
      {/* 总条数 */}
      {showTotal && (
        <div className="t-pagination__total">
          共 <span className="t-pagination__total-num">{total}</span> 条
        </div>
      )}

      {/* 页码按钮 */}
      <div className="t-pagination__pagers">
        {/* 上一页 */}
        <button
          className={`t-pagination__btn t-pagination__btn--prev ${current <= 1 ? 't-pagination__btn--disabled' : ''}`}
          onClick={handlePrev}
          disabled={current <= 1}
        >
          上一页
        </button>

        {/* 页码 */}
        {getPages.map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              className={`t-pagination__btn t-pagination__num ${current === page ? 't-pagination__btn--active' : ''}`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="t-pagination__ellipsis">...</span>
          )
        ))}

        {/* 下一页 */}
        <button
          className={`t-pagination__btn t-pagination__btn--next ${current >= totalPage ? 't-pagination__btn--disabled' : ''}`}
          onClick={handleNext}
          disabled={current >= totalPage}
        >
          下一页
        </button>
      </div>

      {/* 每页条数选择 */}
      <div className="t-pagination__size">
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="t-pagination__size-select"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size} 条/页
            </option>
          ))}
        </select>
      </div>

      {/* 快速跳转 */}
      {showQuickJumper && (
        <div className="t-pagination__jumper">
          前往
          <input
            type="number"
            min={1}
            max={totalPage}
            defaultValue={current}
            onKeyDown={handleQuickJumper}
            className="t-pagination__jumper-input"
          />
          页
        </div>
      )}
    </div>
  )
}

/* 使用示例
import Pagination from './pagination'

function App() {
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleChange = (page, size) => {
    setCurrent(page)
    setPageSize(size)
    console.log('页码变化:', page, size)
  }

  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      total={156}
      onChange={handleChange}
      showTotal
      showQuickJumper
      // 三种风格：default | rounded | modern
      variant="default"
    />
  )
}
*/
