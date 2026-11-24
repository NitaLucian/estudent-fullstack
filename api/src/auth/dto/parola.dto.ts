import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ParolaUitataDto {
  @IsEmail({}, { message: 'Adresa de email nu este validă' })
  email: string;
}

export class ParolaNouaDto {
  @IsString()
  @MinLength(20, { message: 'Legătura nu este validă' })
  @MaxLength(100)
  token: string;

  @IsString()
  @MinLength(10, { message: 'Parola are cel puțin 10 caractere' })
  @MaxLength(200)
  parola: string;
}
