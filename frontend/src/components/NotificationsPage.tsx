import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

interface Notif { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])

  function load() { api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {}) }
  useEffect(() => { load() }, [])

  function markRead(id: string) {
    api.put(`/notifications/${id}/read`).then(() => setNotifs(n => n.map(x => x.id === id ? { ...x, isRead: true } : x)))
  }

  function markAll() {
    api.put('/notifications/read-all').then(() => setNotifs(n => n.map(x => ({ ...x, isRead: true }))))
  }

  const TYPE_STYLE: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    action: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifs.some(n => !n.isRead) && <Button variant="outline" size="sm" onClick={markAll}>Mark all as read</Button>}
      </div>
      {notifs.length === 0 && (
        <Card><CardContent className="py-16 text-center text-muted-foreground"><Bell className="mx-auto mb-3 opacity-30" size={40} /><p>No notifications yet.</p></CardContent></Card>
      )}
      <div className="space-y-3">
        {notifs.map(n => (
          <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-opacity ${!n.isRead ? 'opacity-100' : 'opacity-60'} ${TYPE_STYLE[n.type] || TYPE_STYLE.info}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-sm mt-0.5">{n.message}</p>
                <p className="text-xs mt-1 opacity-60">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-current shrink-0 mt-1.5" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
