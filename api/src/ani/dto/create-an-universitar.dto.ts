import { IsDateString, Matches } from 'class-validator';

export class CreateAnUniversitarDto {
  @Matches(/^\d{4}-\d{4}$/, { message: 'Codul are forma 2027-2028' })
  cod: string;

  @IsDateString({ strict: true }, { message: 'Data de început trebuie să fie de forma AAAA-LL-ZZ' })
  dataInceput: string;

  @IsDateString({ strict: true }, { message: 'Data de sfârșit trebuie să fie de forma AAAA-LL-ZZ' })
  dataSfarsit: string;
}
