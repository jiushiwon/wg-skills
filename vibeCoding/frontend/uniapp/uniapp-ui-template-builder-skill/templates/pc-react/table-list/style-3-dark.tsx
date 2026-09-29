import React from 'react'
import './style-3.css'

interface TableListProps {
  title?: string
  columns: Array<{ key: string; title: string; width?: string }>
  data: any[]
  rowKey?: string
}

export default function TableList({ title = '数据列表', columns, data, rowKey = 'id' }: TableListProps) {
  return (
    <div className="table-list-dark">
      <div className="table-list-dark__header">
        <h2 className="table-list-dark__title">{title}</h2>
        <div className="table-list-dark__actions">
          <button className="table-list-dark__btn">↻</button>
          <button className="table-list-dark__btn table-list-dark__btn--primary">+ 新增</button>
        </div>
      </div>
      <div className="table-list-dark__table-wrap">
        <table className="table-list-dark__table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              {columns.map(col => <th key={col.key}>{col.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row[rowKey] || i}>
                <td><input type="checkbox" /></td>
                {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-list-dark__pagination">
        <span>共 {data.length} 条</span>
        <div className="table-list-dark__pages">
          <button disabled>&lt;</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>&gt;</button>
        </div>
      </div>
    </div>
  )
}
