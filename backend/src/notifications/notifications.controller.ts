import { Controller, Get, Put, Param, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { NotificationsService } from './notifications.service'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.svc.findForUser(req.user.id)
  }

  @Put('read-all')
  readAll(@Req() req: any) {
    return this.svc.markAllRead(req.user.id)
  }

  @Put(':id/read')
  read(@Param('id') id: string) {
    return this.svc.markRead(id)
  }
}
