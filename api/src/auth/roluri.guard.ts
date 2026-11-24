import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../generated/prisma/client.js';
import type { CerereAutentificata } from './auth.decorators.js';

// @Roluri('ADMIN') – doar utilizatorii cu unul dintre rolurile date pot apela ruta.
// Fără @Roluri, ruta este permisă oricărui utilizator autentificat.
export const CHEIE_ROLURI = 'roluri';
export const Roluri = (...roluri: Rol[]) => SetMetadata(CHEIE_ROLURI, roluri);

// Al doilea guard global, care rulează după AuthGuard (știm deja cine este utilizatorul).
// Autentificarea răspunde la „cine ești?” (401), autorizarea la „ai voie?” (403).
@Injectable()
export class RoluriGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roluri = this.reflector.getAllAndOverride<Rol[] | undefined>(CHEIE_ROLURI, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roluri) return true;
    const utilizator = context.switchToHttp().getRequest<CerereAutentificata>().utilizator;
    if (!utilizator || !roluri.includes(utilizator.rol)) {
      throw new ForbiddenException('Nu aveți drepturi pentru această operație');
    }
    return true;
  }
}
