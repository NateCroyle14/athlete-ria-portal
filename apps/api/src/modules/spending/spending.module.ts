import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SpendingController } from './spending.controller';
import { SpendingService } from './spending.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, MulterModule.register({})],
  controllers: [SpendingController],
  providers: [SpendingService],
})
export class SpendingModule {}