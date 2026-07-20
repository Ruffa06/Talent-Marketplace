import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import OpportunityTypeBadge from '@/components/OpportunityTypeBadge'
import { toast } from 'sonner'

interface Opp {
  id: string; type: string; title: string; department: string; description: string;
  skillsNeeded: string[]; duration: string; bandwidth: string; slots: number; status: string;
  createdAt: string; poster: { firstName: string; lastName: string }
}

export default function AdminOpportunities() {
  const [opps, setOpps] = useState<Opp[]>([])
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dept, setDept] = useState('')

  function load() {
    api.get(`/opportunities?status=${tab}`).then(r => setOpps(r.data)).catch(() => {})
  }
  useEffect(() => { load() }, [tab])

  async function decide(id: string, action: 'approve' | 'reject') {
    try {
      await api.put(`/opportunities/${id}/${action}`)
      toast.success(action === 'approve' ? 'Opportunity approved and live!' : 'Opportunity rejected.')
      load()
    } catch { toast.error('Action failed.') }
  }

  const filtered = opps.filter(o =>
    (typeFilter === 'all' || o.type === typeFilter) &&
    (!dept || o.department.toLowerCase().includes(dept.toLowerCase()))
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Opportunities</h1>
      <p className="text-muted-foreground text-sm mb-6">Review, approve, or reject opportunities posted by recruiters.</p>

      <div className="flex gap-2 mb-5">
        {(['pending','approved','rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-primary text-white' : 'bg-white border text-muted-foreground hover:border-primary hover:text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gig">Gig</SelectItem>
            <SelectItem value="vacancy">Vacancy</SelectItem>
            <SelectItem value="immersion">Immersion</SelectItem>
          </SelectContent>
        </Select>
        <Input value={dept} onChange={e => setDept(e.target.value)} placeholder="Filter by department…" className="flex-1" />
      </div>

      {filtered.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No {tab} opportunities.</CardContent></Card>}

      <div className="space-y-4">
        {filtered.map(o => (
          <Card key={o.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <OpportunityTypeBadge type={o.type} />
                    <span className="font-semibold">{o.title}</span>
                    <Badge variant={o.status as 'pending' | 'approved' | 'rejected'}>{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{o.department} · {o.bandwidth} · {o.duration} · Posted by {o.poster.firstName} {o.poster.lastName}</p>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{o.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {o.skillsNeeded.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
                {tab === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => decide(o.id, 'approve')}>✓ Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => decide(o.id, 'reject')}>✕ Reject</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
