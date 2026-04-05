import { useState, useMemo } from 'react'
import CatChip from '../components/CatChip'
import { fmt, fmtDate } from '../utils/helpers'

const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport', 'Housing',
  'Entertainment', 'Health', 'Utilities', 'Salary',
  'Freelance', 'Investment', 'Other',
]

const DEFAULT_FORM = { type: 'expense', amount: '', desc: '', cat: 'Food & Dining', date: '' }

export default function Transactions({ transactions, role, search, onAddTransaction, onEditTransaction, onDeleteTransaction, showToast }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter,  setCatFilter]  = useState('all')
  const [sort,       setSort]       = useState('date-desc')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [form,       setForm]       = useState(DEFAULT_FORM)
  const [editingId,  setEditingId]  = useState(null)

  const isAdmin = role === 'admin'

  // Filtering and sorting logic
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

  // Modal handlers
  const openAddModal = () => {
    if (!isAdmin) { showToast('Viewers cannot add transactions'); return }
    setEditingId(null)
    setForm({ ...DEFAULT_FORM, date: new Date().toISOString().slice(0, 10) })
    setModalOpen(true)
  }

  const openEditModal = (t) => {
    if (!isAdmin) return
    setEditingId(t.id)
    setForm({ ...t })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSubmit = () => {
    if (!form.amount || !form.desc || !form.date) { showToast('Please fill all fields'); return }
    const txData = { ...form, amount: parseFloat(form.amount) }
    
    if (editingId) {
      onEditTransaction(txData)
    } else {
      onAddTransaction(txData)
    }
    closeModal()
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Transactions</div>
          <div className="section-sub">
            {filtered.length} items &nbsp;·&nbsp;
            {fmt(totalIn)} income / {fmt(totalOut)} expense
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-add" onClick={openAddModal} disabled={!isAdmin}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add New
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
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
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">High Amount</option>
            <option value="amount-asc">Low Amount</option>
          </select>
        </div>

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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="tx-action-btn" onClick={() => openEditModal(t)}>
                          Edit
                        </button>
                        <button className="tx-action-btn" style={{ color: 'var(--red)' }} onClick={() => onDeleteTransaction(t.id)}>
                          Delete
                        </button>
                      </div>
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
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        onClick={e => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal">
          <div className="modal-title">{editingId ? 'Edit Transaction' : 'Add Transaction'}</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setField('type', e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" className="form-input" placeholder="0" min="0"
                value={form.amount} onChange={e => setField('amount', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" className="form-input" placeholder="What was this for?"
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

          <button className="btn-primary" onClick={handleSubmit}>
            {editingId ? 'Update' : 'Add'} Transaction
          </button>
          <button className="btn-cancel" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
