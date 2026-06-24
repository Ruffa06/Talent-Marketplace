import { useEffect, useState } from 'react'
import api from '../api'
import { useUser } from '../context/UserContext'

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange && onChange(n)}
          className={`text-2xl transition-opacity ${n <= value ? 'opacity-100' : 'opacity-25'}`}
          style={{ color: '#C00000' }}>★</button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const { user, showToast } = useUser()
  const [tab, setTab] = useState('list')
  const [feedbacks, setFeedbacks] = useState([])
  const [matches, setMatches] = useState([])
  const [form, setForm] = useState({ match_id: '', rating: 0, comments: '', tag: 'Recommends the platform' })

  useEffect(() => {
    api.get('/feedback').then(r => setFeedbacks(r.data))
    if (user) api.get(`/matches?user_id=${user.id}`).then(r => setMatches(r.data.filter(m => m.status === 'completed'))).catch(() => {})
  }, [user])

  function submit(e) {
    e.preventDefault()
    api.post('/feedback', { ...form, match_id: Number(form.match_id), rating: Number(form.rating) })
      .then(() => {
        showToast('Feedback submitted. Thank you!')
        api.get('/feedback').then(r => setFeedbacks(r.data))
        setForm({ match_id: '', rating: 0, comments: '', tag: 'Recommends the platform' })
        setTab('list')
      })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Feedback</h1>

      <div className="flex gap-2 mb-6">
        {['list', 'submit'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'bg-white text-brand-muted border border-gray-200'}`}
            style={tab === t ? { backgroundColor: '#C00000' } : {}}>
            {t === 'list' ? '📋 All Feedback' : '✍️ Submit Feedback'}
          </button>
        ))}
      </div>

      {tab === 'submit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-brand-ink mb-5">Share Your Experience</h2>
          <form onSubmit={submit} className="space-y-5">
            {matches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-brand-ink mb-1">Opportunity</label>
                <select value={form.match_id} onChange={e => setForm(f => ({ ...f, match_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none" required>
                  <option value="">— Select an opportunity —</option>
                  {matches.map(m => <option key={m.id} value={m.id}>{m.opportunity?.title}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-2">Rating</label>
              <Stars value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1">What went well?</label>
              <textarea value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-ink mb-1">Tag</label>
              <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                <option>Recommends the platform</option>
                <option>Would do again</option>
                <option>Needs improvement</option>
                <option>Great match</option>
              </select>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#C00000' }}>
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-4">
          {feedbacks.length === 0 && <div className="text-center py-12 text-brand-muted">No feedback yet.</div>}
          {feedbacks.map(fb => (
            <div key={fb.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium text-brand-ink text-sm">{fb.opportunity_title || 'Opportunity'}</p>
                  <p className="text-xs text-brand-muted">{fb.submitter_name} · {fb.role}</p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1,2,3,4,5].map(n => (
                    <span key={n} className="text-lg" style={{ color: n <= fb.rating ? '#C00000' : '#D1D5DB' }}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-brand-ink leading-relaxed mb-2">"{fb.comments}"</p>
              <span className="text-xs bg-brand-grey text-brand-muted px-2 py-0.5 rounded-full">{fb.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
