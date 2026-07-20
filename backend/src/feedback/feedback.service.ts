import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class FeedbackService {
  constructor(private supabase: SupabaseService) {}

  async findAll(showOnHomeOnly?: boolean) {
    let q = this.supabase.client
      .from('feedbacks')
      .select('*, users!from_user(first_name, last_name), opportunities!opportunity_id(title, type)')
      .order('created_at', { ascending: false })
    if (showOnHomeOnly) q = q.eq('show_on_home', true)
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(userId: string, dto: { opportunityId: string; comment: string; star: number }) {
    const { data, error } = await this.supabase.client
      .from('feedbacks')
      .insert({ from_user: userId, opportunity_id: dto.opportunityId, comment: dto.comment, star: dto.star })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async toggleShowOnHome(id: string, show: boolean) {
    await this.supabase.client.from('feedbacks').update({ show_on_home: show }).eq('id', id)
    return { success: true }
  }
}
