import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import StarRating from '@/components/StarRating'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Feedback {
  id: string; rating: number; comment: string; showOnHome: boolean; createdAt: string;
  user: { firstName: string; lastName: string }
  opportunity: { title: string; type: string }
}

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  useEffect(() => { api.get('/feedbacks').then(r => setFeedbacks(r.data)).catch(() => {}) }, [])

  async function toggleShow(id: string, current: boolean) {
    try {
      await api.put(`/feedbacks/${id}/show`, { showOnHome: !current })
      setFeedbacks(f => f.map(x => x.id === id ? { ...x, showOnHome: !current } : x))
      toast.success(!current ? 'Will show on home page.' : 'Hidden from home page.')
    } catch { toast.error('Failed to update.') }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Feedbacks</h1>
      <p className="text-muted-foreground text-sm mb-6">Check feedbacks to display on the home page of all users.</p>

      {feedbacks.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No feedback yet.</CardContent></Card>}

      <div className="space-y-3">
        {feedbacks.map(f => (
          <Card key={f.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{f.user.firstName} {f.user.lastName}</span>
                    <span className="text-muted-foreground text-xs">on</span>
                    <span className="text-sm">{f.opportunity.title}</span>
                  </div>
                  <StarRating rating={f.rating} />
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed italic">"{f.comment}"</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input type="checkbox" checked={f.showOnHome} onChange={() => toggleShow(f.id, f.showOnHome)} className="w-4 h-4 accent-primary" />
                  <span className="text-xs font-medium">Show on home</span>
                  {f.showOnHome && <Badge variant="approved">Featured</Badge>}
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
