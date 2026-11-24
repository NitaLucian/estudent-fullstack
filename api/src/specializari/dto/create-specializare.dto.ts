import { IsString, Length, Matches } from 'class-validator';

// DTO (Data Transfer Object): forma datelor pe care clientul le trimite
// la crearea unei specializări, împreună cu regulile de validare.
export class CreateSpecializareDto {
  @IsString({ message: 'Codul este obligatoriu' })
  @Matches(/^[A-Z0-9]{1,15}$/, { message: 'Codul are 1–15 caractere: litere mari și cifre' })
  cod: string;

  @IsString({ message: 'Denumirea este obligatorie' })
  @Length(3, 100, { message: 'Denumirea are între 3 și 100 de caractere' })
  denumire: string;
}
