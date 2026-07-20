import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import MatchScoreCircle from '@/components/MatchScoreCircle'
import OpportunityTypeBadge from '@/components/OpportunityTypeBadge'
import { toast } from 'sonner'

interface Opportunity {
  id: string; type: string; title: string; department: string; description: string;
  duration: string; bandwidth: string; slots: number; slotsRemaining: number;
  skillsNeeded: string[]; status: string;
}

const DEPTS = ['All','Operations','Risk','Finance','Digital Products','Marketing','HR','Strategy']

export default function OpportunitiesPage({ matchesOnly = false }: { matchesOnly?: boolean }) {
  const { user } = useAuth()
  const [opps, setOpps] = useState<Opportunity[]>([])
  const [matches, setMatches] = useState<Record<string, { score: number; reasoning: string; appliedStatus?: string }>>({})
  const [typeFilter, setTypeFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [essayOpp, setEssayOpp] = useState<Opportunity | null>(null)
  const [essay, setEssay] = useState('')

  useEffect(() => {
    api.get('/opportunities?status=approved').then(r => setOpps(r.data)).catch(() => {})
    api.get('/matches/my-matches').then(r => {
      const m: Record<string, { score: number; reasoning: string; appliedStatus?: string }> = {}
      r.data.forEach((x: any) => { m[x.opportunity.id] = { score: Math.round(x.matchScore), reasoning: x.reasoningText, appliedStatus: x.status } })
      setMatches(m)
    }).catch(() => {})
  }, [])

  const filtered = opps.filter(o => {
    if (matchesOnly && !matches[o.id]) return false
    if (matchesOnly && matches[o.id].score < 70) return false
    if (typeFilter !== 'all' && o.type !== typeFilter) return false
    if (deptFilter !== 'all' && o.department !== deptFilter) return false
    const s = search.toLowerCase()
    if (s && !o.title.toLowerCase().includes(s) && !o.department.toLowerCase().includes(s) && !o.skillsNeeded.some(sk => sk.toLowerCase().includes(s))) return false
    return true
  }).sort((a, b) => (matches[b.id]?.score || 0) - (matches[a.id]?.score || 0))

  async function applyToOpp() {
    if (!essayOpp || !essay.trim()) return
    try {
      await api.post(`/opportunities/${essayOpp.id}/apply`, { essay })
      toast.success('Application submitted! The recruiter will be notified.')
      setMatches(m => ({ ...m, [essayOpp.id]: { ...m[essayOpp.id], appliedStatus: 'applied' } }))
      setEssayOpp(null)
      setEssay('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply.')
    }
  }

  const role = user?.role

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{matchesOnly ? 'My Matches' : 'Opportunities'}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {matchesOnly ? 'Opportunities ≥70% match with your skills — sorted by fit score.' : 'Browse all internal gigs, vacancies, and immersions.'}
          </p>
        </div>
        {role === 'recruiter' && !matchesOnly && (
          <Button asChild><a href="/recruiter/post">+ Post Opportunity</a></Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by skill or keyword…" className="flex-1 min-w-48" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gig">Gig</SelectItem>
            <SelectItem value="vacancy">Vacancy</SelectItem>
            <SelectItem value="immersion">Immersion</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{DEPTS.map(d => <SelectItem key={d} value={d.toLowerCase() === 'all' ? 'all' : d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No opportunities found.</CardContent></Card>}

      <div className="space-y-3">
        {filtered.map(o => {
          const m = matches[o.id]
          const applied = m?.appliedStatus === 'applied' || m?.appliedStatus === 'accepted' || m?.appliedStatus === 'rejected'
          return (
            <Card key={o.id}>
              <CardContent className="p-5 flex gap-4">
                {m && <MatchScoreCircle score={m.score} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <OpportunityTypeBadge type={o.type} />
                    <span className="font-semibold text-sm">{o.title}</span>
                    {o.slotsRemaining === 0 && <Badge variant="destructive">Filled</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{o.department} · {o.bandwidth} · {o.duration}</p>
                  {m?.reasoning && <p className="text-xs text-muted-foreground mb-2 italic">{m.reasoning}</p>}
                  <div className="flex flex-wrap gap-1">
                    {o.skillsNeeded.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
                <div className="shrink-0">
                  {applied
                    ? <Badge variant={m?.appliedStatus === 'accepted' ? 'approved' : m?.appliedStatus === 'rejected' ? 'rejected' : 'secondary'}>
                        {m?.appliedStatus === 'accepted' ? '✓ Accepted' : m?.appliedStatus === 'rejected' ? '✕ Declined' : '✓ Applied'}
                      </Badge>
                    : o.slotsRemaining > 0
                      ? <Button size="sm" onClick={() => { setEssayOpp(o); setEssay('') }}>Express interest</Button>
                      : <Button size="sm" variant="outline" disabled>Filled</Button>
                  }
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!essayOpp} onOpenChange={open => !open && setEssayOpp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Express Interest</DialogTitle>
            <DialogDescription>{essayOpp?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Why should we choose you?</Label>
            <Textarea value={essay} onChange={e => setEssay(e.target.value)} rows={6} placeholder="Tell the recruiter why you're a great fit for this opportunity..." />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEssayOpp(null)}>Cancel</Button>
              <Button onClick={applyToOpp} disabled={!essay.trim()}>Submit Application</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
