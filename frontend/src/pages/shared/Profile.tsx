import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const DIRECTIONS = ['Manager track', 'Expert track', 'Cross-functional']

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', department: '', bio: '', careerDirection: '', isOpenToOpportunities: true,
    currentSkills: [] as string[], skillsToDevelop: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [devInput, setDevInput] = useState('')

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, department: user.department, bio: user.bio || '', careerDirection: user.careerDirection || '', isOpenToOpportunities: user.isOpenToOpportunities, currentSkills: user.currentSkills || [], skillsToDevelop: user.skillsToDevelop || [] })
  }, [user])

  function addSkill(list: 'currentSkills' | 'skillsToDevelop', val: string) {
    const v = val.trim()
    if (v && !form[list].includes(v) && form[list].length < 8)
      setForm(f => ({ ...f, [list]: [...f[list], v] }))
  }

  function removeSkill(list: 'currentSkills' | 'skillsToDevelop', s: string) {
    setForm(f => ({ ...f, [list]: f[list].filter(x => x !== s) }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data } = await api.put('/users/me', form)
      updateUser(data)
      toast.success('Profile saved.')
    } catch { toast.error('Failed to save profile.') }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">My Profile</h1>
      <p className="text-muted-foreground text-sm mb-6">This is what the AI uses to match you to opportunities.</p>
      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>First name</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Last name</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>About me</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} placeholder="Brief description of what you do, your interests..." /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Skills <span className="text-sm font-normal text-muted-foreground">(max 8 each)</span></CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="mb-2 block">My top skills ({form.currentSkills.length}/8)</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {form.currentSkills.map(s => (
                  <Badge key={s} variant="secondary" className="gap-1">{s}
                    <button type="button" onClick={() => removeSkill('currentSkills', s)}><X size={12} /></button>
                  </Badge>
                ))}
              </div>
              {form.currentSkills.length < 8 && (
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('currentSkills', skillInput); setSkillInput('') } }} />
                  <Button type="button" size="sm" onClick={() => { addSkill('currentSkills', skillInput); setSkillInput('') }}><Plus size={14} /></Button>
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Skills I want to develop ({form.skillsToDevelop.length}/8)</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {form.skillsToDevelop.map(s => (
                  <Badge key={s} className="gap-1 bg-orange-50 text-orange-700 border-orange-200">{s}
                    <button type="button" onClick={() => removeSkill('skillsToDevelop', s)}><X size={12} /></button>
                  </Badge>
                ))}
              </div>
              {form.skillsToDevelop.length < 8 && (
                <div className="flex gap-2">
                  <Input value={devInput} onChange={e => setDevInput(e.target.value)} placeholder="Add a skill to develop" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('skillsToDevelop', devInput); setDevInput('') } }} />
                  <Button type="button" size="sm" variant="outline" onClick={() => { addSkill('skillsToDevelop', devInput); setDevInput('') }}><Plus size={14} /></Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Career Direction</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {DIRECTIONS.map(d => (
                <button key={d} type="button" onClick={() => setForm(f => ({ ...f, careerDirection: d }))}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${form.careerDirection === d ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Open to opportunities</p>
              <p className="text-xs text-muted-foreground">Visible to recruiters and admins when on</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, isOpenToOpportunities: !f.isOpenToOpportunities }))}
              className="relative w-12 h-6 rounded-full transition-colors shrink-0"
              style={{ backgroundColor: form.isOpenToOpportunities ? '#166534' : '#d1d5db' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: form.isOpenToOpportunities ? '26px' : '2px' }} />
            </button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">Save Profile</Button>
      </form>
    </div>
  )
}
