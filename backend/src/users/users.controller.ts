import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UsersService } from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.users.findById(req.user.id)
  }

  @Put('me')
  updateMe(@Req() req: any, @Body() body: any) {
    return this.users.update(req.user.id, body)
  }
}
