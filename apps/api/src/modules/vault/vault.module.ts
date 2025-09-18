import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';

@Module({
  imports: [
    MulterModule.register({
      dest: path.join(process.cwd(), 'apps', 'api', '.data', 'vault'),
    }),
  ],
  controllers: [VaultController],
})
export class VaultModule {}