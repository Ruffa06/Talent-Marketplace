import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useUser } from '../context/UserContext'
import TypeBadge from '../components/TypeBadge'
import SkillChip from '../components/SkillChip'

export default function OpportunityDetail() {
  const { id } = useParams()
  const { user, showToast } = useUser()
  const navigate = useNavigate()
  const [opp, setOpp] = useState(null)
  const [match, setMatch] = useState(null)
  const [expressed, setExpressed] = useState(false)

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(r => setOpp(r.data))
    if (user) {
      api.get(`/matches?user_id=${user.id}`).then(r => {
        const m = r.data.find(m => m.opp_id === Number(id))
        setMatch(m)
        if (m && ['interested','pending_approval'].includes(m.status)) setExpressed(true)
      }).catch(() => {})
    }
  }, [id, user])

  function expressInterest() {
    if (!match) return
    api.put(`/matches/${match.id}/interest`).then(r => {
      setExpressed(true)
      if (opp.type === 'immersion') {
        showToast("Your manager's approval is required for a Developmental Job Immersion. A request has been sent for their review.")
      } else {
        showToast("Interest sent to the opportunity owner. They'll review and respond; you'll be notified of the outcome.")
      }
    })
  }

  if (!opp) return <div className="p-8 text-brand-muted">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-brand-muted mb-6 hover:text-brand-ink">← Back</button>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <TypeBadge type={opp.type} />
          <span className="text-sm text-brand-muted">{opp.duration_days ? `${opp.duration_days} days` : 'Permanent'}</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-ink mb-1">{opp.title}</h1>
        <p className="text-brand-muted mb-6">{opp.department} · {opp.bandwidth || 'Flexible'} · {opp.slots} slot{opp.slots !== 1 ? 's' : ''}</p>
        <p className="text-brand-ink leading-relaxed mb-6">{opp.description}</p>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Skills Needed</p>
          <div className="flex flex-wrap gap-1.5">
            {(opp.skills_needed || []).map(s => <SkillChip key={s} skill={s} />)}
          </div>
        </div>
        {opp.type === 'immersion' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
            ℹ️ A Developmental Job Immersion requires manager approval. Expressing interest will send a request for your manager's review.
          </div>
        )}
        {user?.role === 'employee' && match && (
          <button onClick={expressInterest} disabled={expressed}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: expressed ? '#6B6B76' : '#C00000' }}>
            {expressed ? '✓ Interest sent' : 'Express interest'}
          </button>
        )}
      </div>
    </div>
  )
}
