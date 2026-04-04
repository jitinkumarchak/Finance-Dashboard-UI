import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Insights from './pages/Insights'
import { SEED_DATA } from './data/mockData'

const PAGES = { dashboard: Dashboard, transactions: Transactions, insights: Insights }

export default function App() {
  // ── Persisted state ────────────────────────────────────
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fintrak_tx')) || SEED_DATA }
    catch { return SEED_DATA }
  })

  const [role, setRole] = useState(() => localStorage.getItem('fintrak_role') || 'admin')

  // ── Navigation & UI state ──────────────────────────────
  const [activePage, setActivePage] = useState('dashboard')
  const [search, setSearch]         = useState('')
  const [nextId, setNextId]         = useState(41)
  const [toast, setToast]           = useState({ visible: false, msg: '' })

  // ── Persist helpers ────────────────────────────────────
  const persistTx = (txList) => {
    setTransactions(txList)
    localStorage.setItem('fintrak_tx', JSON.stringify(txList))
  }

  const handleRoleChange = (r) => {
    setRole(r)
    localStorage.setItem('fintrak_role', r)
  }

  // ── Toast ──────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])

  // ── CRUD ───────────────────────────────────────────────
  const addTransaction = useCallback((data) => {
    const newTx = { ...data, id: nextId }
    setNextId(n => n + 1)
    persistTx([newTx, ...transactions])
    showToast('Transaction added!')
  }, [transactions, nextId, showToast])

  const deleteTransaction = useCallback((id) => {
    persistTx(transactions.filter(t => t.id !== id))
    showToast('Transaction deleted')
  }, [transactions, showToast])

  // ── Export ─────────────────────────────────────────────
  const exportData = useCallback(() => {
    const headers = ['ID', 'Description', 'Category', 'Type', 'Amount', 'Date']
    const rows = transactions.map(t => [t.id, t.desc, t.cat, t.type, t.amount, t.date])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'fintrak-transactions.csv' })
    a.click()
    showToast('Exported as CSV!')
  }, [transactions, showToast])

  // ── Sidebar toggle (mobile) ────────────────────────────
  const toggleSidebar = () => {
    document.getElementById('sidebar')?.classList.toggle('open')
  }

  const ActivePage = PAGES[activePage]

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div id="sidebarToggle" className="sidebar-toggle" onClick={toggleSidebar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </div>

      <div className="shell">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          role={role}
          onRoleChange={handleRoleChange}
        />

        <main className="main">
          <Topbar
            activePage={activePage}
            search={search}
            onSearch={setSearch}
            onExport={exportData}
          />

          <div className="content">
            <ActivePage
              transactions={transactions}
              role={role}
              search={search}
              onNavigate={setActivePage}
              onAddTransaction={addTransaction}
              onDeleteTransaction={deleteTransaction}
              showToast={showToast}
            />
          </div>
        </main>
      </div>

      {/* Toast notification */}
      <div className={`toast${toast.visible ? ' show' : ''}`}>
        <div className="toast-dot" />
        <span>{toast.msg}</span>
      </div>
    </>
  )
}
