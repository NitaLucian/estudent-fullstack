import { IsInt, IsString, Matches, Max, Min } from 'class-validator';

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
}
