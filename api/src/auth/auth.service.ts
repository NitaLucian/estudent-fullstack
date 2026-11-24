import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UtilizatorAutentificat } from './auth.entity.js';
import { LoginDto } from './dto/login.dto.js';

// datele utilizatorului citite pentru răspunsuri
const cuNume = {
  student: { select: { nume: true, prenume: true } },
  profesor: { select: { nume: true, prenume: true } },
} satisfies Prisma.UtilizatorInclude;

// tipul unui utilizator citit cu include: cuNume (calculat de Prisma)
type UtilizatorCuNume = Prisma.UtilizatorGetPayload<{ include: typeof cuNume }>;

// sha256 al refresh token-ului: în baza de date păstrăm doar amprenta lui
const amprenta = (token: string) => createHash('sha256').update(token).digest('hex');

export interface Sesiune {
  accessToken: string;
  refreshToken: string;
  utilizator: UtilizatorAutentificat;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private hashFals = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // un hash calculat o dată, folosit când emailul nu există (vezi autentifica)
  async onModuleInit() {
    this.hashFals = await argon2.hash(randomBytes(16).toString('hex'));
  }

  async autentifica(date: LoginDto): Promise<Sesiune> {
    const utilizator = await this.prisma.utilizator.findUnique({
      where: { email: date.email.toLowerCase() },
      include: cuNume,
    });
    // Verificăm o parolă chiar dacă emailul nu există: răspunsul durează la fel,
    // deci un atacator nu poate afla din timpul de răspuns ce adrese au cont.
    const parolaCorecta = await argon2.verify(utilizator?.parolaHash ?? this.hashFals, date.parola);
    if (!utilizator || !parolaCorecta || !utilizator.activ) {
      // același mesaj în toate cazurile: nu spunem dacă greșit este emailul sau parola
      throw new UnauthorizedException('Email sau parolă greșită');
    }
    await this.prisma.utilizator.update({ where: { id: utilizator.id }, data: { ultimaAutentificare: new Date() } });
    return this.sesiuneNoua(utilizator);
  }

  // Rotația refresh token-ului: fiecare token se folosește O SINGURĂ DATĂ.
  // Dacă un token deja folosit apare din nou, cineva l-a copiat: închidem toate sesiunile.
  async reimprospateaza(refreshToken: string | undefined): Promise<Sesiune> {
    if (!refreshToken) throw new UnauthorizedException('Sesiune inexistentă');
    const sesiune = await this.prisma.sesiuneRefresh.findUnique({
      where: { tokenHash: amprenta(refreshToken) },
      include: { utilizator: { include: cuNume } },
    });
    if (!sesiune) throw new UnauthorizedException('Sesiune inexistentă');
    if (sesiune.revocataLa) {
      await this.prisma.sesiuneRefresh.updateMany({
        where: { utilizatorId: sesiune.utilizatorId, revocataLa: null },
        data: { revocataLa: new Date() },
      });
      throw new UnauthorizedException('Sesiune refolosită: toate sesiunile au fost închise');
    }
    if (sesiune.expiraLa < new Date() || !sesiune.utilizator.activ) {
      throw new UnauthorizedException('Sesiune expirată');
    }
    await this.prisma.sesiuneRefresh.update({ where: { id: sesiune.id }, data: { revocataLa: new Date() } });
    return this.sesiuneNoua(sesiune.utilizator);
  }

  async deconecteaza(refreshToken: string | undefined) {
    if (!refreshToken) return;
    await this.prisma.sesiuneRefresh.updateMany({
      where: { tokenHash: amprenta(refreshToken), revocataLa: null },
      data: { revocataLa: new Date() },
    });
  }

  async profil(id: number): Promise<UtilizatorAutentificat> {
    const u = await this.prisma.utilizator.findUnique({ where: { id }, include: cuNume });
    if (!u) throw new UnauthorizedException('Utilizator inexistent');
    return this.pentruClient(u);
  }

  // un token de acces (JWT, ~15 minute) + un refresh token (aleator, ~7 zile)
  private async sesiuneNoua(u: UtilizatorCuNume): Promise<Sesiune> {
    // conținutul token-ului este SEMNAT, nu criptat: oricine îl poate citi (nu punem secrete în el)
    const accessToken = await this.jwt.signAsync({
      sub: u.id,
      email: u.email,
      rol: u.rol,
      sid: u.studentId,
      pid: u.profesorId,
    });
    const refreshToken = randomBytes(32).toString('base64url');
    const zile = this.config.get<number>('REFRESH_ZILE') ?? 7;
    await this.prisma.sesiuneRefresh.create({
      data: {
        utilizatorId: u.id,
        tokenHash: amprenta(refreshToken),
        expiraLa: new Date(Date.now() + zile * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken, utilizator: this.pentruClient(u) };
  }

  private pentruClient(u: UtilizatorCuNume): UtilizatorAutentificat {
    const persoana = u.student ?? u.profesor;
    return {
      id: u.id,
      email: u.email,
      rol: u.rol,
      nume: persoana ? `${persoana.prenume} ${persoana.nume}` : 'Administrator',
      studentId: u.studentId,
      profesorId: u.profesorId,
    };
  }
}
