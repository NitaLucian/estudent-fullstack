import { IsString, MaxLength, MinLength } from 'class-validator';

export class SchimbaParolaDto {
  @IsString()
  @MinLength(1, { message: 'Parola actuală este obligatorie' })
  @MaxLength(200)
  parolaVeche: string;

  // o parolă lungă este mai sigură decât una scurtă și „complicată”
  @IsString()
  @MinLength(10, { message: 'Parola nouă are cel puțin 10 caractere' })
  @MaxLength(200)
  parolaNoua: string;
}
