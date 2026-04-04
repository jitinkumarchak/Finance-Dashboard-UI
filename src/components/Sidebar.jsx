export default function Sidebar({ activePage, onNavigate, role, onRoleChange }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12H3M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
        </svg>
      ),
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 21H4.6A1.6 1.6 0 013 19.4V3" />
          <path d="M7 14l4-4 4 4 4-5" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">Fin<span>trak</span></div>
        <div className="logo-sub">Finance Dashboard</div>
      </div>

      <nav className="nav">
        <div className="nav-section">
          <div className="nav-label">Overview</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="role-switcher">
          <div className="role-label">Role</div>
          <select
            className="role-select"
            value={role}
            onChange={e => onRoleChange(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <div className={`role-badge ${role}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7z" />
            </svg>
            <span>{role === 'admin' ? 'Admin Access' : 'Viewer Access'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}