import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupaDto } from './create-grupa.dto.js';

export class UpdateGrupaDto extends PartialType(CreateGrupaDto) {}
