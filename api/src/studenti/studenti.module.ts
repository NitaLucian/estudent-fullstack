import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { StudentiController } from './studenti.controller.js';
import { StudentiService } from './studenti.service.js';

@Module({
  imports: [AniModule, AuthModule], // anul curent; ParoleService (invitația pe email)
  controllers: [StudentiController],
  providers: [StudentiService],
  exports: [StudentiService], // folosit și de modulul de note (verificarea accesului)
})
export class StudentiModule {}
