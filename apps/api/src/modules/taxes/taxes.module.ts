import { Module } from '@nestjs/common';
import { TaxesController } from './taxes.controller';
import { TaxesService } from './taxes.service';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [ContractsModule],           // reuse ContractsService for payments
  controllers: [TaxesController],
  providers: [TaxesService],
  exports: [TaxesService],
})
export class TaxesModule {}