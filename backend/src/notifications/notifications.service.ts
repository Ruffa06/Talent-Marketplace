import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  async findForUser(userId: string) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('to_user', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async markRead(id: string) {
    await this.supabase.client.from('notifications').update({ read: true }).eq('id', id)
    return { success: true }
  }

  async markAllRead(userId: string) {
    await this.supabase.client.from('notifications').update({ read: true }).eq('to_user', userId)
    return { success: true }
  }
}
