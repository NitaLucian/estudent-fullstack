import { Module } from '@nestjs/common';
import { SpecializariController } from './specializari.controller.js';
import { SpecializariService } from './specializari.service.js';

// Un modul grupează tot ce ține de o funcționalitate: controller + servicii.
@Module({
  controllers: [SpecializariController],
  providers: [SpecializariService],
})
export class SpecializariModule {}
