import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'
import { useUser } from '../context/UserContext'
import TypeBadge from '../components/TypeBadge'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <p className="text-3xl font-bold text-brand-ink mb-1">{value}</p>
      <p className="text-sm font-medium text-brand-ink">{label}</p>
      {sub && <p className="text-xs text-brand-muted mt-0.5">{sub}</p>}
    </div>
  )
}

const TYPE_COLORS = { gig: '#C00000', vacancy: '#1D4ED8', immersion: '#166534' }

export default function Dashboard() {
  const { user, showToast } = useUser()
  const [data, setData] = useState(null)

  function load() {
    api.get('/dashboard/summary').then(r => setData(r.data))
  }

  useEffect(() => { load() }, [])

  function approve(id) {
    api.put(`/opportunities/${id}/approve`).then(() => {
      showToast('Opportunity approved and is now live.')
      load()
    }).catch(() => showToast('Error approving opportunity.', 'error'))
  }

  function reject(id) {
    api.put(`/opportunities/${id}/reject`).then(() => {
      showToast('Opportunity rejected.')
      load()
    }).catch(() => showToast('Error rejecting opportunity.', 'error'))
  }

  if (user?.role !== 'hr_admin') return <div className="p-8 text-brand-muted">Access restricted to HR Admins.</div>
  if (!data) return <div className="p-8 text-brand-muted">Loading dashboard…</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-1">HR Analytics Dashboard</h1>
      <p className="text-sm text-brand-muted mb-6">Pilot overview — {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>

      {/* Pending Approvals Queue */}
      {data.pending_approvals && data.pending_approvals.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold text-brand-ink">⏳ Pending Your Approval</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{data.pending_approvals.length}</span>
          </div>
          <div className="space-y-3">
            {data.pending_approvals.map(opp => (
              <div key={opp.id} className="bg-white border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TypeBadge type={opp.type} />
                    <span className="text-sm font-semibold text-brand-ink truncate">{opp.title}</span>
                  </div>
                  <p className="text-xs text-brand-muted">{opp.department} · Posted by {opp.poster_name || 'Manager'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/opportunities/${opp.id}/applicants`}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-brand-ink hover:bg-gray-50">
                    View
                  </Link>
                  <button onClick={() => approve(opp.id)}
                    className="px-3 py-1.5 text-xs rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#1B7A43' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(opp.id)}
                    className="px-3 py-1.5 text-xs rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#C00000' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Stats by Type */}
      {data.application_stats && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-brand-ink mb-3">Applications by Opportunity Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.application_stats.map(stat => (
              <div key={stat.type} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="mb-3"><TypeBadge type={stat.type} /></div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold text-brand-ink">{stat.pending}</p>
                    <p className="text-xs text-brand-muted">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1B7A43' }}>{stat.approved}</p>
                    <p className="text-xs text-brand-muted">Approved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stat.done}</p>
                    <p className="text-xs text-brand-muted">Done</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Matches Made" value={data.total_matches} />
        <StatCard label="Match Rate" value={`${data.match_rate}%`} sub="Profiles with ≥1 match" />
        <StatCard label="Avg Match Score" value={data.avg_match_score} sub="Out of 100" />
        <StatCard label="Recommend Rate" value={`${data.nps_rate}%`} sub="Would recommend platform" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand-ink mb-4">Opportunities by Type</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.opportunities_by_type}>
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.opportunities_by_type.map(e => (
                  <Cell key={e.type} fill={TYPE_COLORS[e.type] || '#6B6B76'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand-ink mb-4">Top Skills in Demand</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.top_skills} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#C00000" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand-ink mb-4">Avg Feedback Rating by Type</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.avg_feedback_by_type}>
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg_rating" radius={[4,4,0,0]}>
                {data.avg_feedback_by_type.map(e => (
                  <Cell key={e.type} fill={TYPE_COLORS[e.type] || '#6B6B76'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand-ink mb-4">Pilot Participant Funnel</h2>
          <div className="space-y-3">
            {data.funnel.map((stage, i) => {
              const max = data.funnel[0].count
              const pct = Math.round((stage.count / max) * 100)
              return (
                <div key={stage.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-brand-ink font-medium">{stage.stage}</span>
                    <span className="text-brand-muted">{stage.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `rgba(192,0,0,${0.4 + 0.15*i})` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
