import { Module } from '@nestjs/common';
import { NotificariListener } from './notificari.listener.js';

// Modulul nu are controller: doar ascultătorul de evenimente.
@Module({
  providers: [NotificariListener],
})
export class NotificariModule {}
