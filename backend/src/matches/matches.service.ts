import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import Anthropic from '@anthropic-ai/sdk'

@Injectable()
export class MatchesService {
  private ai: Anthropic

  constructor(private supabase: SupabaseService) {
    this.ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  async getMyMatches(userId: string) {
    const { data: user } = await this.supabase.client
      .from('users')
      .select('current_skills, skills_to_develop')
      .eq('id', userId)
      .single()

    const { data: opps } = await this.supabase.client
      .from('opportunities')
      .select('*')
      .eq('status', 'approved')

    if (!user || !opps?.length) return []

    const matches: any[] = []
    for (const opp of opps) {
      const score = this.computeMatch(user, opp)
      if (score >= 70) {
        const { data: applied } = await this.supabase.client
          .from('matches')
          .select('id, status')
          .eq('opportunity_id', opp.id)
          .eq('user_id', userId)
          .single()
        matches.push({
          id: opp.id,
          title: opp.title,
          type: opp.type,
          department: opp.department,
          duration: opp.duration,
          description: opp.description,
          keySkills: opp.key_skills ?? [],
          bandwidth: opp.bandwidth,
          availableSlots: opp.available_slots,
          matchScore: score,
          applied: !!applied,
          applicationStatus: applied?.status ?? null,
        })
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10)
  }

  private computeMatch(user: any, opp: any): number {
    const userSkills: string[] = (
      opp.type === 'developmental_job_immersion'
        ? user.skills_to_develop
        : user.current_skills
    ) ?? []
    const requiredSkills: string[] = opp.key_skills ?? []

    if (!requiredSkills.length) return 75

    const userSkillsLower = userSkills.map((s: string) => s.toLowerCase())
    const matched = requiredSkills.filter((s) =>
      userSkillsLower.some((us) => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us)),
    )
    return Math.round((matched.length / requiredSkills.length) * 100)
  }

  async getMatchReasoning(userId: string, opportunityId: string): Promise<string> {
    const [{ data: user }, { data: opp }] = await Promise.all([
      this.supabase.client.from('users').select('current_skills, skills_to_develop, career_direction').eq('id', userId).single(),
      this.supabase.client.from('opportunities').select('title, type, key_skills, description').eq('id', opportunityId).single(),
    ])

    if (!user || !opp) return 'Unable to compute reasoning.'

    const userSkills = opp.type === 'developmental_job_immersion' ? user.skills_to_develop : user.current_skills

    try {
      const msg = await this.ai.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: `Given the opportunity "${opp.title}" requiring skills: ${(opp.key_skills ?? []).join(', ')}, and a user with skills: ${(userSkills ?? []).join(', ')} and career direction: ${user.career_direction ?? 'not specified'}, write a 2-sentence explanation of why this is a good match. Be encouraging and specific.`,
          },
        ],
      })
      return (msg.content[0] as any).text
    } catch {
      return `This opportunity aligns well with your skill set in ${(userSkills ?? []).slice(0, 2).join(' and ')}.`
    }
  }
}
