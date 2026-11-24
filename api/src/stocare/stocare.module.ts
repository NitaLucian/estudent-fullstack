import { Global, Module } from '@nestjs/common';
import { Stocare } from './stocare.js';
import { StocareS3 } from './stocare-s3.js';

// Cine cere `Stocare` primește un obiect `StocareS3`. Pentru teste (cursul 13) sau
// pentru alt furnizor, schimbăm doar această linie: restul aplicației nu află nimic.
@Global()
@Module({
  providers: [{ provide: Stocare, useClass: StocareS3 }],
  exports: [Stocare],
})
export class StocareModule {}
