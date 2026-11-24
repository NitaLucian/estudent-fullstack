import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

// Test unitar pentru un serviciu cu dependențe: în locul bazei de date, al JWT și al
// configurării îi dăm obiecte „false” (mock-uri), create cu vi.fn().
// Așa verificăm DOAR logica serviciului, rapid și fără server.
describe('AuthService.autentifica', () => {
  let hashCorect: string;
  const prisma = {
    utilizator: { findUnique: vi.fn(), update: vi.fn() },
    sesiuneRefresh: { create: vi.fn() },
  };
  const jwt = { signAsync: vi.fn().mockResolvedValue('token-de-acces') };
  const config = { get: vi.fn().mockReturnValue(7) };
  const serviciu = new AuthService(
    prisma as unknown as PrismaService,
    jwt as unknown as JwtService,
    config as unknown as ConfigService,
  );

  beforeAll(async () => {
    hashCorect = await argon2.hash('parola-corecta');
    await serviciu.onModuleInit(); // pregătește hash-ul pentru emailurile inexistente
  });
  beforeEach(() => vi.clearAllMocks());

  const utilizator = () => ({
    id: 7, email: 'ana@x.ro', rol: 'STUDENT', activ: true, parolaHash: hashCorect,
    studentId: 3, profesorId: null, student: { nume: 'Pop', prenume: 'Ana' }, profesor: null,
  });

  it('autentifică un utilizator cu parola corectă și deschide o sesiune', async () => {
    prisma.utilizator.findUnique.mockResolvedValue(utilizator());
    const s = await serviciu.autentifica({ email: 'ANA@x.ro', parola: 'parola-corecta' });
    expect(s.accessToken).toBe('token-de-acces');
    expect(s.refreshToken).toHaveLength(43); // 32 de octeți în base64url
    expect(s.utilizator.nume).toBe('Ana Pop');
    // emailul a fost căutat cu litere mici, iar sesiunea a fost salvată
    expect(prisma.utilizator.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'ana@x.ro' } }));
    expect(prisma.sesiuneRefresh.create).toHaveBeenCalledTimes(1);
  });

  it('refuză o parolă greșită', async () => {
    prisma.utilizator.findUnique.mockResolvedValue(utilizator());
    await expect(serviciu.autentifica({ email: 'ana@x.ro', parola: 'gresita' })).rejects.toThrow(UnauthorizedException);
    expect(prisma.sesiuneRefresh.create).not.toHaveBeenCalled();
  });

  it('dă același mesaj pentru un email inexistent', async () => {
    prisma.utilizator.findUnique.mockResolvedValue(null);
    await expect(serviciu.autentifica({ email: 'nimeni@x.ro', parola: 'x' })).rejects.toThrow('Email sau parolă greșită');
  });

  it('refuză un cont dezactivat, chiar cu parola corectă', async () => {
    prisma.utilizator.findUnique.mockResolvedValue({ ...utilizator(), activ: false });
    await expect(serviciu.autentifica({ email: 'ana@x.ro', parola: 'parola-corecta' })).rejects.toThrow(UnauthorizedException);
  });
});
