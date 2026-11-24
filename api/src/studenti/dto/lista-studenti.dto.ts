import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// Parametrii din URL pentru lista de studenți:
//   /api/studenti?pagina=2&perPagina=20&cauta=pop&specializareId=1&grupaId=3&ordonare=nrMatricol
// Tot ce vine din URL este text; @Type(() => Number) îl transformă în număr înainte de validare.
export class ListaStudentiDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Pagina trebuie să fie un număr întreg' })
  @Min(1, { message: 'Paginile încep de la 1' })
  pagina: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'perPagina trebuie să fie un număr întreg' })
  @Min(1, { message: 'Cel puțin un rând pe pagină' })
  @Max(100, { message: 'Cel mult 100 de rânduri pe pagină' })
  perPagina: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  cauta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  specializareId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  grupaId?: number;

  @IsOptional()
  @IsIn(['nume', 'nrMatricol'], { message: 'Ordonarea poate fi: nume, nrMatricol' })
  ordonare: 'nume' | 'nrMatricol' = 'nume';
}
