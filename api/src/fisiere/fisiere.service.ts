import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { UtilizatorJwt } from '../auth/auth.decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Stocare } from '../stocare/stocare.js';
import { StudentiService } from '../studenti/studenti.service.js';
import { AdresaFisier, DocumentStudent } from './fisier.entity.js';
import { numeSigur, tipDupaContinut } from './tip-fisier.js';

const TIPURI_FOTOGRAFIE = ['image/jpeg', 'image/png', 'image/webp'];
const TIPURI_DOCUMENT = ['application/pdf', 'image/jpeg', 'image/png'];
const EXPIRA_IN = 300; // secunde (5 minute)

// multer citește numele fișierului ca text latin1; numele trimise de browsere sunt în UTF-8,
// așa că „Adeverință.pdf” ar apărea cu litere stricate („AdeverinÈ...”). Refacem octeții și îi citim corect.
const numeOriginal = (f: Express.Multer.File) => Buffer.from(f.originalname, 'latin1').toString('utf8');

@Injectable()
export class FisiereService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stocare: Stocare, // implementarea concretă o alege StocareModule
    private readonly studenti: StudentiService,
  ) {}

  // Vede fișierele oricine poate vedea fișa studentului (regula din cursul 8).
  // Le modifică doar administratorul și studentul însuși.
  private async verificaModificare(studentId: number, u: UtilizatorJwt) {
    await this.studenti.findOne(studentId); // 404 dacă nu există
    const alSau = u.rol === 'STUDENT' && u.studentId === studentId;
    if (u.rol !== 'ADMIN' && !alSau) throw new ForbiddenException('Nu puteți modifica fișierele acestui student');
  }

  // tipul real al fișierului, verificat după conținut
  private verificaTipul(fisier: Express.Multer.File | undefined, permise: string[]) {
    if (!fisier) throw new BadRequestException('Lipsește fișierul (câmpul „fisier”)');
    const tip = tipDupaContinut(fisier.buffer);
    if (!tip || !permise.includes(tip.tip)) {
      throw new BadRequestException(`Tip de fișier nepermis. Sunt acceptate: ${permise.join(', ')}`);
    }
    return tip;
  }

  async incarcaFotografie(studentId: number, fisier: Express.Multer.File | undefined, u: UtilizatorJwt) {
    await this.verificaModificare(studentId, u);
    const tip = this.verificaTipul(fisier, TIPURI_FOTOGRAFIE);
    // cheie nouă, aleatoare: nu suprascriem fișierul altcuiva și nu folosim numele dat de utilizator
    const cheie = `studenti/${studentId}/fotografie-${randomUUID()}.${tip.extensie}`;
    await this.stocare.salveaza(cheie, fisier!.buffer, tip.tip);
    const vechi = await this.prisma.student.findUniqueOrThrow({ where: { id: studentId }, select: { fotografieCheie: true } });
    await this.prisma.student.update({ where: { id: studentId }, data: { fotografieCheie: cheie } });
    if (vechi.fotografieCheie) await this.stocare.sterge(vechi.fotografieCheie);
  }

  async urlFotografie(studentId: number, u: UtilizatorJwt): Promise<AdresaFisier> {
    await this.studenti.findOneVerificat(studentId, u); // 404 / 403
    const { fotografieCheie } = await this.prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    if (!fotografieCheie) throw new NotFoundException('Studentul nu are fotografie');
    return { url: await this.stocare.urlDescarcare(fotografieCheie, { secunde: EXPIRA_IN }), expiraIn: EXPIRA_IN };
  }

  async documente(studentId: number, u: UtilizatorJwt): Promise<DocumentStudent[]> {
    await this.studenti.findOneVerificat(studentId, u);
    return this.prisma.document.findMany({
      where: { studentId },
      select: { id: true, nume: true, tip: true, marime: true, incarcatLa: true },
      orderBy: { incarcatLa: 'desc' },
    });
  }

  async incarcaDocument(studentId: number, fisier: Express.Multer.File | undefined, u: UtilizatorJwt): Promise<DocumentStudent> {
    await this.verificaModificare(studentId, u);
    const tip = this.verificaTipul(fisier, TIPURI_DOCUMENT);
    const cheie = `studenti/${studentId}/documente/${randomUUID()}.${tip.extensie}`;
    await this.stocare.salveaza(cheie, fisier!.buffer, tip.tip);
    return this.prisma.document.create({
      data: { studentId, nume: numeSigur(numeOriginal(fisier!)), cheie, tip: tip.tip, marime: fisier!.size, incarcatDeId: u.id },
      select: { id: true, nume: true, tip: true, marime: true, incarcatLa: true },
    });
  }

  private async documentVizibil(id: number, u: UtilizatorJwt) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Documentul ${id} nu există`);
    await this.studenti.findOneVerificat(doc.studentId, u);
    return doc;
  }

  async urlDocument(id: number, u: UtilizatorJwt): Promise<AdresaFisier> {
    const doc = await this.documentVizibil(id, u);
    const url = await this.stocare.urlDescarcare(doc.cheie, { numeFisier: doc.nume, secunde: EXPIRA_IN });
    return { url, expiraIn: EXPIRA_IN };
  }

  async stergeDocument(id: number, u: UtilizatorJwt) {
    const doc = await this.documentVizibil(id, u);
    await this.verificaModificare(doc.studentId, u);
    await this.prisma.document.delete({ where: { id } });
    await this.stocare.sterge(doc.cheie);
  }
}
