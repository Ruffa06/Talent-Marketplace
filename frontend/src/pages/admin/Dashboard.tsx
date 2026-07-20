import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalOpportunities: number; byType: { gig: number; vacancy: number; immersion: number }
  totalMatches: number; avgMatchScore: number; totalFeedbacks: number; avgRating: number
  topSkills: { skill: string; count: number }[]
  trendingOpps: { title: string; type: string; applications: number }[]
  perDay: { date: string; count: number }[]
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-3xl font-bold mb-1">{value}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function HBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-28 text-right text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      </div>
      <span className="text-sm font-medium w-8">{value}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => { api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}) }, [])

  if (!stats) return <div className="p-8 text-muted-foreground">Loading dashboard…</div>

  const maxSkill = Math.max(...stats.topSkills.map(s => s.count), 1)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-1">HR Analytics Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Pilot overview — {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Opportunities" value={stats.totalOpportunities} />
        <StatCard label="Matches Made" value={stats.totalMatches} />
        <StatCard label="Avg Match Score" value={`${stats.avgMatchScore}%`} sub="Out of 100" />
        <StatCard label="Avg Feedback Rating" value={`${stats.avgRating}★`} sub={`${stats.totalFeedbacks} reviews`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm mb-3">Opportunities by Type</p>
            <div className="space-y-4">
              {[['Gig', stats.byType.gig], ['Vacancy', stats.byType.vacancy], ['Immersion', stats.byType.immersion]].map(([t, v]) => (
                <HBar key={t as string} label={t as string} value={v as number} max={Math.max(stats.byType.gig, stats.byType.vacancy, stats.byType.immersion, 1)} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm mb-3">Top Skills in Demand</p>
            <div className="space-y-3">
              {stats.topSkills.slice(0, 6).map(s => (
                <HBar key={s.skill} label={s.skill} value={s.count} max={maxSkill} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-sm mb-3">Trending Opportunities</p>
            <div className="space-y-3">
              {stats.trendingOpps.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{i+1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.applications} applicants</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
