import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class OpportunitiesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(filters?: { type?: string; department?: string; status?: string }) {
    let q = this.supabase.client.from('opportunities').select('*, users!posted_by(first_name, last_name, department)')
    if (filters?.type) q = q.eq('type', filters.type)
    if (filters?.department) q = q.eq('department', filters.department)
    if (filters?.status) q = q.eq('status', filters.status)
    q = q.order('created_at', { ascending: false })
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []).map(this.format)
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('opportunities')
      .select('*, users!posted_by(first_name, last_name, department)')
      .eq('id', id)
      .single()
    if (error || !data) throw new NotFoundException('Opportunity not found')
    return this.format(data)
  }

  async create(userId: string, dto: any) {
    const { data, error } = await this.supabase.client
      .from('opportunities')
      .insert({
        title: dto.title,
        type: dto.type,
        department: dto.department,
        duration: dto.duration,
        description: dto.description,
        key_skills: dto.keySkills ?? [],
        bandwidth: dto.bandwidth,
        available_slots: dto.availableSlots ?? 1,
        status: 'pending',
        posted_by: userId,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.format(data)
  }

  async approve(id: string) {
    const { data, error } = await this.supabase.client
      .from('opportunities')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.format(data)
  }

  async reject(id: string) {
    const { data, error } = await this.supabase.client
      .from('opportunities')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.format(data)
  }

  async apply(opportunityId: string, userId: string, essay: string) {
    const opp = await this.findOne(opportunityId)
    if (opp.status !== 'approved') throw new ForbiddenException('Opportunity is not open')

    const { data: existing } = await this.supabase.client
      .from('matches')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('user_id', userId)
      .single()
    if (existing) throw new ForbiddenException('Already applied')

    const { data, error } = await this.supabase.client
      .from('matches')
      .insert({
        opportunity_id: opportunityId,
        user_id: userId,
        essay,
        status: 'applied',
      })
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Notify poster
    await this.supabase.client.from('notifications').insert({
      type: 'application',
      message: `An applicant has expressed interest in "${opp.title}"`,
      to_user: opp.postedBy,
      related_id: opportunityId,
    })

    return data
  }

  async getMyOpenings(recruiterId: string) {
    const { data: opps, error } = await this.supabase.client
      .from('opportunities')
      .select('id, title, type, status, available_slots')
      .eq('posted_by', recruiterId)
    if (error) throw new Error(error.message)

    const result: any[] = []
    for (const opp of opps ?? []) {
      const { data: applicants } = await this.supabase.client
        .from('matches')
        .select('*, users!user_id(id, first_name, last_name, email, department, current_skills, skills_to_develop, career_direction, bio)')
        .eq('opportunity_id', opp.id)
      result.push({ ...opp, applicants: applicants ?? [] })
    }
    return result
  }

  async decideMatch(matchId: string, decision: 'accepted' | 'rejected', recruiterId: string) {
    const { data: match, error: me } = await this.supabase.client
      .from('matches')
      .select('*, opportunities!opportunity_id(title, posted_by, available_slots, id)')
      .eq('id', matchId)
      .single()
    if (me || !match) throw new NotFoundException('Match not found')
    if (match.opportunities.posted_by !== recruiterId) throw new ForbiddenException()

    await this.supabase.client.from('matches').update({ status: decision }).eq('id', matchId)

    const notifMsg = decision === 'accepted'
      ? `Congratulations! Your application for "${match.opportunities.title}" has been accepted.`
      : `Your application for "${match.opportunities.title}" has been declined.`

    await this.supabase.client.from('notifications').insert({
      type: decision === 'accepted' ? 'acceptance' : 'rejection',
      message: notifMsg,
      to_user: match.user_id,
      related_id: match.opportunity_id,
    })

    if (decision === 'accepted') {
      const newSlots = (match.opportunities.available_slots ?? 1) - 1
      await this.supabase.client
        .from('opportunities')
        .update({ available_slots: newSlots, status: newSlots <= 0 ? 'closed' : undefined })
        .eq('id', match.opportunity_id)

      if (newSlots <= 0) {
        // Notify all remaining applicants that it's closed
        const { data: others } = await this.supabase.client
          .from('matches')
          .select('user_id')
          .eq('opportunity_id', match.opportunity_id)
          .eq('status', 'applied')
        for (const o of others ?? []) {
          await this.supabase.client.from('notifications').insert({
            type: 'closed',
            message: `The opportunity "${match.opportunities.title}" is now closed.`,
            to_user: o.user_id,
            related_id: match.opportunity_id,
          })
        }
      }
    }

    return { success: true }
  }

  private format(o: any) {
    return {
      id: o.id,
      title: o.title,
      type: o.type,
      department: o.department,
      duration: o.duration,
      description: o.description,
      keySkills: o.key_skills ?? [],
      bandwidth: o.bandwidth,
      availableSlots: o.available_slots,
      status: o.status,
      postedBy: o.posted_by,
      poster: o.users ? {
        firstName: o.users.first_name,
        lastName: o.users.last_name,
        department: o.users.department,
      } : undefined,
      createdAt: o.created_at,
    }
  }
}
