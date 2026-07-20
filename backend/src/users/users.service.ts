import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !data) throw new NotFoundException('User not found')
    return this.format(data)
  }

  async update(id: string, dto: any) {
    const { data, error } = await this.supabase.client
      .from('users')
      .update({
        first_name: dto.firstName,
        last_name: dto.lastName,
        department: dto.department,
        current_skills: dto.currentSkills,
        skills_to_develop: dto.skillsToDevelop,
        career_direction: dto.careerDirection,
        bio: dto.bio,
        open_to_opportunities: dto.openToOpportunities,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.format(data)
  }

  private format(u: any) {
    return {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      department: u.department,
      role: u.role,
      currentSkills: u.current_skills ?? [],
      skillsToDevelop: u.skills_to_develop ?? [],
      careerDirection: u.career_direction,
      bio: u.bio,
      openToOpportunities: u.open_to_opportunities ?? true,
    }
  }
}
