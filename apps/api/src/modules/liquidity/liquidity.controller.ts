import { Controller, Get } from '@nestjs/common';

@Controller('liquidity')
export class LiquidityController {
  @Get('accounts')
  getAccounts() {
    return [
      { account: 'Chase Checking', balance: 285432.12 },
      { account: 'Fidelity Cash Mgmt', balance: 194521.77 },
      { account: 'BofA Savings', balance: 389504.9 },
    ];
  }
}
