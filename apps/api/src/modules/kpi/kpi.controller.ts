import { Controller, Get } from '@nestjs/common';
import { KpiService, KpiSummary, KpiDebugDump } from './kpi.service';

@Controller('kpis') // NOTE: global prefix '/v1' is added in main.ts -> final path '/v1/kpis'
export class KpiController {
  constructor(private readonly kpis: KpiService) {}

  @Get('summary')
  async summary(): Promise<KpiSummary> {
    return this.kpis.getSummary();
  }

  // Helpful while wiring things up
  @Get('debug')
  async debug(): Promise<KpiDebugDump> {
    return this.kpis.debug();
  }
}
