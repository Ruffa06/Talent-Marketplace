import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { OpportunitiesModule } from './opportunities/opportunities.module'
import { MatchesModule } from './matches/matches.module'
import { NotificationsModule } from './notifications/notifications.module'
import { FeedbackModule } from './feedback/feedback.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { SupabaseModule } from './supabase/supabase.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    OpportunitiesModule,
    MatchesModule,
    NotificationsModule,
    FeedbackModule,
    DashboardModule,
  ],
})
export class AppModule {}
