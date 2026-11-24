import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { Public, UtilizatorCurent, type UtilizatorJwt } from './auth.decorators.js';
import { RaspunsAutentificare, UtilizatorAutentificat } from './auth.entity.js';
import { AuthService, type Sesiune } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

const COOKIE = 'refresh';

// /api/auth – autentificarea
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  // Refresh token-ul stă într-un cookie httpOnly: JavaScript-ul din pagină nu îl poate citi,
  // deci un script injectat (XSS) nu îl poate fura. Browserul îl trimite singur, doar către /api/auth.
  private optiuniCookie(): CookieOptions {
    const zile = this.config.get<number>('REFRESH_ZILE') ?? 7;
    return {
      httpOnly: true,
      secure: this.config.get('COOKIE_SECURE') === 'true', // doar prin HTTPS (în producție)
      sameSite: 'strict', // nu se trimite în cereri pornite de pe alte site-uri (protecție CSRF)
      path: '/api/auth',
      maxAge: zile * 24 * 60 * 60 * 1000,
    };
  }

  private raspunde(sesiune: Sesiune, res: Response): RaspunsAutentificare {
    res.cookie(COOKIE, sesiune.refreshToken, this.optiuniCookie());
    return { accessToken: sesiune.accessToken, utilizator: sesiune.utilizator };
  }

  // passthrough: true – setăm cookie-ul prin obiectul Response al Express,
  // dar lăsăm Nest să trimită în continuare valoarea întoarsă ca JSON
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() date: LoginDto, @Res({ passthrough: true }) res: Response): Promise<RaspunsAutentificare> {
    return this.raspunde(await this.auth.autentifica(date), res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<RaspunsAutentificare> {
    return this.raspunde(await this.auth.reimprospateaza(req.cookies?.[COOKIE]), res);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.deconecteaza(req.cookies?.[COOKIE]);
    res.clearCookie(COOKIE, { path: '/api/auth' });
  }

  // GET /api/auth/eu – cine sunt (necesită token de acces)
  @Get('eu')
  eu(@UtilizatorCurent() utilizator: UtilizatorJwt): Promise<UtilizatorAutentificat> {
    return this.auth.profil(utilizator.id);
  }
}
