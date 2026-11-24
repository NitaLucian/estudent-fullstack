export interface MesajEmail {
  catre: string;
  subiect: string;
  text: string; // varianta text simplu (pentru clienții de email fără HTML)
  html: string;
}

// Ce știe să facă un serviciu de email. Ca la Stocare: o clasă abstractă, folosită
// ca token de injecție; implementarea concretă o alege EmailModule după configurare.
export abstract class ServiciuEmail {
  abstract trimite(mesaj: MesajEmail): Promise<void>;
}
