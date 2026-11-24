import { createHash, randomBytes } from 'node:crypto';

// un token aleator (32 de octeți), scris cu caractere permise în adrese web
export const tokenAleator = () => randomBytes(32).toString('base64url');

// sha256 al unui token: în baza de date păstrăm doar amprenta, nu tokenul
export const amprenta = (token: string) => createHash('sha256').update(token).digest('hex');
