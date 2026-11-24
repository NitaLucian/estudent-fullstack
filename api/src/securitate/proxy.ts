import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// În producție, frontendul și proxy-ul /api sunt pe Cloudflare, iar backendul pe Render.
// Adresa de pe Render este însă publică: cine o apelează direct ocolește proxy-ul și,
// cu un X-Forwarded-For inventat, și limitarea cererilor. Proxy-ul trimite la fiecare
// cerere un secret comun (antetul X-Proxy-Secret); backendul le refuză pe celelalte.
export const ANTET_PROXY = 'x-proxy-secret';

export function doarPrinProxy(secret: string) {
  const asteptat = Buffer.from(secret);
  return (req: Request, res: Response, next: NextFunction) => {
    // starea serverului rămâne accesibilă: o verifică platforma de găzduire
    if (req.path === '/api/health') return next();
    const primit = Buffer.from(req.get(ANTET_PROXY) ?? '');
    // comparație în timp constant: durata nu dezvăluie câte caractere sunt corecte
    if (primit.length === asteptat.length && timingSafeEqual(primit, asteptat)) return next();
    res.status(403).json({ statusCode: 403, message: 'Accesul este permis doar prin aplicația web' });
  };
}
