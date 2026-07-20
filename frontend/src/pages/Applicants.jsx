import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useUser } from '../context/UserContext'
import SkillChip from '../components/SkillChip'

function ConfirmModal({ name, decision, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {decision === 'accepted' ? (
          <>
            <p className="text-2xl mb-3">⚠️</p>
            <h2 className="text-lg font-bold text-brand-ink mb-2">Before you approve</h2>
            <p className="text-sm text-brand-muted leading-relaxed mb-5">
              Please make sure you have had a <strong>qualifying conversation or meeting</strong> with <strong>{name}</strong> before clicking Approve.
              This helps ensure the opportunity is the right fit for both sides.
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl mb-3">🔕</p>
            <h2 className="text-lg font-bold text-brand-ink mb-2">Confirm decline</h2>
            <p className="text-sm text-brand-muted mb-5">
              Are you sure you want to decline <strong>{name}</strong>'s application? They will be notified.
            </p>
          </>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-brand-muted">Go back</button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: decision === 'accepted' ? '#1B7A43' : '#C00000' }}>
            {decision === 'accepted' ? 'Yes, Approve' : 'Yes, Decline'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Applicants() {
  const { id } = useParams()
  const { showToast } = useUser()
  const navigate = useNavigate()
  const [opp, setOpp] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [confirm, setConfirm] = useState(null) // {names, decision}

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(r => setOpp(r.data))
    load()
  }, [id])

  function load() {
    api.get(`/opportunities/${id}/applicants`).then(r => setApplicants(r.data))
  }

  function toggleSelect(matchId) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(matchId) ? s.delete(matchId) : s.add(matchId)
      return s
    })
  }

  function decide(matchIds, decision) {
    Promise.all(matchIds.map(mid => api.put(`/matches/${mid}/decide`, { decision })))
      .then(() => {
        showToast(decision === 'accepted'
          ? `${matchIds.length} applicant(s) approved. They've been notified.`
          : `${matchIds.length} applicant(s) declined. They've been notified.`)
        setSelected(new Set())
        setConfirm(null)
        load()
        api.get(`/opportunities/${id}`).then(r => setOpp(r.data))
      })
  }

  const pending = applicants.filter(a => ['interested','pending_approval'].includes(a.status))
  const decided = applicants.filter(a => ['accepted','declined'].includes(a.status))

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {confirm && (
        <ConfirmModal
          name={confirm.names}
          decision={confirm.decision}
          onCancel={() => setConfirm(null)}
          onConfirm={() => decide([...selected], confirm.decision)}
        />
      )}

      <button onClick={() => navigate(-1)} className="text-sm text-brand-muted mb-5 hover:text-brand-ink">← Back</button>

      {opp && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-ink">{opp.title}</h1>
          <p className="text-sm text-brand-muted">{opp.department} · {opp.slots_remaining ?? opp.slots} slot(s) remaining of {opp.slots}</p>
        </div>
      )}

      {pending.length > 0 && selected.size > 0 && (
        <div className="flex gap-3 mb-5 p-4 bg-brand-grey rounded-xl">
          <span className="text-sm text-brand-ink font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => {
              const names = applicants.filter(a => selected.has(a.match_id)).map(a => a.applicant_name).join(', ')
              setConfirm({ names, decision: 'declined' })
            }} className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-brand-muted">
              Decline selected
            </button>
            <button onClick={() => {
              const names = applicants.filter(a => selected.has(a.match_id)).map(a => a.applicant_name).join(', ')
              setConfirm({ names, decision: 'accepted' })
            }} className="px-4 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#1B7A43' }}>
              Approve selected
            </button>
          </div>
        </div>
      )}

      {pending.length === 0 && decided.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-brand-muted">
          <p className="text-3xl mb-3">📭</p><p>No applications yet.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-3">Pending Review ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map(a => (
              <div key={a.match_id}
                className={`bg-white rounded-xl border-2 shadow-sm p-5 cursor-pointer transition-colors ${selected.has(a.match_id) ? 'border-red-300' : 'border-gray-200'}`}
                onClick={() => toggleSelect(a.match_id)}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected.has(a.match_id)} onChange={() => {}}
                    className="mt-1 accent-red-600" onClick={e => e.stopPropagation()} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-brand-ink">{a.applicant_name}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Match {Math.round(a.match_score)}%</span>
                    </div>
                    <p className="text-xs text-brand-muted mb-3">{a.applicant_department}</p>
                    {a.current_skills?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-brand-muted mb-1">Current skills</p>
                        <div className="flex flex-wrap gap-1">{a.current_skills.map(s => <SkillChip key={s} skill={s} />)}</div>
                      </div>
                    )}
                    {a.skills_to_develop?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-brand-muted mb-1">Skills to develop</p>
                        <div className="flex flex-wrap gap-1">{a.skills_to_develop.map(s => <SkillChip key={s} skill={s} variant="gap" />)}</div>
                      </div>
                    )}
                    {a.essay_response && (
                      <div className="mt-3 p-3 bg-brand-grey rounded-lg">
                        <p className="text-xs font-semibold text-brand-muted mb-1">Why they should be chosen</p>
                        <p className="text-sm text-brand-ink leading-relaxed">"{a.essay_response}"</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setSelected(new Set([a.match_id])); setConfirm({ names: a.applicant_name, decision: 'declined' }) }}
                        className="px-4 py-1.5 rounded-lg text-sm border border-gray-200 text-brand-muted">Decline</button>
                      <button onClick={() => { setSelected(new Set([a.match_id])); setConfirm({ names: a.applicant_name, decision: 'accepted' }) }}
                        className="px-4 py-1.5 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: '#1B7A43' }}>Approve</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {decided.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted mb-3">Decided ({decided.length})</h2>
          <div className="space-y-3">
            {decided.map(a => (
              <div key={a.match_id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 opacity-75">
                <div className="flex-1">
                  <p className="font-medium text-brand-ink text-sm">{a.applicant_name}</p>
                  <p className="text-xs text-brand-muted">{a.applicant_department}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-brand-muted'}`}>
                  {a.status === 'accepted' ? '✓ Approved' : 'Declined'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
