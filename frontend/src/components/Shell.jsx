import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useEffect, useState } from 'react'
import api from '../api'

function NavItem({ to, label }) {
  return (
    <NavLink to={to} end={to === '/'}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
      }>
      {label}
    </NavLink>
  )
}

export default function Shell() {
  const { user, users, switchUser } = useUser()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    api.get('/notifications').then(r => setUnread(r.data.filter(n => !n.is_read).length)).catch(() => {})
    const t = setInterval(() => {
      api.get('/notifications').then(r => setUnread(r.data.filter(n => !n.is_read).length)).catch(() => {})
    }, 10000)
    return () => clearInterval(t)
  }, [user])

  if (!user) return <div className="flex items-center justify-center h-screen text-brand-muted">Loading…</div>

  const isHR = user.role === 'hr_admin'
  const isManager = user.role === 'manager' || isHR

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 shrink-0 flex flex-col bg-brand-navy overflow-y-auto">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏪</span>
            <span className="text-white font-bold text-sm leading-tight">Talent Marketplace</span>
          </div>
          <span className="text-xs bg-brand-red text-white px-2 py-0.5 rounded-full">Home Credit PH · Pilot</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem to="/" label="📖 Introduction" />
          <NavItem to="/profile" label="👤 My Profile" />
          <NavItem to="/matches" label="✨ My Matches" />
          {isManager && <NavItem to="/post" label="➕ Post Opportunity" />}
          <NavItem to="/faq" label="❓ FAQ" />

          <div className="pt-3 border-t border-white/10 mt-3">
            <NavItem to="/notifications" label={`🔔 Notifications${unread > 0 ? ` (${unread})` : ''}`} />
          </div>

          {isHR && (
            <div className="pt-3 border-t border-white/10 mt-1">
              <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-1">HR Admin</p>
              <NavItem to="/opportunities" label="📋 All Opportunities" />
              <NavItem to="/dashboard" label="📊 Dashboard" />
              <NavItem to="/feedback" label="💬 Feedback" />
            </div>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-1">Switch Role / User</p>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 h-14 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: '#C00000' }}>
          <span className="text-white font-semibold text-sm">Talent Marketplace</span>
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm">{user.name} · <span className="text-white/70 capitalize">{user.role.replace('_',' ')}</span></span>
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
