import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useUser } from '../context/UserContext'
import OpportunityCard from '../components/OpportunityCard'
import TypeBadge from '../components/TypeBadge'

const DEPTS = ['All', 'Operations', 'Risk', 'Finance', 'Digital Products', 'Marketing', 'HR']

export default function Opportunities() {
  const { user } = useUser()
  const [opps, setOpps] = useState([])
  const [matches, setMatches] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('live')

  useEffect(() => {
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (deptFilter !== 'all') params.set('department', deptFilter)
    if (search) params.set('skills', search)
    if (tab === 'pending') params.set('status', 'pending_review')
    api.get(`/opportunities?${params}`).then(r => setOpps(r.data))
    if (user) api.get(`/matches?user_id=${user.id}`).then(r => setMatches(r.data)).catch(() => {})
  }, [typeFilter, deptFilter, search, tab, user])

  const isHR = user?.role === 'hr_admin'
  const isManager = user?.role === 'manager' || isHR

  function approve(id) {
    api.put(`/opportunities/${id}/approve`).then(() => {
      setOpps(prev => prev.filter(o => o.id !== id))
    })
  }

  function reject(id) {
    api.put(`/opportunities/${id}/reject`).then(() => {
      setOpps(prev => prev.filter(o => o.id !== id))
    })
  }

  function getScore(oppId) {
    const m = matches.find(m => m.opp_id === oppId)
    return m ? m.match_score : null
  }

  const filtered = opps.filter(o => {
    const s = search.toLowerCase()
    if (!s) return true
    return o.title.toLowerCase().includes(s) ||
      (o.skills_needed || []).some(sk => sk.toLowerCase().includes(s)) ||
      o.department.toLowerCase().includes(s)
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Opportunities</h1>
          <p className="text-sm text-brand-muted mt-0.5">Browse internal vacancies, gigs, and developmental job immersions.</p>
        </div>
        {isManager && (
          <Link to="/post" className="text-white text-sm font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: '#C00000' }}>
            + Post Opportunity
          </Link>
        )}
      </div>

      {/* Compact legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs text-brand-muted items-center">
        <span className="font-medium">Opportunity types:</span>
        <TypeBadge type="gig" /> <span className="text-brand-muted">1 day–3 months project</span>
        <span className="mx-1">·</span>
        <TypeBadge type="vacancy" /> <span className="text-brand-muted">Open internal role</span>
        <span className="mx-1">·</span>
        <TypeBadge type="immersion" /> <span className="text-brand-muted">1 week–1 month exposure</span>
      </div>

      {isHR && (
        <div className="flex gap-2 mb-4">
          {['live', 'pending'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'bg-white text-brand-muted border border-gray-200'}`}
              style={tab === t ? { backgroundColor: '#C00000' } : {}}>
              {t === 'live' ? 'Live Opportunities' : '⏳ Pending Review'}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by skill or keyword…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-brand-red" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="all">All Types</option>
          <option value="gig">Gig</option>
          <option value="vacancy">Vacancy</option>
          <option value="immersion">Developmental Job Immersion</option>
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
          {DEPTS.map(d => <option key={d} value={d.toLowerCase() === 'all' ? 'all' : d}>{d}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-brand-muted">No opportunities found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(o => (
          <div key={o.id}>
            {o.status === 'pending_review' && (
              <div className="mb-1 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-800 font-medium">
                ⏳ Pending Admin Approval
              </div>
            )}
            <OpportunityCard opp={o} matchScore={getScore(o.id)} />
            {tab === 'pending' && isHR && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => approve(o.id)}
                  className="flex-1 text-sm font-medium py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#1B7A43' }}>
                  ✓ Approve & Go Live
                </button>
                <button onClick={() => reject(o.id)}
                  className="flex-1 text-sm font-medium py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#C00000' }}>
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
