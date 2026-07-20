import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OpportunitiesService } from './opportunities.service'

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class OpportunitiesController {
  constructor(private svc: OpportunitiesService) {}

  @Get()
  findAll(@Query('type') type: string, @Query('department') department: string, @Query('status') status: string) {
    return this.svc.findAll({ type, department, status })
  }

  @Get('my-openings')
  myOpenings(@Req() req: any) {
    return this.svc.getMyOpenings(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id)
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create(req.user.id, body)
  }

  @Put(':id/approve')
  approve(@Param('id') id: string) {
    return this.svc.approve(id)
  }

  @Put(':id/reject')
  reject(@Param('id') id: string) {
    return this.svc.reject(id)
  }

  @Post(':id/apply')
  apply(@Param('id') id: string, @Req() req: any, @Body() body: { essay: string }) {
    return this.svc.apply(id, req.user.id, body.essay)
  }

  @Put('matches/:matchId/decide')
  decide(@Param('matchId') matchId: string, @Req() req: any, @Body() body: { decision: 'accepted' | 'rejected' }) {
    return this.svc.decideMatch(matchId, body.decision, req.user.id)
  }
}
