import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../generated/prisma/client.js';

// Utilizatorul autentificat, așa cum îl vede frontendul
export class UtilizatorAutentificat {
  id: number;
  email: string;
  @ApiProperty({ enum: Rol, enumName: 'Rol' })
  rol: Rol;
  /** Numele afișat în bara de sus */
  nume: string;
  studentId: number | null;
  profesorId: number | null;
}

// Răspunsul la login și la reîmprospătarea sesiunii
export class RaspunsAutentificare {
  /** Token-ul de acces (JWT), trimis apoi în antetul Authorization: Bearer ... */
  accessToken: string;
  utilizator: UtilizatorAutentificat;
}
