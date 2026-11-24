// Ce știe să facă o „stocare de fișiere”, indiferent unde păstrează fișierele.
// Este o clasă abstractă (nu o interfață), pentru că Nest are nevoie de un obiect
// care să existe și la rulare, ca „cheie” pentru injecția de dependențe:
// serviciile cer `Stocare`, iar modulul decide ce implementare primesc.
export abstract class Stocare {
  // salvează (sau înlocuiește) un fișier sub cheia dată
  abstract salveaza(cheie: string, continut: Buffer, tip: string): Promise<void>;

  // o adresă temporară de la care browserul poate descărca direct fișierul
  abstract urlDescarcare(cheie: string, optiuni?: { numeFisier?: string; secunde?: number }): Promise<string>;

  abstract sterge(cheie: string): Promise<void>;
}
