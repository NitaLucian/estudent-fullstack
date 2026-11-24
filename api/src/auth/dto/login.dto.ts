import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Adresa de email nu este validă' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Parola este obligatorie' })
  @MaxLength(200) // o parolă uriașă ar ține serverul ocupat cu calculul hash-ului
  parola: string;
}
