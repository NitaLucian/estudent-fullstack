import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { GradDidactic } from '../../generated/prisma/client.js';

export class CreateProfesorDto {
  @IsString({ message: 'Numele este obligatoriu' })
  @Length(2, 50, { message: 'Numele are între 2 și 50 de caractere' })
  nume: string;

  @IsString({ message: 'Prenumele este obligatoriu' })
  @Length(2, 50, { message: 'Prenumele are între 2 și 50 de caractere' })
  prenume: string;

  @IsEmail({}, { message: 'Adresa de email nu este validă' })
  email: string;

  // enum-ul generat de Prisma din schema: ASISTENT, LECTOR, CONFERENTIAR, PROFESOR
  @IsEnum(GradDidactic, { message: 'Gradul didactic poate fi: ASISTENT, LECTOR, CONFERENTIAR, PROFESOR' })
  grad: GradDidactic;
}

export class UpdateProfesorDto extends PartialType(CreateProfesorDto) {}

// POST /api/profesori/:id/predari – profesorul preia o disciplină
export class CreatePredareDto {
  @IsInt({ message: 'Alegeți disciplina' })
  disciplinaId: number;

  // lipsă = anul universitar curent
  @IsOptional()
  @IsInt()
  anUniversitarId?: number;
}
