export const fmt = n =>
  '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtDate = d =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function buildMonthlyData(transactions, months) {
  const now = new Date()
  const labels = [], incomes = [], expenses = [], net = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    labels.push(label)

    const monthTx = transactions.filter(t => t.date.startsWith(key))
    const inc = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    incomes.push(inc)
    expenses.push(exp)
    net.push(inc - exp)
  }

  return { labels, incomes, expenses, net }
}
