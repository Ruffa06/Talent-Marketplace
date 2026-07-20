import { useEffect, useState } from 'react'
import api from '../api'
import { useUser } from '../context/UserContext'

const typeStyle = {
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
  action:  { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔔' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: '⚠️' },
  info:    { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️' },
}

export default function Notifications() {
  const { user } = useUser()
  const [notifs, setNotifs] = useState([])

  function load() {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [user])

  function markAllRead() {
    api.put('/notifications/read-all').then(load)
  }

  function markRead(id) {
    api.put(`/notifications/${id}/read`).then(load)
  }

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Notifications</h1>
          {unread > 0 && <p className="text-sm text-brand-muted mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-brand-muted underline">Mark all as read</button>
        )}
      </div>

      {notifs.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-brand-muted">
          <p className="text-3xl mb-3">🔔</p>
          <p>No notifications yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {notifs.map(n => {
          const s = typeStyle[n.type] || typeStyle.info
          return (
            <div key={n.id}
              className={`flex gap-4 rounded-xl border p-4 cursor-pointer transition-opacity ${s.bg} ${s.border} ${n.is_read ? 'opacity-60' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}>
              <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-brand-ink text-sm">{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: '#C00000' }} />}
                </div>
                <p className="text-sm text-brand-muted mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-brand-muted mt-1">{new Date(n.created_at).toLocaleString('en-PH')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
