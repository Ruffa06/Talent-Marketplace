import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MatchesService } from './matches.service'

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private svc: MatchesService) {}

  @Get('my-matches')
  myMatches(@Req() req: any) {
    return this.svc.getMyMatches(req.user.id)
  }

  @Get('reasoning/:opportunityId')
  reasoning(@Req() req: any, @Param('opportunityId') oppId: string) {
    return this.svc.getMatchReasoning(req.user.id, oppId)
  }
}
