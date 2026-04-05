import { useRef, useEffect, useMemo } from 'react'
import Chart from 'chart.js/auto'
import { CAT_COLORS } from '../data/mockData'
import { fmt, buildMonthlyData } from '../utils/helpers'

const TOOLTIP = {
  backgroundColor: '#17171f', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
  titleColor: '#f0f0f8', bodyColor: '#8888aa', padding: 10, cornerRadius: 8,
}
const TICKS = { color: '#55556a', font: { family: "'DM Mono', monospace", size: 11 } }
const GRID  = { color: 'rgba(255,255,255,0.04)' }

function ProgressBar({ value, color, max = 100 }) {
  const pct = Math.min(100, (value / (max || 1)) * 100)
  return (
    <div className="progress-wrap">
      <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function Insights({ transactions }) {
  const barCanvasRef = useRef(null)
  const barChartRef  = useRef(null)

  // Calculating core stats
  const expenses  = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions])
  const incomes   = useMemo(() => transactions.filter(t => t.type === 'income'),  [transactions])
  const totalExp  = useMemo(() => expenses.reduce((s, t) => s + t.amount, 0), [expenses])
  const totalInc  = useMemo(() => incomes.reduce((s, t) => s + t.amount, 0),  [incomes])

  const bycat = useMemo(() => {
    const map = {}
    expenses.forEach(t => { map[t.cat] = (map[t.cat] || 0) + t.amount })
    return map
  }, [expenses])

  const sortedCats = useMemo(() =>
    Object.keys(bycat).sort((a, b) => bycat[b] - bycat[a]),
    [bycat]
  )

  const topCat    = sortedCats[0] || null
  const topCatAmt = topCat ? bycat[topCat] : 0
  const topCatPct = totalExp > 0 ? (topCatAmt / totalExp * 100).toFixed(0) : 0
  const topColor  = topCat ? (CAT_COLORS[topCat] || CAT_COLORS['Other']).color : '#7cffc4'

  // Look at last month's data specifically
  const now  = new Date()
  const lmKey = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)
  const lmInc = transactions.filter(t => t.type === 'income'  && t.date.startsWith(lmKey)).reduce((s, t) => s + t.amount, 0)
  const lmExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(lmKey)).reduce((s, t) => s + t.amount, 0)
  const lmSave = lmInc - lmExp
  const lmRate = lmInc > 0 ? (lmSave / lmInc * 100).toFixed(1) : 0

  const ratio = totalInc > 0 ? (totalExp / totalInc * 100).toFixed(1) : 0
  const ratioColor = ratio < 70 ? 'var(--accent)' : ratio < 90 ? 'var(--yellow)' : 'var(--red)'

  // Chart initialization
  useEffect(() => {
    if (!barCanvasRef.current) return
    if (barChartRef.current) barChartRef.current.destroy()

    const { labels, incomes: inc, expenses: exp } = buildMonthlyData(transactions, 6)

    barChartRef.current = new Chart(barCanvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income',   data: inc, backgroundColor: 'rgba(124,255,196,0.6)', borderRadius: 4 },
          { label: 'Expenses', data: exp, backgroundColor: 'rgba(255,92,124,0.6)',  borderRadius: 4 },
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
          y: { grid: GRID, ticks: { ...TICKS, callback: v => '₹' + v.toLocaleString('en-IN') } },
        },
      },
    })

    return () => { barChartRef.current?.destroy(); barChartRef.current = null }
  }, [transactions])

  // Personalized insights
  const observations = useMemo(() => {
    const obs = []
    if (lmSave > 0)  obs.push({ icon: '💰', text: `Great job! You saved ${fmt(lmSave)} last month, giving you a ${lmRate}% savings rate.` })
    if (topCat)      obs.push({ icon: '📊', text: `Heads up: ${topCat} is your biggest expense right now, taking up ${topCatPct}% of your total spending.` })
    if (ratio > 90)  obs.push({ icon: '⚠️', text: 'Your spending is getting close to your total income. It might be time to check your discretionary expenses.' })
    else if (ratio < 60) obs.push({ icon: '✅', text: "You're doing excellent! Your spending is well below what you're earning." })
    
    const housingAmt = bycat['Housing'] || 0
    if (housingAmt > 0 && totalExp > 0 && housingAmt / totalExp > 0.4)
      obs.push({ icon: '🏠', text: `Housing costs are currently ${(housingAmt / totalExp * 100).toFixed(0)}% of your expenses, which is a bit high.` })
    
    if (obs.length === 0)
      obs.push({ icon: '📈', text: 'Start logging more transactions to get personalized financial insights.' })
    return obs
  }, [lmSave, lmRate, topCat, topCatPct, ratio, bycat, totalExp])

  const maxCatAmt = bycat[sortedCats[0]] || 1

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Insights</div>
          <div className="section-sub">Smart observations about your finances</div>
        </div>
      </div>

      {/* Top 3 summary cards */}
      <div className="grid-3">
        {/* Top spending category */}
        <div className="card fade-up fade-up-1">
          <div className="card-title" style={{ marginBottom: 14 }}>Top Spending Category</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: topColor }}>
            {topCat || '—'}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>
            {fmt(topCatAmt)} · {topCatPct}% of expenses
          </div>
          <ProgressBar value={parseFloat(topCatPct)} color={topColor} />
        </div>

        {/* Monthly savings */}
        <div className="card fade-up fade-up-2">
          <div className="card-title" style={{ marginBottom: 14 }}>Monthly Savings</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: lmSave >= 0 ? 'var(--accent)' : 'var(--red)' }}>
            {lmSave >= 0 ? '+' : ''}{fmt(lmSave)}
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>
            Last month · {lmRate}% savings rate
          </div>
          <ProgressBar value={Math.min(100, Math.abs(parseFloat(lmRate)))} color={lmSave >= 0 ? 'var(--accent)' : 'var(--red)'} />
        </div>

        {/* Expense ratio */}
        <div className="card fade-up fade-up-3">
          <div className="card-title" style={{ marginBottom: 14 }}>Expense Ratio</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: ratioColor }}>
            {ratio}%
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>of income spent</div>
          <ProgressBar value={Math.min(100, parseFloat(ratio))} color={ratioColor} />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-2">
        <div className="card fade-up fade-up-2">
          <div className="card-header"><div className="card-title">Monthly Comparison</div></div>
          <div className="chart-wrap"><canvas ref={barCanvasRef} /></div>
        </div>

        <div className="card fade-up fade-up-3">
          <div className="card-header"><div className="card-title">Category Breakdown</div></div>
          {sortedCats.slice(0, 8).map(cat => {
            const col = (CAT_COLORS[cat] || CAT_COLORS['Other']).color
            const pct = totalExp > 0 ? (bycat[cat] / totalExp * 100).toFixed(0) : 0
            return (
              <div key={cat} className="insight-item">
                <div className="cat-dot" style={{ background: col }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13 }}>{cat}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>
                      {fmt(bycat[cat])} ({pct}%)
                    </span>
                  </div>
                  <ProgressBar value={bycat[cat]} max={maxCatAmt} color={col} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observations */}
      <div className="card fade-up fade-up-3">
        <div className="card-header"><div className="card-title">Key Observations</div></div>
        {observations.map((obs, i) => (
          <div key={i} className="insight-item">
            <div className="insight-icon" style={{ background: 'var(--surface2)', fontSize: 20 }}>{obs.icon}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{obs.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
