import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell, LayoutDashboard, Briefcase, User, HelpCircle, MessageSquare, LogOut, Star } from 'lucide-react'

function NavItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink to={to} end={to.endsWith('dashboard')}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-red-50 text-brand-red' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
      }>
      {icon}<span>{label}</span>
    </NavLink>
  )
}

export default function Shell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetch = () => api.get('/notifications').then(r => setUnread(r.data.filter((n: { isRead: boolean }) => !n.isRead).length)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 10000)
    return () => clearInterval(t)
  }, [user])

  if (!user) return null

  const role = user.role
  const initials = `${user.firstName[0]}${user.lastName[0]}`

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r bg-white">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏬</span>
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">Talent Marketplace</p>
              <p className="text-xs text-muted-foreground">ABC Company</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {role === 'administrator' && <>
            <NavItem to="/admin/dashboard" label="Dashboard" icon={<LayoutDashboard size={16} />} />
            <NavItem to="/admin/opportunities" label="Opportunities" icon={<Briefcase size={16} />} />
            <NavItem to="/admin/feedbacks" label="Feedbacks" icon={<Star size={16} />} />
          </>}

          {(role === 'recruiter' || role === 'applicant') && <>
            <NavItem to={`/${role}/dashboard`} label="Dashboard" icon={<LayoutDashboard size={16} />} />
            <NavItem to={`/${role}/opportunities`} label="Opportunities" icon={<Briefcase size={16} />} />
            <NavItem to={`/${role}/profile`} label="My Profile" icon={<User size={16} />} />
            <NavItem to={`/${role}/faq`} label="FAQ" icon={<HelpCircle size={16} />} />
            <NavItem to={`/${role}/notifications`} label={`Notifications${unread > 0 ? ` (${unread})` : ''}`} icon={<Bell size={16} />} />
          </>}

          {role === 'recruiter' && (
            <NavItem to="/recruiter/openings" label="My Openings" icon={<MessageSquare size={16} />} />
          )}
        </nav>

        <div className="px-4 py-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-100 text-brand-red text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-600 transition-colors w-full">
            <LogOut size={14} /><span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b bg-white shrink-0">
          <span className="font-semibold text-sm text-foreground">Talent Marketplace</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
