import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateDisciplinaDto {
  @IsString({ message: 'Codul este obligatoriu' })
  @Matches(/^[A-Z0-9-]{2,20}$/, { message: 'Codul are 2–20 caractere: litere mari, cifre și „-”' })
  cod: string;

  @IsString({ message: 'Denumirea este obligatorie' })
  @Length(3, 100, { message: 'Denumirea are între 3 și 100 de caractere' })
  denumire: string;

  @IsInt({ message: 'Creditele sunt un număr întreg' })
  @Min(1, { message: 'Creditele sunt între 1 și 30' })
  @Max(30, { message: 'Creditele sunt între 1 și 30' })
  credite: number;

  @IsIn([1, 2], { message: 'Semestrul este 1 sau 2' })
  semestru: number;

  @IsInt({ message: 'Alegeți specializarea' })
  specializareId: number;

  @IsInt({ message: 'Alegeți anul de studiu' })
  anStudiuId: number;
}

export class UpdateDisciplinaDto extends PartialType(CreateDisciplinaDto) {}

// filtrele listei: /api/discipline?specializareId=1&anStudiuId=2&semestru=1
export class ListaDisciplineDto {
  @IsOptional() @Type(() => Number) @IsInt() specializareId?: number;
  @IsOptional() @Type(() => Number) @IsInt() anStudiuId?: number;
  @IsOptional() @Type(() => Number) @IsIn([1, 2]) semestru?: number;
}
