import React, { useState } from 'react'
import './style-2.css'

interface TableListProps {
  title?: string
  columns: Array<{
    key: string
    title: string
    width?: string
    align?: 'left' | 'center' | 'right'
  }>
  data: any[]
  rowKey?: string
  showSearch?: boolean
  showAddButton?: boolean
  onAdd?: () => void
}

export default function TableList({
  title = '数据列表',
  columns,
  data,
  rowKey = 'id',
  showSearch = true,
  showAddButton = true,
  onAdd
}: TableListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([])

  return (
    <div className="table-list-elegant">
      {/* 头部 */}
      <div className="table-list-elegant__header">
        <div className="table-list-elegant__header-left">
          <h2 className="table-list-elegant__title">{title}</h2>
          <span className="table-list-elegant__count">共 {data.length} 条记录</span>
        </div>
        <div className="table-list-elegant__actions">
          {showSearch && (
            <div className="table-list-elegant__search">
              <input type="text" placeholder="搜索..." className="table-list-elegant__search-input" />
            </div>
          )}
          {showAddButton && (
            <button className="table-list-elegant__btn table-list-elegant__btn--primary" onClick={onAdd}>
              + 新增
            </button>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className="table-list-elegant__table-wrapper">
        <table className="table-list-elegant__table">
          <thead>
            <tr>
              <th className="table-list-elegant__checkbox">
                <input type="checkbox" />
              </th>
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row[rowKey] || index}>
                <td className="table-list-elegant__checkbox">
                  <input type="checkbox" />
                </td>
                {columns.map(col => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="table-list-elegant__pagination">
        <div className="table-list-elegant__pagination-info">
          第 1 页 / 共 10 页
        </div>
        <div className="table-list-elegant__pagination-btns">
          <button className="table-list-elegant__pagination-btn" disabled>&lt;</button>
          <button className="table-list-elegant__pagination-btn table-list-elegant__pagination-btn--active">1</button>
          <button className="table-list-elegant__pagination-btn">2</button>
          <button className="table-list-elegant__pagination-btn">3</button>
          <button className="table-list-elegant__pagination-btn">&gt;</button>
        </div>
      </div>
    </div>
  )
}
