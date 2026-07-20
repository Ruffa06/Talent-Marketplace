import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.get('SUPABASE_URL') || '',
      this.config.get('SUPABASE_SERVICE_KEY') || '',
    )
  }

  get db() { return this.client }
}
