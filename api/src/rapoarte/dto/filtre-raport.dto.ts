import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

// Filtrele comune ale rapoartelor. Fără anUniversitarId se folosește anul curent.
export class FiltreRaportDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anUniversitarId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  specializareId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anStudiuId?: number;
}
