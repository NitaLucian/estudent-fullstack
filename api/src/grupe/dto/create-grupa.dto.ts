import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateGrupaDto {
  @IsString({ message: 'Codul este obligatoriu' })
  @Matches(/^[A-Z0-9-]{1,15}$/, { message: 'Codul are 1–15 caractere: litere mari, cifre și „-”' })
  cod: string;

  @IsInt({ message: 'Anul de studiu trebuie să fie un număr întreg' })
  @Min(1, { message: 'Anul de studiu este între 1 și 4' })
  @Max(4, { message: 'Anul de studiu este între 1 și 4' })
  an: number;

  @IsInt({ message: 'Alegeți specializarea' })
  specializareId: number;

  // opțional: dacă lipsește, baza de date pune valoarea implicită 30
  @IsOptional()
  @IsInt({ message: 'Capacitatea trebuie să fie un număr întreg' })
  @Min(10, { message: 'Capacitatea este între 10 și 40 de studenți' })
  @Max(40, { message: 'Capacitatea este între 10 și 40 de studenți' })
  capacitate?: number;
}
