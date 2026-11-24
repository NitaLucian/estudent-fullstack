import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateStudentDto {
  @IsString({ message: 'Numărul matricol este obligatoriu' })
  @Matches(/^[A-Z0-9]{3,12}$/, { message: 'Numărul matricol are 3–12 caractere: litere mari și cifre' })
  nrMatricol: string;

  @IsString({ message: 'Numele este obligatoriu' })
  @Length(2, 50, { message: 'Numele are între 2 și 50 de caractere' })
  nume: string;

  @IsString({ message: 'Prenumele este obligatoriu' })
  @Length(2, 50, { message: 'Prenumele are între 2 și 50 de caractere' })
  prenume: string;

  @IsEmail({}, { message: 'Adresa de email nu este validă' })
  email: string;

  // dată calendaristică, în formatul ISO: 2006-03-15
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Data nașterii trebuie să fie de forma AAAA-LL-ZZ' })
  dataNasterii?: string | null;

  @IsOptional()
  @IsInt({ message: 'Grupa trebuie să fie un număr (id)' })
  grupaId?: number | null;
}
