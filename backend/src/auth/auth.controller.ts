import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString() firstName: string
  @IsString() lastName: string
  @IsEmail() email: string
  @IsString() @MinLength(6) password: string
  @IsString() @IsOptional() department?: string
  @IsIn(['recruiter','applicant']) @IsOptional() role?: string
}

export class LoginDto {
  @IsEmail() email: string
  @IsString() password: string
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto) }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto) }
}
