import { AnStudiu } from '../ani/ani.entity.js';
import { Specializare } from '../specializari/specializare.entity.js';

export class Grupa {
  id: number;
  cod: string;
  anStudiuId: number;
  specializareId: number;
  specializare: Specializare;
  anStudiu: AnStudiu;
}
