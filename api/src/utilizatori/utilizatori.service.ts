import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListaConturiDto } from './dto/utilizatori.dto.js';

const campuri = { id: true, email: true, rol: true, activ: true, ultimaAutentificare: true } as const;

@Injectable()
export class UtilizatoriService {
  constructor(private readonly prisma: PrismaService) {}

  // cel mult 100 de conturi; parolaHash nu este selectat (nu părăsește niciodată serverul)
  findAll(q: ListaConturiDto) {
    return this.prisma.utilizator.findMany({
      where: {
        rol: q.rol,
        email: q.cauta ? { contains: q.cauta.trim(), mode: 'insensitive' } : undefined,
      },
      select: campuri,
      orderBy: [{ rol: 'asc' }, { email: 'asc' }],
      take: 100,
    });
  }

  // Dezactivarea închide și sesiunile deschise ale contului. Token-ul de acces deja emis
  // rămâne valabil până expiră (cel mult JWT_EXPIRA, 15 minute): acesta este prețul
  // token-urilor care nu se verifică în baza de date la fiecare cerere.
  async seteazaActiv(id: number, activ: boolean, adminId: number) {
    if (id === adminId && !activ) throw new BadRequestException('Nu vă puteți dezactiva propriul cont');
    if (activ) {
      return this.prisma.utilizator.update({ where: { id }, data: { activ: true }, select: campuri });
    }
    const [cont] = await this.prisma.$transaction([
      this.prisma.utilizator.update({ where: { id }, data: { activ: false }, select: campuri }),
      this.prisma.sesiuneRefresh.updateMany({
        where: { utilizatorId: id, revocataLa: null },
        data: { revocataLa: new Date() },
      }),
    ]);
    return cont;
  }
}
