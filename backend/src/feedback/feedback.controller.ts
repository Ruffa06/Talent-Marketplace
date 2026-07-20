import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { FeedbackService } from './feedback.service'

@Controller('feedbacks')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private svc: FeedbackService) {}

  @Get()
  findAll(@Query('showOnHome') showOnHome: string) {
    return this.svc.findAll(showOnHome === 'true')
  }

  @Post()
  create(@Req() req: any, @Body() body: { opportunityId: string; comment: string; star: number }) {
    return this.svc.create(req.user.id, body)
  }

  @Put(':id/show')
  toggleShow(@Param('id') id: string, @Body() body: { show: boolean }) {
    return this.svc.toggleShowOnHome(id, body.show)
  }
}
