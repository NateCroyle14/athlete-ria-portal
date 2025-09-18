import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';

@Module({
  imports: [
    // We call our own API over HTTP; baseURL is set inside the service to honor PORT.
    HttpModule,
  ],
  controllers: [KpiController],
  providers: [KpiService],
  exports: [KpiService],
})
export class KpiModule {}