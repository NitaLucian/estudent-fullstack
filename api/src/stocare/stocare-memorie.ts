import { Stocare } from './stocare.js';

// O stocare „de jucărie”, în memorie, pentru teste: nu are nevoie de un server S3.
// Pentru că respectă aceeași clasă abstractă, restul aplicației funcționează neschimbat.
export class StocareMemorie extends Stocare {
  readonly fisiere = new Map<string, { continut: Buffer; tip: string }>();

  salveaza(cheie: string, continut: Buffer, tip: string) {
    this.fisiere.set(cheie, { continut, tip });
    return Promise.resolve();
  }

  urlDescarcare(cheie: string) {
    return Promise.resolve(`memorie://${cheie}`);
  }

  sterge(cheie: string) {
    this.fisiere.delete(cheie);
    return Promise.resolve();
  }
}
