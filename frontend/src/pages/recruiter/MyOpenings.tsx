import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OpportunityTypeBadge from '@/components/OpportunityTypeBadge'
import { toast } from 'sonner'

interface Applicant {
  id: string; status: string; essay: string; createdAt: string;
  user: { id: string; firstName: string; lastName: string; department: string; currentSkills: string[]; skillsToDevelop: string[]; email: string }
  opportunity: { id: string; title: string; type: string; slotsRemaining: number }
}

export default function MyOpenings() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [selected, setSelected] = useState<Applicant | null>(null)

  function load() { api.get('/opportunities/my-openings/applicants').then(r => setApplicants(r.data)).catch(() => {}) }
  useEffect(() => { load() }, [])

  async function decide(id: string, action: 'accept' | 'reject') {
    try {
      await api.put(`/matches/${id}/decide`, { action })
      toast.success(action === 'accept' ? 'Applicant accepted! Notify them via email.' : 'Applicant declined.')
      setSelected(null)
      load()
    } catch { toast.error('Action failed.') }
  }

  const grouped = applicants.reduce<Record<string, Applicant[]>>((acc, a) => {
    const key = a.opportunity.id
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const STATUS_STYLE: Record<string, string> = {
    applied: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">My Openings</h1>
      <p className="text-muted-foreground text-sm mb-6">Applicants who have expressed interest in your opportunities.</p>

      {Object.keys(grouped).length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applicants yet.</CardContent></Card>
      )}

      {Object.entries(grouped).map(([oppId, apps]) => (
        <Card key={oppId} className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <OpportunityTypeBadge type={apps[0].opportunity.type} />
              <CardTitle className="text-base">{apps[0].opportunity.title}</CardTitle>
              <span className="text-xs text-muted-foreground ml-auto">{apps[0].opportunity.slotsRemaining} slot(s) remaining</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {apps.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelected(a)}>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {a.user.firstName[0]}{a.user.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.user.firstName} {a.user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{a.user.department}</p>
                </div>
                <Badge className={`text-xs border ${STATUS_STYLE[a.status] || ''}`}>{a.status}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected.user.firstName} {selected.user.lastName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Department</p>
                <p className="text-sm">{selected.user.department}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Current Skills</p>
                <div className="flex flex-wrap gap-1.5">{selected.user.currentSkills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1.5">Skills to Develop</p>
                <div className="flex flex-wrap gap-1.5">{selected.user.skillsToDevelop.map(s => <Badge key={s} className="bg-orange-50 text-orange-700">{s}</Badge>)}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Why should we choose them?</p>
                <div className="bg-muted/30 rounded-lg p-3 text-sm leading-relaxed">{selected.essay}</div>
              </div>
              {selected.status === 'applied' && (
                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-700 hover:bg-green-800" onClick={() => decide(selected.id, 'accept')}>✓ Accept</Button>
                  <Button className="flex-1" variant="destructive" onClick={() => decide(selected.id, 'reject')}>✕ Decline</Button>
                </div>
              )}
              {selected.status !== 'applied' && (
                <Badge className={`w-full justify-center py-2 ${STATUS_STYLE[selected.status] || ''}`}>{selected.status}</Badge>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
