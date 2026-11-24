import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { StudentiModule } from '../studenti/studenti.module.js';
import { NoteController } from './note.controller.js';
import { NoteService } from './note.service.js';

@Module({
  // StudentiModule exportă StudentiService: refolosim verificarea accesului la un student
  imports: [AniModule, StudentiModule],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
