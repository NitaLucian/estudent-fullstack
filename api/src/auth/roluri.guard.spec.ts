import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '../generated/prisma/client.js';
import { RoluriGuard } from './roluri.guard.js';

// Un context de execuție „fals”: guard-ul are nevoie doar de cerere, handler și clasă.
function context(rol: Rol): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ utilizator: { id: 1, email: 'x@x.ro', rol, studentId: null, profesorId: null } }) }),
  } as unknown as ExecutionContext;
}

describe('RoluriGuard', () => {
  // Reflector real, dar cu metoda getAllAndOverride înlocuită: noi decidem ce „roluri” are ruta
  const reflector = new Reflector();
  const guard = new RoluriGuard(reflector);

  it('permite orice rol când ruta nu are @Roluri', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(context('STUDENT'))).toBe(true);
  });

  it('permite rolul cerut', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(guard.canActivate(context('ADMIN'))).toBe(true);
  });

  it('refuză cu 403 un rol nepermis', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(context('STUDENT'))).toThrow(ForbiddenException);
  });
});
