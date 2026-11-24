import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { AniUniversitariService } from '../ani/ani-universitari.service.js';
import type { UtilizatorJwt } from '../auth/auth.decorators.js';
import type { ParoleService } from '../auth/parole.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { StudentiService } from './studenti.service.js';

// filtruAcces decide ce studenți vede fiecare utilizator: o greșeală aici înseamnă
// date personale expuse (IDOR). Merită câte un test pentru fiecare rol.
describe('StudentiService.filtruAcces', () => {
  const prisma = { predare: { findMany: vi.fn() } };
  const serviciu = new StudentiService(
    prisma as unknown as PrismaService,
    {} as AniUniversitariService,
    {} as ParoleService,
    {} as EventEmitter2,
  );
  const cine = (rol: UtilizatorJwt['rol'], extra: Partial<UtilizatorJwt> = {}): UtilizatorJwt => ({
    id: 1,
    email: 'x@estudent.ro',
    rol,
    studentId: extra.studentId ?? null,
    profesorId: extra.profesorId ?? null,
  });
  beforeEach(() => vi.clearAllMocks());

  it('administratorul vede toți studenții (filtru gol)', async () => {
    expect(await serviciu.filtruAcces(cine('ADMIN'))).toEqual({});
    expect(prisma.predare.findMany).not.toHaveBeenCalled();
  });

  it('studentul se vede doar pe el', async () => {
    expect(await serviciu.filtruAcces(cine('STUDENT', { studentId: 18 }))).toEqual({ id: 18 });
  });

  it('un cont de student fără fișă nu vede pe nimeni', async () => {
    expect(await serviciu.filtruAcces(cine('STUDENT'))).toEqual({ id: -1 });
  });

  it('profesorul fără discipline în anul curent nu vede pe nimeni', async () => {
    prisma.predare.findMany.mockResolvedValue([]);
    expect(await serviciu.filtruAcces(cine('PROFESOR', { profesorId: 4 }))).toEqual({ id: -1 });
  });

  it('profesorul vede studenții din specializările și anii disciplinelor lui', async () => {
    prisma.predare.findMany.mockResolvedValue([
      { disciplina: { specializareId: 1, anStudiuId: 2 } },
      { disciplina: { specializareId: 3, anStudiuId: 1 } },
    ]);
    const filtru = await serviciu.filtruAcces(cine('PROFESOR', { profesorId: 4 }));
    expect(prisma.predare.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { profesorId: 4, anUniversitar: { curent: true } } }),
    );
    expect(filtru).toEqual({
      inscrieri: {
        some: {
          anUniversitar: { curent: true },
          grupa: {
            OR: [
              { specializareId: 1, anStudiuId: 2 },
              { specializareId: 3, anStudiuId: 1 },
            ],
          },
        },
      },
    });
  });
});
