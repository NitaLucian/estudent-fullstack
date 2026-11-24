import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CHEIE_PUBLIC, type CerereAutentificata, type UtilizatorJwt } from './auth.decorators.js';

// Un „guard” decide, înaintea controllerului, dacă cererea poate continua.
// Acesta este înregistrat GLOBAL (în AuthModule): protejează toate rutele,
// cu excepția celor marcate @Public(). Uitarea unui decorator nu lasă o rută deschisă.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ruta (sau controllerul) are @Public()?
    const estePublica = this.reflector.getAllAndOverride<boolean>(CHEIE_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (estePublica) return true;

    const cerere = context.switchToHttp().getRequest<CerereAutentificata>();
    // antetul are forma: Authorization: Bearer <token>
    const [tip, token] = cerere.headers.authorization?.split(' ') ?? [];
    if (tip !== 'Bearer' || !token) throw new UnauthorizedException('Autentificare necesară');

    try {
      // verifică semnătura și data expirării; un token modificat sau expirat este respins
      const continut = await this.jwt.verifyAsync<{ sub: number; email: string; rol: UtilizatorJwt['rol'] }>(token);
      cerere.utilizator = { id: continut.sub, email: continut.email, rol: continut.rol };
      return true;
    } catch {
      throw new UnauthorizedException('Token invalid sau expirat');
    }
  }
}
