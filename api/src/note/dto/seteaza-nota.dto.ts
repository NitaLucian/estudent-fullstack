import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class SeteazaNotaDto {
  @IsInt({ message: 'Nota este un număr întreg' })
  @Min(1, { message: 'Nota este între 1 și 10' })
  @Max(10, { message: 'Nota este între 1 și 10' })
  valoare: number;

  // lipsă = data de azi
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Data examenului trebuie să fie de forma AAAA-LL-ZZ' })
  data?: string;
}
