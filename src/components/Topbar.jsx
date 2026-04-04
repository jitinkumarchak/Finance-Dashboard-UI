const PAGE_TITLES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  insights: 'Insights',
}

export default function Topbar({ activePage, search, onSearch, onExport, onToggleSidebar }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">{PAGE_TITLES[activePage]}</div>
          <div className="topbar-sub">Good morning, Jitin 👋</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        <div className="btn-icon" title="Export" onClick={onExport}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>

        <div className="avatar">J</div>
      </div>
    </div>
  )
}
