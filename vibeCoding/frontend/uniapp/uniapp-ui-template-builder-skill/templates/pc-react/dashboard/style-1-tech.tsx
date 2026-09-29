import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import './style-1.css'

// 风格1：科技深蓝
export default function Dashboard() {
  const lineChartRef = useRef<HTMLDivElement>(null)
  const pieChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const charts: echarts.ECharts[] = []

    // 折线图
    if (lineChartRef.current) {
      const lineChart = echarts.init(lineChartRef.current)
      lineChart.setOption({
        grid: { left: 40, right: 20, top: 20, bottom: 30 },
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
          axisLine: { lineStyle: { color: '#1A237E' } },
          axisLabel: { color: '#8892B0' }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: '#1A237E' } },
          axisLabel: { color: '#8892B0' }
        },
        series: [{
          type: 'line',
          data: [1200, 800, 2500, 4800, 3600, 5200, 3800],
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 217, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 217, 255, 0)' }
            ])
          },
          lineStyle: { color: '#00D9FF' },
          itemStyle: { color: '#00D9FF' }
        }]
      })
      charts.push(lineChart)
    }

    // 饼图
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current)
      pieChart.setOption({
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '50%'],
          data: [
            { value: 335, name: '直接访问', itemStyle: { color: '#00D9FF' } },
            { value: 310, name: '邮件营销', itemStyle: { color: '#7C4DFF' } },
            { value: 234, name: '联盟广告', itemStyle: { color: '#00E676' } },
            { value: 135, name: '搜索引擎', itemStyle: { color: '#FFAB00' } }
          ],
          label: { show: false },
          labelLine: { show: false }
        }]
      })
      charts.push(pieChart)
    }

    // 响应式重绘
    const handleResize = () => charts.forEach(chart => chart.resize())
    window.addEventListener('resize', handleResize)

    // 清理：移除监听并销毁图表实例
    return () => {
      window.removeEventListener('resize', handleResize)
      charts.forEach(chart => chart.dispose())
    }
  }, [])

  return (
    <div className="dashboard-page style-tech">
      {/* 头部 */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="title">运营数据大屏</h1>
          <span className="subtitle">实时数据监控中心</span>
        </div>
        <div className="header-right">
          <span className="update-time">更新时间: 12:00:00</span>
        </div>
      </header>

      {/* 统计卡片 */}
      <section className="stats-grid">
        {[
          { label: '今日订单', value: '1,234', trend: '+12.5%', color: '#00D9FF' },
          { label: '销售额', value: '¥56,789', trend: '+8.3%', color: '#00E676' },
          { label: '访客数', value: '8,654', trend: '+5.2%', color: '#7C4DFF' },
          { label: '转化率', value: '3.24%', trend: '+1.1%', color: '#FFAB00' }
        ].map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-icon" style={{ color: stat.color }}>●</span>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend" style={{ color: stat.color }}>
              <span>↑</span> {stat.trend}
            </div>
          </div>
        ))}
      </section>

      {/* 图表区域 */}
      <section className="charts-grid">
        <div className="chart-card main-chart">
          <div className="card-header">
            <h3>销售额趋势</h3>
          </div>
          <div className="chart-body" ref={lineChartRef}></div>
        </div>
        <div className="chart-card side-chart">
          <div className="card-header">
            <h3>流量来源</h3>
          </div>
          <div className="chart-body" ref={pieChartRef}></div>
        </div>
      </section>

      {/* 排行榜 */}
      <section className="rank-section">
        <div className="chart-card">
          <div className="card-header">
            <h3>销售排行 TOP 5</h3>
          </div>
          <div className="rank-list">
            {[
              { name: 'iPhone 15 Pro', value: '¥1,234,567', percent: 100 },
              { name: 'AirPods Pro', value: '¥890,123', percent: 72 },
              { name: 'MacBook Pro', value: '¥678,901', percent: 55 },
              { name: 'iPad Pro', value: '¥456,789', percent: 37 },
              { name: 'Apple Watch', value: '¥345,678', percent: 28 }
            ].map((item, index) => (
              <div className="rank-item" key={index}>
                <span className={`rank-index ${index < 3 ? 'top' : ''}`}>{index + 1}</span>
                <span className="rank-name">{item.name}</span>
                <span className="rank-value">{item.value}</span>
                <div className="rank-bar">
                  <div className="rank-bar-fill" style={{ width: item.percent + '%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
