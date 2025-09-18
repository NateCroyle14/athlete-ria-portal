import { Controller, Get } from '@nestjs/common';

@Controller('portfolio')
export class PortfolioController {
  @Get('custodians')
  getCustodianAUM() {
    return [
      { custodian: 'Schwab', aum: 6950000 },
      { custodian: 'Fidelity', aum: 3450000 },
      { custodian: 'Pershing', aum: 2180000 },
      { custodian: 'Coinbase Custody', aum: 360000 },
    ];
  }
}
