import { PartialType } from '@nestjs/swagger';
import { CreateSpecializareDto } from './create-specializare.dto.js';

// La modificare (PATCH) toate câmpurile sunt opționale, dar păstrează aceleași reguli.
// PartialType construiește automat această clasă din CreateSpecializareDto.
export class UpdateSpecializareDto extends PartialType(CreateSpecializareDto) {}
