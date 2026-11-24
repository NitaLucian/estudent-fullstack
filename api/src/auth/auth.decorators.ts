import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import { Rol } from '../generated/prisma/client.js';

// Ce află serverul despre utilizator din token-ul JWT (după verificarea semnăturii).
export interface UtilizatorJwt {
  id: number;
  email: string;
  rol: Rol;
  studentId: number | null; // pentru rolul STUDENT
  profesorId: number | null; // pentru rolul PROFESOR
}

// Cererea HTTP, completată de AuthGuard cu utilizatorul autentificat
export interface CerereAutentificata extends Request {
  utilizator?: UtilizatorJwt;
}

// @Public() marchează o rută accesibilă fără autentificare (login, health ...).
// SetMetadata atașează rutei o informație pe care AuthGuard o citește.
export const CHEIE_PUBLIC = 'public';
export const Public = () => SetMetadata(CHEIE_PUBLIC, true);

// @UtilizatorCurent() – parametrul metodei primește utilizatorul autentificat
export const UtilizatorCurent = createParamDecorator((_date: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<CerereAutentificata>().utilizator;
});
