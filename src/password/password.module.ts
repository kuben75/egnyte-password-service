import { Module } from '@nestjs/common';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { PwnedService } from './pwned.service';

@Module({
  controllers: [PasswordController],
  providers: [PasswordService, PwnedService]
})
export class PasswordModule {}
