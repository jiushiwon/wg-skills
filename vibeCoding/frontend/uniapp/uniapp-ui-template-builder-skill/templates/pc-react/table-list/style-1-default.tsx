import React, { useState } from 'react'
import './style-1.css'

interface TableListProps {
  /** 页面标题 */
  title?: string
  /** 列配置 */
  columns: Array<{
    key: string
    title: string
    width?: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
  }>
  /** 表格数据 */
  rows: any[]
  /** 行唯一标识字段 */
  rowKey?: string
  /** 分页信息 */
  pagination?: {
    current: number
    pageSize: number
    total: number
    totalPages: number
  }
  /** 是否显示搜索 */
  showSearch?: boolean
  /** 是否显示刷新 */
  showRefresh?: boolean
  /** 是否显示新增按钮 */
  showAddButton?: boolean
  addButtonText?: string
  onAdd?: () => void
  onRefresh?: () => void
  onSearch?: (keyword: string) => void
  onPageChange?: (page: number) => void
}

export default function TableList({
  title = '数据列表',
  columns,
  rows,
  rowKey = 'id',
  pagination,
  showSearch = true,
  showRefresh = true,
  showAddButton = true,
  addButtonText = '新增',
  onAdd,
  onRefresh,
  onSearch,
  onPageChange
}: TableListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')

  const getRowKey = (row: any) => row[rowKey]

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? [...rows] : [])
  }

  const handleSelectRow = (row: any, checked: boolean) => {
    const rowId = getRowKey(row)
    if (checked) {
      setSelectedRows([...selectedRows, row])
    } else {
      setSelectedRows(selectedRows.filter(r => getRowKey(r) !== rowId))
    }
  }

  const isRowSelected = (row: any) => selectedRows.some(r => getRowKey(r) === getRowKey(row))

  const handleSearch = () => {
    onSearch?.(keyword)
  }

  const handlePageChange = (page: number) => {
    if (!pagination) return
    if (page < 1 || page > pagination.totalPages) return
    onPageChange?.(page)
  }

  return (
    <div className="table-list">
      <div className="table-list__header">
        <h2 className="table-list__title">{title}</h2>
        <div className="table-list__actions">
          {showAddButton && (
            <button className="table-list__btn table-list__btn--primary" onClick={onAdd}>+ {addButtonText}</button>
          )}
          {showRefresh && (
            <button className="table-list__btn" onClick={onRefresh}>↻ 刷新</button>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="table-list__toolbar">
          <div className="table-list__search">
            <input
              type="text"
              className="table-list__search-input"
              placeholder="搜索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="table-list__search-btn" onClick={handleSearch}>搜索</button>
          </div>
          {selectedRows.length > 0 && (
            <div className="table-list__batch">
              已选择 {selectedRows.length} 项
              <button className="table-list__btn table-list__btn--danger">批量删除</button>
            </div>
          )}
        </div>
      )}

      <div className="table-list__table-wrapper">
        <table className="table-list__table">
          <thead>
            <tr>
              <th className="table-list__checkbox">
                <input
                  type="checkbox"
                  checked={selectedRows.length === rows.length && rows.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={getRowKey(row) || index}>
                  <td className="table-list__checkbox">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      onChange={(e) => handleSelectRow(row, e.target.checked)}
                    />
                  </td>
                  {columns.map(col => (
                    <td key={col.key} style={{ textAlign: col.align || 'left' }}>{row[col.key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="table-list__empty">暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="table-list__pagination">
          <span className="table-list__pagination-info">共 {pagination.total} 条，第 {pagination.current}/{pagination.totalPages} 页</span>
          <div className="table-list__pagination-btns">
            <button
              className="table-list__pagination-btn"
              disabled={pagination.current <= 1}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              上一页
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`table-list__pagination-btn ${pagination.current === page ? 'table-list__pagination-btn--active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="table-list__pagination-btn"
              disabled={pagination.current >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.current + 1)}
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
import TableList from './style-1-default'
import mock from './mock.json'

function App() {
  return (
    <TableList
      title={mock.data.title}
      columns={mock.data.columns}
      rows={mock.data.rows}
      pagination={mock.data.pagination}
    />
  )
}
*/
