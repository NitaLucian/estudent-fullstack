// Evenimentele aplicației. Serviciul care face o acțiune doar ANUNȚĂ ce s-a întâmplat;
// cine vrea (aici, modulul de notificări) ascultă și reacționează, fără ca serviciul
// să știe ceva despre emailuri.

export const CONT_CREAT = 'cont.creat';
export class ContCreat {
  constructor(
    readonly email: string,
    readonly nume: string,
    readonly token: string, // tokenul pentru alegerea primei parole
  ) {}
}

export const PAROLA_CERUTA = 'parola.ceruta';
export class ParolaCeruta {
  constructor(
    readonly email: string,
    readonly nume: string,
    readonly token: string,
  ) {}
}

export const NOTA_SALVATA = 'nota.salvata';
export class NotaSalvata {
  constructor(
    readonly inscriereId: number,
    readonly disciplinaId: number,
    readonly valoare: number,
  ) {}
}
