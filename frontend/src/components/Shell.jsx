import { NavLink, Outlet } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function NavItem({ to, label }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
    }>
      {label}
    </NavLink>
  )
}

export default function Shell() {
  const { user, users, switchUser } = useUser()
  if (!user) return <div className="flex items-center justify-center h-screen text-brand-muted">Loading…</div>

  const isHR = user.role === 'hr_admin'
  const isManager = user.role === 'manager' || isHR

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-brand-navy overflow-y-auto">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏪</span>
            <span className="text-white font-bold text-sm leading-tight">Talent Marketplace</span>
          </div>
          <span className="text-xs bg-brand-red text-white px-2 py-0.5 rounded-full">Home Credit PH · Pilot</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-1">Explore</p>
            <NavItem to="/" label="🏠 Home" />
            <NavItem to="/opportunities" label="📋 Opportunities" />
            <NavItem to="/matches" label="✨ My Matches" />
            <NavItem to="/faq" label="❓ FAQ" />
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-1">Manage</p>
            <NavItem to="/profile" label="👤 My Profile" />
            {isManager && <NavItem to="/post" label="➕ Post Opportunity" />}
            <NavItem to="/feedback" label="💬 Feedback" />
          </div>
          {isHR && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-1">HR Admin</p>
              <NavItem to="/dashboard" label="📊 Dashboard" />
            </div>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-1">Role Switcher</p>
          <select
            value={user.id}
            onChange={e => switchUser(e.target.value)}
            className="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 border border-white/20 focus:outline-none"
          >
            {users.map(u => (
              <option key={u.id} value={u.id} className="text-black bg-white">
                {u.name} ({u.role === 'hr_admin' ? 'HR Admin' : u.role === 'manager' ? 'Manager' : 'Employee'})
              </option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: '#C00000' }}>
          <span className="text-white font-semibold text-sm">Talent Marketplace</span>
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {user.name[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
