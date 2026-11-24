import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    // registerAsync: opțiunile se construiesc abia după ce ConfigService este disponibil
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRA') ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // APP_GUARD: AuthGuard se aplică tuturor rutelor din aplicație
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
