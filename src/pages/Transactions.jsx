import { useState, useMemo } from 'react'
import CatChip from '../components/CatChip'
import { fmt, fmtDate } from '../utils/helpers'

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport', 'Housing',
  'Entertainment', 'Health', 'Utilities', 'Salary',
  'Freelance', 'Investment', 'Other',
]

const DEFAULT_FORM = { type: 'expense', amount: '', desc: '', cat: 'Food & Dining', date: '' }

export default function Transactions({ transactions, role, search, onAddTransaction, onDeleteTransaction, showToast }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter,  setCatFilter]  = useState('all')
  const [sort,       setSort]       = useState('date-desc')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [form,       setForm]       = useState(DEFAULT_FORM)

  const isAdmin = role === 'admin'

  // ── Filtered & sorted list ─────────────────────────────
  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const matchType   = typeFilter === 'all' || t.type === typeFilter
        const matchCat    = catFilter  === 'all' || t.cat  === catFilter
        const matchSearch = !search || t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase())
        return matchType && matchCat && matchSearch
      })
      .sort((a, b) => {
        if (sort === 'date-desc')    return new Date(b.date) - new Date(a.date)
        if (sort === 'date-asc')     return new Date(a.date) - new Date(b.date)
        if (sort === 'amount-desc')  return b.amount - a.amount
        if (sort === 'amount-asc')   return a.amount - b.amount
        return 0
      })
  }, [transactions, typeFilter, catFilter, search, sort])

  const allCats = useMemo(
    () => [...new Set(transactions.map(t => t.cat))].sort(),
    [transactions]
  )

  const totalIn  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // ── Modal helpers ──────────────────────────────────────
  const openModal = () => {
    if (!isAdmin) { showToast('Viewers cannot add transactions'); return }
    setForm({ ...DEFAULT_FORM, date: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = () => {
    if (!form.amount || !form.desc || !form.date) { showToast('Please fill all fields'); return }
    onAddTransaction({ ...form, amount: parseFloat(form.amount) })
    closeModal()
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Transactions</div>
          <div className="section-sub">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
            {fmt(totalIn)} in / {fmt(totalOut)} out
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-export">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button
            className={`btn-add${!isAdmin ? ' disabled' : ''}`}
            onClick={openModal}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        {/* Filters */}
        <div className="tx-filters">
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              className={`filter-btn${typeFilter === f ? ' active' : ''}`}
              onClick={() => setTypeFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}

          <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {allCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </div>

        {/* Table */}
        {filtered.length ? (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><div className="tx-desc">{t.desc}</div></td>
                  <td><CatChip cat={t.cat} /></td>
                  <td className="tx-date">{fmtDate(t.date)}</td>
                  <td className={`tx-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                  {isAdmin && (
                    <td>
                      <button className="tx-action-btn" onClick={() => onDeleteTransaction(t.id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-sub">Try adjusting your filters</div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        onClick={e => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal">
          <div className="modal-title">Add Transaction</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setField('type', e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01"
                value={form.amount} onChange={e => setField('amount', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" className="form-input" placeholder="e.g. Grocery shopping"
              value={form.desc} onChange={e => setField('desc', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.cat} onChange={e => setField('cat', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input"
                value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit}>Add Transaction</button>
          <button className="btn-cancel" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
