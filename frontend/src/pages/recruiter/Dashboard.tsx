import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MatchScoreCircle from '@/components/MatchScoreCircle'
import OpportunityTypeBadge from '@/components/OpportunityTypeBadge'

interface Match { id: string; matchScore: number; opportunity: { id: string; title: string; type: string; department: string } }

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => { api.get('/matches/my-matches').then(r => setMatches(r.data)).catch(() => {}) }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl mb-8 bg-[#1A1A2E] p-8">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-red rounded-l-xl" />
        <p className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3">Internal Opportunity Hub</p>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">Find your next move — without leaving.</h1>
        <p className="text-white/80 text-sm leading-relaxed max-w-2xl mb-6">
          Talent Marketplace lets you find gigs, projects, and roles across the company that match your skills and where you want to grow — and get matched automatically.
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          {[['🔍','Discover','Internal moves you didn\'t know existed'],['🌱','Grow','Without leaving the company'],['🤝','Get matched','AI suggests your best-fit opportunities']].map(([ic,t,d]) => (
            <div key={t} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3 min-w-[160px]">
              <span className="text-xl">{ic}</span>
              <div><p className="text-white font-semibold text-sm">{t}</p><p className="text-white/60 text-xs">{d}</p></div>
            </div>
          ))}
        </div>
        <Button asChild className="bg-brand-red hover:bg-red-700 text-white">
          <Link to="/recruiter/profile">Build my profile →</Link>
        </Button>
      </div>

      {/* Top Matches */}
      <h2 className="text-lg font-bold mb-4">Your Top Matches <span className="text-sm font-normal text-muted-foreground">(≥70% fit)</span></h2>
      {matches.length === 0
        ? <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">No matches yet. <Link to="/recruiter/profile" className="text-primary hover:underline">Complete your profile</Link> to get matched.</CardContent></Card>
        : <div className="space-y-3">
            {matches.slice(0, 10).map(m => (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <MatchScoreCircle score={Math.round(m.matchScore)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <OpportunityTypeBadge type={m.opportunity.type} />
                      <p className="font-semibold text-sm">{m.opportunity.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.opportunity.department}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/recruiter/opportunities`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
      }
    </div>
  )
}
