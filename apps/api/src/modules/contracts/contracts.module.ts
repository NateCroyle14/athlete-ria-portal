import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService], // <-- so AlertsModule can reuse it
})
export class ContractsModule {}