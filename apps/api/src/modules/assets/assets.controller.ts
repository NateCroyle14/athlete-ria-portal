import { Controller, Get } from '@nestjs/common';

@Controller('assets')
export class AssetsController {
  @Get('list')
  getAssets() {
    return [
      { type: 'Primary Residence (Miami)', estValue: 5200000, lastAppraisal: '2025-03-11' },
      { type: 'LA Condo', estValue: 2100000, lastAppraisal: '2024-12-01' },
      { type: 'Yacht (60’)', estValue: 1700000, lastAppraisal: '2025-01-21' },
      { type: 'Vehicle Fleet', estValue: 410000, lastAppraisal: '2025-08-10' },
    ];
  }
}