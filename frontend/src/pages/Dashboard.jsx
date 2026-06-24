import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'
import { useUser } from '../context/UserContext'

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
  const { user } = useUser()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data))
  }, [])

  if (user?.role !== 'hr_admin') return <div className="p-8 text-brand-muted">Access restricted to HR Admins.</div>
  if (!data) return <div className="p-8 text-brand-muted">Loading dashboard…</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-1">HR Analytics Dashboard</h1>
      <p className="text-sm text-brand-muted mb-6">Pilot overview — {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>

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
