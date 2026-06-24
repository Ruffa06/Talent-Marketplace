import { useEffect, useState } from 'react'
import api from '../api'
import { useUser } from '../context/UserContext'
import MatchScoreCircle from '../components/MatchScoreCircle'
import TypeBadge from '../components/TypeBadge'
import SkillChip from '../components/SkillChip'

export default function MyMatches() {
  const { user, showToast } = useUser()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)

  function fetchMatches() {
    if (!user) return
    setLoading(true)
    api.get(`/matches?user_id=${user.id}`).then(r => setMatches(r.data)).finally(() => setLoading(false))
  }

  useEffect(fetchMatches, [user])

  function runMatching() {
    setRunning(true)
    api.post('/matches/run').then(r => {
      showToast(`Matching complete. ${r.data.matches_created} new match${r.data.matches_created !== 1 ? 'es' : ''} found.`)
      fetchMatches()
    }).catch(() => showToast('Matching failed — check your ANTHROPIC_API_KEY.', 'error'))
    .finally(() => setRunning(false))
  }

  function expressInterest(match) {
    api.put(`/matches/${match.id}/interest`).then(r => {
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: r.data.status } : m))
      if (match.opportunity?.type === 'immersion') {
        showToast("Your manager's approval is required for a Developmental Job Immersion. A request has been sent for their review.")
      } else {
        showToast("Interest sent to the opportunity owner. They'll review and respond; you'll be notified of the outcome.")
      }
    })
  }

  if (!user || user.role !== 'employee') {
    return <div className="p-8 text-brand-muted">My Matches is for employees. Switch role to Employee to view your matches.</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">My Matches</h1>
          <p className="text-sm text-brand-muted mt-0.5">AI-suggested opportunities based on your profile.</p>
        </div>
        <button onClick={runMatching} disabled={running}
          className="text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
          style={{ backgroundColor: '#C00000' }}>
          {running ? 'Matching…' : '✨ Run AI Matching'}
        </button>
      </div>

      {loading && <div className="text-brand-muted py-8 text-center">Loading matches…</div>}

      {!loading && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-brand-ink mb-2">No matches yet</p>
          <p className="text-sm text-brand-muted mb-5">Make sure your profile has skills filled in, then click "Run AI Matching" to find your best-fit opportunities.</p>
          <button onClick={runMatching} disabled={running}
            className="text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
            style={{ backgroundColor: '#C00000' }}>
            {running ? 'Matching…' : 'Run AI Matching'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {matches.map(m => {
          const opp = m.opportunity
          if (!opp) return null
          const expressed = ['interested', 'pending_approval', 'accepted'].includes(m.status)
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex gap-5">
              <MatchScoreCircle score={m.match_score} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <TypeBadge type={opp.type} />
                  <span className="text-xs text-brand-muted">{opp.department} · {opp.duration_days ? `${opp.duration_days}d` : 'Permanent'}</span>
                </div>
                <h3 className="font-semibold text-brand-ink text-base mb-2">{opp.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed mb-3">{m.reasoning_text}</p>
                {m.gaps?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs text-brand-muted">Gaps to develop:</span>
                    {m.gaps.map(g => <SkillChip key={g} skill={g} variant="gap" />)}
                  </div>
                )}
                <button onClick={() => expressInterest(m)} disabled={expressed}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: expressed ? '#6B6B76' : '#C00000' }}>
                  {expressed
                    ? m.status === 'pending_approval' ? '⏳ Pending manager approval' : '✓ Interest sent'
                    : 'Express interest'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
