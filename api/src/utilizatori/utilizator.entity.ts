import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../generated/prisma/client.js';

export class Cont {
  id: number;
  email: string;
  @ApiProperty({ enum: Rol, enumName: 'Rol' })
  rol: Rol;
  activ: boolean;
  ultimaAutentificare: Date | null;
}
