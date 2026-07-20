import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const DEPTS = ['Operations','Risk','Finance','Digital Products','Marketing','HR','Strategy']

export default function PostOpportunity() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: 'gig', title: '', department: '', description: '', duration: '',
    skillsNeeded: '', bandwidth: 'Part-time', slots: 1,
  })
  const [file, setFile] = useState<File | null>(null)

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      skillsNeeded: form.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean),
      slots: Number(form.slots),
    }
    try {
      await api.post('/opportunities', payload)
      toast.success('Submitted for admin review. Once approved it goes live.')
      navigate('/recruiter/opportunities')
    } catch { toast.error('Failed to post opportunity.') }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">Post an Opportunity</h1>
      <p className="text-muted-foreground text-sm mb-6">All postings go to admin for review before becoming visible.</p>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Opportunity Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gig">⚡ Gig (short-term project)</SelectItem>
                  <SelectItem value="vacancy">💼 Vacancy (permanent role)</SelectItem>
                  <SelectItem value="immersion">🎓 Developmental Job Immersion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Sales Dashboard Build — Q3" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={v => set('department', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Duration</Label><Input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3 months" /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} required placeholder="Describe the work, the team, and what someone will learn or contribute..." /></div>
            <div className="space-y-1.5"><Label>Key Skills Needed <span className="text-muted-foreground font-normal">(comma-separated)</span></Label><Input value={form.skillsNeeded} onChange={e => set('skillsNeeded', e.target.value)} placeholder="e.g. data visualization, Excel, storytelling" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Bandwidth</Label>
                <Select value={form.bandwidth} onValueChange={v => set('bandwidth', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="50% allocation">50% allocation</SelectItem>
                    <SelectItem value="30% allocation">30% allocation</SelectItem>
                    <SelectItem value="Ad-hoc">Ad-hoc</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Available Slots</Label><Input type="number" min={1} value={form.slots} onChange={e => set('slots', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Attachment <span className="text-sm font-normal text-muted-foreground">(optional)</span></CardTitle></CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-primary/50 transition-colors">
              <span className="text-2xl">📎</span>
              <div className="flex-1">
                {file ? <><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size/1024).toFixed(0)} KB</p></>
                      : <><p className="text-sm text-muted-foreground">Click to upload a file</p><p className="text-xs text-muted-foreground">PDF, Word, Excel, or any format</p></>}
              </div>
              {file && <button type="button" onClick={e => { e.preventDefault(); setFile(null) }} className="text-muted-foreground hover:text-red-600">✕</button>}
              <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          ⏳ After submission, your posting will show as <strong>Pending Admin Approval</strong> until reviewed.
        </div>

        <Button type="submit" className="w-full" size="lg">Submit for Review →</Button>
      </form>
    </div>
  )
}
