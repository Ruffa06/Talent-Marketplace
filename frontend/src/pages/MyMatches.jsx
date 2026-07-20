import { useEffect, useState } from 'react'
import api from '../api'
import { useUser } from '../context/UserContext'
import MatchScoreCircle from '../components/MatchScoreCircle'
import TypeBadge from '../components/TypeBadge'
import SkillChip from '../components/SkillChip'

function fmt(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function EssayModal({ match, onClose, onSubmit }) {
  const [essay, setEssay] = useState('')
  const opp = match.opportunity
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-lg font-bold text-brand-ink mb-1">Express Interest</h2>
        <p className="text-sm text-brand-muted mb-1">{opp?.title}</p>
        {opp?.type === 'immersion' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-800">
            ℹ️ A Developmental Job Immersion requires manager approval after you apply.
          </div>
        )}
        <label className="block text-sm font-semibold text-brand-ink mb-2">
          Why should we choose you? <span className="font-normal text-brand-muted">(required)</span>
        </label>
        <textarea
          value={essay}
          onChange={e => setEssay(e.target.value)}
          rows={5}
          placeholder="Tell the opportunity owner why you're a great fit, what you'll bring, and what you hope to gain…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-brand-muted">Cancel</button>
          <button onClick={() => essay.trim() && onSubmit(essay)}
            disabled={!essay.trim()}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#C00000' }}>
            Submit Application
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyMatches() {
  const { user, showToast } = useUser()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [essayMatch, setEssayMatch] = useState(null)

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
    }).catch(() => showToast('Matching failed — check ANTHROPIC_API_KEY.', 'error'))
      .finally(() => setRunning(false))
  }

  function submitEssay(match, essay) {
    api.put(`/matches/${match.id}/interest`, { essay }).then(r => {
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, status: r.data.status, essay_response: essay } : m))
      setEssayMatch(null)
      if (match.opportunity?.type === 'immersion') {
        showToast("Your manager's approval is required for a Developmental Job Immersion. A request has been sent.")
      } else {
        showToast("Application submitted! The opportunity owner will review and respond.")
      }
    })
  }

  if (!user || user.role !== 'employee') {
    return <div className="p-8 text-brand-muted">My Matches is for employees. Switch to an Employee role.</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {essayMatch && (
        <EssayModal match={essayMatch} onClose={() => setEssayMatch(null)} onSubmit={essay => submitEssay(essayMatch, essay)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">My Matches</h1>
          <p className="text-sm text-brand-muted mt-0.5">AI-suggested opportunities — 70% match or higher.</p>
        </div>
        <button onClick={runMatching} disabled={running}
          className="text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
          style={{ backgroundColor: '#C00000' }}>
          {running ? 'Matching…' : '✨ Run AI Matching'}
        </button>
      </div>

      {loading && <div className="text-brand-muted py-8 text-center">Loading…</div>}

      {!loading && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold text-brand-ink mb-2">No matches yet</p>
          <p className="text-sm text-brand-muted mb-5">Make sure your profile has skills filled in, then click "Run AI Matching".</p>
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
          const applied = ['interested','pending_approval','accepted','declined'].includes(m.status)
          const dfrom = fmt(opp.duration_from)
          const dto = fmt(opp.duration_to)
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex gap-5">
              <MatchScoreCircle score={m.match_score} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <TypeBadge type={opp.type} />
                  <span className="text-xs text-brand-muted">{opp.department}</span>
                  {dfrom && <span className="text-xs text-brand-muted">· {dfrom}{dto ? ` – ${dto}` : ''}</span>}
                </div>
                <h3 className="font-semibold text-brand-ink text-base mb-2">{opp.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed mb-3">{m.reasoning_text}</p>
                {m.gaps?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 items-center">
                    <span className="text-xs text-brand-muted">Gaps to develop:</span>
                    {m.gaps.map(g => <SkillChip key={g} skill={g} variant="gap" />)}
                  </div>
                )}
                {m.status === 'accepted' && (
                  <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-2">
                    ✓ Accepted — good luck!
                  </div>
                )}
                {m.status === 'declined' && (
                  <div className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-muted text-xs font-medium px-3 py-1 rounded-full mb-2">
                    Not selected this time
                  </div>
                )}
                {!applied && (
                  <button onClick={() => setEssayMatch(m)}
                    className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: '#C00000' }}>
                    Express interest
                  </button>
                )}
                {applied && !['accepted','declined'].includes(m.status) && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-brand-muted font-medium">
                    {m.status === 'pending_approval' ? '⏳ Pending manager approval' : '✓ Application submitted'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
