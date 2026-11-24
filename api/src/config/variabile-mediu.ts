import { plainToInstance, Type } from 'class-transformer';
import { IsBooleanString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, validateSync } from 'class-validator';

// Variabilele de mediu de care are nevoie backendul. Dacă una obligatorie lipsește
// sau are o valoare greșită, aplicația NU pornește (e mai bine să afli imediat).
class VariabileMediu {
  @IsString()
  @IsNotEmpty({ message: 'DATABASE_URL lipsește (vezi .env.example)' })
  DATABASE_URL: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'PORT trebuie să fie un număr întreg' })
  @Min(1, { message: 'PORT este între 1 și 65535' })
  @Max(65535, { message: 'PORT este între 1 și 65535' })
  PORT: number = 3000;

  // cheia cu care serverul semnează token-urile JWT: lungă, aleatoare și secretă
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET trebuie să aibă cel puțin 32 de caractere' })
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRA: string = '15m';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  REFRESH_ZILE: number = 7;

  @IsOptional()
  @IsBooleanString({ message: 'COOKIE_SECURE este true sau false' })
  COOKIE_SECURE: string = 'false';

  // Stocarea fișierelor (orice serviciu compatibil S3)
  @IsString()
  @IsNotEmpty({ message: 'S3_ENDPOINT lipsește (vezi .env.example)' })
  S3_ENDPOINT: string;

  @IsOptional()
  @IsString()
  S3_REGION: string = 'us-east-1';

  @IsString()
  @IsNotEmpty({ message: 'S3_BUCKET lipsește' })
  S3_BUCKET: string;

  @IsString()
  @IsNotEmpty({ message: 'S3_ACCESS_KEY lipsește' })
  S3_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty({ message: 'S3_SECRET_KEY lipsește' })
  S3_SECRET_KEY: string;
}

// Funcția primită de ConfigModule: verifică variabilele citite din mediu și din .env
export function valideazaMediul(config: Record<string, unknown>) {
  const variabile = plainToInstance(VariabileMediu, config);
  const erori = validateSync(variabile);
  if (erori.length > 0) {
    // același mesaj poate apărea de mai multe ori: Set păstrează valorile distincte
    const mesaje = [...new Set(erori.flatMap((e) => Object.values(e.constraints ?? {})))];
    throw new Error(`Configurare greșită:\n - ${mesaje.join('\n - ')}`);
  }
  return variabile;
}
