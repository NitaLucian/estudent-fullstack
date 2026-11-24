import { PartialType } from '@nestjs/swagger';
import { CreateGrupaDto } from './create-grupa.dto.js';

export class UpdateGrupaDto extends PartialType(CreateGrupaDto) {}
