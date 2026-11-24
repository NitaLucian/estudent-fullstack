import type { NextFunction, Request, Response } from 'express';
import { doarPrinProxy } from './proxy.js';

describe('doarPrinProxy', () => {
  const SECRET = 'un-secret-comun-de-cel-putin-32-de-caractere';
  const verifica = doarPrinProxy(SECRET);

  // o cerere și un răspuns „false”, cu doar ce folosește funcția
  function trimite(path: string, antet?: string) {
    const req = { path, get: () => antet } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();
    verifica(req, res as unknown as Response, next as NextFunction);
    return { res, next };
  }

  it('lasă să treacă cererile cu secretul corect', () => {
    const { res, next } = trimite('/api/studenti', SECRET);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('refuză cu 403 cererile fără secret', () => {
    const { res, next } = trimite('/api/auth/login');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('refuză un secret greșit, chiar de aceeași lungime', () => {
    const { res } = trimite('/api/auth/login', SECRET.replace(/.$/, 'X'));
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('lasă starea serverului accesibilă', () => {
    expect(trimite('/api/health').next).toHaveBeenCalled();
  });
});
