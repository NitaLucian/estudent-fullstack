import { plainToInstance, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

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
