import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class DashboardService {
  constructor(private supabase: SupabaseService) {}

  async getAdminStats() {
    const [opps, feedbacks, matches] = await Promise.all([
      this.supabase.client.from('opportunities').select('id, type, status, key_skills, created_at'),
      this.supabase.client.from('feedbacks').select('star, opportunity_id, opportunities!opportunity_id(type)'),
      this.supabase.client.from('matches').select('id, status, opportunity_id, opportunities!opportunity_id(type)'),
    ])

    const opportunities = opps.data ?? []
    const allFeedbacks = feedbacks.data ?? []

    const byType = { gig: 0, vacancy: 0, developmental_job_immersion: 0 }
    const byStatus = { pending: 0, approved: 0, rejected: 0, closed: 0 }
    const skillCount: Record<string, number> = {}

    for (const o of opportunities) {
      byType[o.type as keyof typeof byType] = (byType[o.type as keyof typeof byType] ?? 0) + 1
      byStatus[o.status as keyof typeof byStatus] = (byStatus[o.status as keyof typeof byStatus] ?? 0) + 1
      for (const skill of o.key_skills ?? []) {
        skillCount[skill] = (skillCount[skill] ?? 0) + 1
      }
    }

    const avgRating = allFeedbacks.length
      ? allFeedbacks.reduce((s, f) => s + (f.star ?? 0), 0) / allFeedbacks.length
      : 0

    const topSkills = Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))

    // Trending: approved opps with most matches
    const matchCount: Record<string, number> = {}
    for (const m of matches.data ?? []) {
      matchCount[m.opportunity_id] = (matchCount[m.opportunity_id] ?? 0) + 1
    }
    const trending = opportunities
      .filter((o) => o.status === 'approved')
      .map((o) => ({ ...o, applications: matchCount[o.id] ?? 0 }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5)

    // Daily created last 30 days
    const now = new Date()
    const dailyMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dailyMap[d.toISOString().split('T')[0]] = 0
    }
    for (const o of opportunities) {
      const day = o.created_at?.split('T')[0]
      if (day && day in dailyMap) dailyMap[day]++
    }
    const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    return { byType, byStatus, avgRating, topSkills, trending, daily, totalOpportunities: opportunities.length }
  }
}
