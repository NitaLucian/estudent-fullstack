import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListaConturiDto {
  @IsOptional()
  @IsIn(['ADMIN', 'PROFESOR', 'STUDENT'])
  rol?: 'ADMIN' | 'PROFESOR' | 'STUDENT';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cauta?: string;
}

export class StareContDto {
  @IsBoolean({ message: 'activ este true sau false' })
  activ: boolean;
}
