import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { SupabaseService } from '../supabase/supabase.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(private supabase: SupabaseService, private jwt: JwtService) {}

  async register(dto: any) {
    const { data: existing } = await this.supabase.db.from('users').select('id').eq('email', dto.email).single()
    if (existing) throw new ConflictException('Email already registered.')
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const { data, error } = await this.supabase.db.from('users').insert({
      first_name: dto.firstName, last_name: dto.lastName, email: dto.email,
      password_hash: passwordHash, department: dto.department || '',
      role: dto.role || 'applicant', current_skills: [], skills_to_develop: [],
      career_direction: '', bio: '', is_open_to_opportunities: true,
    }).select().single()
    if (error) throw new Error(error.message)
    const { password_hash, ...user } = data
    return { message: 'Account created.' }
  }

  async login(dto: any) {
    const { data: user, error } = await this.supabase.db.from('users').select('*').eq('email', dto.email).single()
    if (error || !user) throw new UnauthorizedException('Invalid credentials.')
    const valid = await bcrypt.compare(dto.password, user.password_hash)
    if (!valid) throw new UnauthorizedException('Invalid credentials.')
    const token = this.jwt.sign({ sub: user.id, role: user.role })
    const { password_hash, ...safe } = user
    return { token, user: this.formatUser(safe) }
  }

  formatUser(u: any) {
    return {
      id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name,
      department: u.department, role: u.role, currentSkills: u.current_skills || [],
      skillsToDevelop: u.skills_to_develop || [], careerDirection: u.career_direction || '',
      bio: u.bio || '', isOpenToOpportunities: u.is_open_to_opportunities,
    }
  }
}
