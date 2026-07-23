import React from 'react'
import './style-1.css'

interface AdminDashboardProps {
  title?: string
  menu?: string[]
  stats?: Array<{ label: string; value: string; trend: string; up: boolean }>
  chartData?: number[]
}

export default function AdminDashboard({
  title = '仪表盘',
  menu = ['仪表盘', '用户管理', '订单管理', '商品管理', '内容管理', '系统设置'],
  stats = [],
  chartData = []
}: AdminDashboardProps) {
  const displayStats = stats.length > 0 ? stats : [
    { label: '总用户', value: '12,856', trend: '+12.5%', up: true },
    { label: '活跃用户', value: '8,432', trend: '+8.2%', up: true },
    { label: '总订单', value: '3,652', trend: '-2.1%', up: false },
    { label: '总收入', value: '¥128,560', trend: '+18.6%', up: true }
  ]

  const displayChart = chartData.length > 0 ? chartData : [65, 45, 78, 52, 90, 68, 85]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Admin</div>
        <nav className="admin-nav">
          {menu.map((item, i) => <a key={i} href="#" className={i === 0 ? 'active' : ''}>{item}</a>)}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{title}</h1>
          <div className="admin-user">Admin</div>
        </header>
        <div className="admin-content">
          <div className="admin-stats">
            {displayStats.map((s, i) => (
              <div key={i} className="admin-stat-card">
                <div className="admin-stat-label">{s.label}</div>
                <div className="admin-stat-value">{s.value}</div>
                <div className={`admin-stat-trend ${s.up ? 'up' : 'down'}`}>{s.trend}</div>
              </div>
            ))}
          </div>
          <div className="admin-chart">
            <h3>数据概览</h3>
            <div className="admin-chart-area">
              {displayChart.map((h, i) => <div key={i} className="admin-bar" style={{ height: h + '%' }}></div>)}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
