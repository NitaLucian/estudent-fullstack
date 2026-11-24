import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto.js';

// La modificare nu se mai schimbă grupa: ea ține de înscrieri (/api/inscrieri).
// OmitType elimină câmpul grupaId, PartialType face restul câmpurilor opționale.
export class UpdateStudentDto extends PartialType(OmitType(CreateStudentDto, ['grupaId'] as const)) {}
