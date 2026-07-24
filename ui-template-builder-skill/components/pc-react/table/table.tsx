import React, { useState, useMemo } from 'react'
import './table.css'

export interface Column {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableProps {
  columns: Column[]
  data: any[]
  rowKey?: string
  stripe?: boolean
  border?: boolean
  hoverable?: boolean
  emptyText?: string
  pagination?: boolean
  pageSize?: number
  currentPage?: number
  onSort?: (key: string, order: 'asc' | 'desc' | '') => void
  onRowClick?: (row: any, index: number) => void
  onPageChange?: (page: number) => void
  /** 表格风格：default-简约线条 | elegant-优雅边框 | gradient-渐变表头 */
  variant?: 'default' | 'elegant' | 'gradient'
}

export default function Table({
  columns,
  data,
  rowKey = 'id',
  stripe = true,
  border = false,
  hoverable = true,
  emptyText = '暂无数据',
  pagination = false,
  pageSize = 10,
  currentPage: currentPageProp = 1,
  onSort,
  onRowClick,
  onPageChange,
  variant = 'default'
}: TableProps) {
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('')
  const [currentPage, setCurrentPage] = useState(currentPageProp)

  // 排序处理
  const handleSort = (column: Column) => {
    if (!column.sortable) return

    let newOrder: 'asc' | 'desc' | '' = 'asc'
    if (sortKey === column.key) {
      if (sortOrder === 'asc') newOrder = 'desc'
      else if (sortOrder === 'desc') newOrder = ''
    }

    setSortKey(newOrder ? column.key : '')
    setSortOrder(newOrder)
    onSort?.(newOrder ? column.key : '', newOrder)
  }

  // 处理后的数据
  const sortedData = useMemo(() => {
    let result = [...data]

    if (sortKey && sortOrder) {
      result.sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    }

    return result
  }, [data, sortKey, sortOrder])

  // 分页数据
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, pagination, currentPage, pageSize])

  // 总页数
  const totalPage = Math.ceil(data.length / pageSize)

  // 上一页
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      onPageChange?.(newPage)
    }
  }

  // 下一页
  const handleNextPage = () => {
    if (currentPage < totalPage) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      onPageChange?.(newPage)
    }
  }

  return (
    <div
      className={`t-table t-table--${variant} ${stripe ? 't-table--stripe' : ''} ${border ? 't-table--border' : ''}`}
    >
      {/* 表头 */}
      <div className="t-table__header">
        <div className="t-table__row">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`t-table__cell t-table__header-cell ${column.sortable ? 't-table__cell--sortable' : ''}`}
              style={{ width: column.width, textAlign: column.align || 'left' }}
              onClick={() => handleSort(column)}
            >
              <span>{column.title}</span>
              {column.sortable && (
                <span className="t-table__sort-icons">
                  <span className={sortKey === column.key && sortOrder === 'asc' ? 't-table__sort-active' : ''}>↑</span>
                  <span className={sortKey === column.key && sortOrder === 'desc' ? 't-table__sort-active' : ''}>↓</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 表体 */}
      <div className="t-table__body">
        {paginatedData.length > 0 ? (
          paginatedData.map((row, index) => (
            <div
              key={row[rowKey] || index}
              className={`t-table__row ${hoverable ? 't-table__row--hoverable' : ''}`}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="t-table__cell"
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="t-table__empty">{emptyText}</div>
        )}
      </div>

      {/* 分页 */}
      {pagination && data.length > 0 && (
        <div className="t-table__pagination">
          <div className="t-table__pagination-info">
            共 {data.length} 条，第 {currentPage}/{totalPage} 页
          </div>
          <div className="t-table__pagination-btns">
            <button
              className={`t-table__pagination-btn ${currentPage <= 1 ? 't-table__pagination-btn--disabled' : ''}`}
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              上一页
            </button>
            <button
              className={`t-table__pagination-btn ${currentPage >= totalPage ? 't-table__pagination-btn--disabled' : ''}`}
              onClick={handleNextPage}
              disabled={currentPage >= totalPage}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 使用示例
/*
import { useState } from 'react'
import Table from './table'

function App() {
  const columns = [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'age', title: '年龄', sortable: true, align: 'center' },
    { key: 'email', title: '邮箱' },
    {
      key: 'status',
      title: '状态',
      render: (value) => (
        <span className={`status status--${value}`}>
          {value === 'active' ? '启用' : '禁用'}
        </span>
      )
    }
  ]

  const data = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', status: 'active' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com', status: 'inactive' },
    { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', status: 'active' }
  ]

  return (
    <Table
      columns={columns}
      data={data}
      rowKey="id"
      stripe
      border
      pagination
      pageSize={10}
      // 三种风格：default | elegant | gradient
      variant="default"
    />
  )
}
*/
