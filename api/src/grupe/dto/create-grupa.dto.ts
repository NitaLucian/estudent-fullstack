import { IsInt, IsString, Matches } from 'class-validator';

export class CreateGrupaDto {
  @IsString({ message: 'Codul este obligatoriu' })
  @Matches(/^[A-Z0-9-]{1,15}$/, { message: 'Codul are 1–15 caractere: litere mari, cifre și „-”' })
  cod: string;

  @IsInt({ message: 'Alegeți anul de studiu' })
  anStudiuId: number;

  @IsInt({ message: 'Alegeți specializarea' })
  specializareId: number;
}
