import { IsInt, IsOptional } from 'class-validator';

export class CreateInscriereDto {
  @IsInt({ message: 'Studentul trebuie dat prin id' })
  studentId: number;

  @IsInt({ message: 'Alegeți grupa' })
  grupaId: number;

  // lipsă = anul universitar curent
  @IsOptional()
  @IsInt({ message: 'Anul universitar trebuie dat prin id' })
  anUniversitarId?: number;
}

// Mutarea studentului în altă grupă, în același an universitar
export class UpdateInscriereDto {
  @IsInt({ message: 'Alegeți grupa' })
  grupaId: number;
}

// Promovarea: toți studenții din grupa sursă (în anul ei) trec în grupa destinație, în alt an
export class PromovareDto {
  @IsInt({ message: 'Alegeți grupa sursă' })
  grupaSursaId: number;

  // lipsă = anul universitar curent
  @IsOptional()
  @IsInt()
  anSursaId?: number;

  @IsInt({ message: 'Alegeți grupa destinație' })
  grupaDestinatieId: number;

  @IsInt({ message: 'Alegeți anul universitar destinație' })
  anDestinatieId: number;
}
