import { useRef, useEffect, useState, useMemo } from 'react'
import Chart from 'chart.js/auto'
import { CAT_COLORS } from '../data/mockData'
import CatChip from '../components/CatChip'
import { fmt, fmtDate, buildMonthlyData } from '../utils/helpers'

const TOOLTIP = {
  backgroundColor: '#17171f',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  titleColor: '#f0f0f8',
  bodyColor: '#8888aa',
  padding: 10,
  cornerRadius: 8,
}
const TICKS = { color: '#55556a', font: { family: "'DM Mono', monospace", size: 11 } }
const GRID  = { color: 'rgba(255,255,255,0.04)' }

export default function Dashboard({ transactions, onNavigate }) {
  const [trendMonths, setTrendMonths] = useState(6)

  const trendCanvasRef  = useRef(null)
  const donutCanvasRef  = useRef(null)
  const trendChartRef   = useRef(null)
  const donutChartRef   = useRef(null)

  // ── Stats ──────────────────────────────────────────────
  const income  = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions])
  const expense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions])
  const balance = income - expense
  const rate    = income > 0 ? (income - expense) / income * 100 : 0

  const recent = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
    [transactions]
  )

  // ── Trend chart ────────────────────────────────────────
  useEffect(() => {
    if (!trendCanvasRef.current) return
    if (trendChartRef.current) trendChartRef.current.destroy()

    const { labels, incomes, expenses } = buildMonthlyData(transactions, trendMonths)

    trendChartRef.current = new Chart(trendCanvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Income',   data: incomes,   borderColor: '#7cffc4', backgroundColor: 'rgba(124,255,196,0.08)', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#7cffc4', pointRadius: 3 },
          { label: 'Expenses', data: expenses,  borderColor: '#ff5c7c', backgroundColor: 'rgba(255,92,124,0.08)',  borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#ff5c7c', pointRadius: 3 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#8888aa', font: { family: "'DM Mono'", size: 11 }, boxWidth: 10, usePointStyle: true } },
          tooltip: TOOLTIP,
        },
        scales: {
          x: { grid: GRID, ticks: TICKS },
          y: { grid: GRID, ticks: { ...TICKS, callback: v => '$' + v.toLocaleString() } },
        },
      },
    })

    return () => { trendChartRef.current?.destroy(); trendChartRef.current = null }
  }, [transactions, trendMonths])

  // ── Donut chart ────────────────────────────────────────
  useEffect(() => {
    if (!donutCanvasRef.current) return
    if (donutChartRef.current) donutChartRef.current.destroy()

    const bycat = {}
    transactions.filter(t => t.type === 'expense').forEach(t => { bycat[t.cat] = (bycat[t.cat] || 0) + t.amount })
    const cats   = Object.keys(bycat).sort((a, b) => bycat[b] - bycat[a])
    const vals   = cats.map(c => bycat[c])
    const colors = cats.map(c => (CAT_COLORS[c] || CAT_COLORS['Other']).color)

    donutChartRef.current = new Chart(donutCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{ data: vals, backgroundColor: colors.map(c => c + '33'), borderColor: colors, borderWidth: 2, hoverOffset: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: {
          legend: { display: true, position: 'right', labels: { color: '#8888aa', font: { family: "'DM Mono'", size: 10 }, boxWidth: 8, usePointStyle: true, padding: 8 } },
          tooltip: { ...TOOLTIP, callbacks: { label: ctx => ' ' + ctx.label + ': ' + fmt(ctx.raw) } },
        },
      },
    })

    return () => { donutChartRef.current?.destroy(); donutChartRef.current = null }
  }, [transactions])

  // ── Render ─────────────────────────────────────────────
  const statCards = [
    {
      glow: '#7cffc4', iconBg: 'rgba(124,255,196,0.12)', color: '#7cffc4',
      value: fmt(balance), label: 'Total Balance', change: '↑ Lifetime balance', changeType: 'up',
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
    },
    {
      glow: '#44aaff', iconBg: 'rgba(68,170,255,0.12)', color: '#44aaff',
      value: fmt(income), label: 'Total Income', change: '↑ Total earned', changeType: 'up',
      icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>,
    },
    {
      glow: '#ff5c7c', iconBg: 'rgba(255,92,124,0.12)', color: '#ff5c7c',
      value: fmt(expense), label: 'Total Expenses', change: '↑ Total spent', changeType: 'down',
      icon: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
    },
    {
      glow: '#b87cff', iconBg: 'rgba(184,124,255,0.12)', color: '#b87cff',
      value: rate.toFixed(1) + '%', label: 'Savings Rate',
      change: rate > 30 ? '✓ Healthy' : rate > 10 ? '~ Moderate' : '↓ Low',
      changeType: rate > 10 ? 'up' : 'down',
      icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
    },
  ]

  const fadeClasses = ['fade-up fade-up-1', 'fade-up fade-up-2', 'fade-up fade-up-3', 'fade-up fade-up-4']

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid-4">
        {statCards.map((card, i) => (
          <div key={card.label} className={`card stat-card ${fadeClasses[i]}`}>
            <div className="glow" style={{ background: card.glow }} />
            <div className="stat-icon" style={{ background: card.iconBg }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2">
                {card.icon}
              </svg>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
            <div className={`stat-change ${card.changeType}`}>{card.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2-1">
        <div className="card fade-up fade-up-2">
          <div className="card-header">
            <div><div className="card-title">Balance Trend</div></div>
            <select
              className="filter-select"
              style={{ marginLeft: 0 }}
              onChange={e => setTrendMonths(parseInt(e.target.value))}
            >
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>
          <div className="chart-wrap"><canvas ref={trendCanvasRef} /></div>
        </div>

        <div className="card fade-up fade-up-3">
          <div className="card-header"><div className="card-title">Spending Breakdown</div></div>
          <div className="chart-wrap"><canvas ref={donutCanvasRef} /></div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card fade-up fade-up-3">
        <div className="card-header">
          <div className="card-title">Recent Transactions</div>
          <button className="btn-export" onClick={() => onNavigate('transactions')}>View all →</button>
        </div>

        {recent.length ? (
          <table className="tx-table">
            <thead>
              <tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td><div className="tx-desc">{t.desc}</div></td>
                  <td><CatChip cat={t.cat} /></td>
                  <td className="tx-date">{fmtDate(t.date)}</td>
                  <td className={`tx-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-sub">Add your first transaction to get started</div>
          </div>
        )}
      </div>
    </div>
  )
}
