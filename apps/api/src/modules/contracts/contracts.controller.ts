import { Controller, Get } from '@nestjs/common';

type ContractRow = {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'expired';
  amount: number;
  nextDue?: string; // ISO date
};

@Controller('contracts') // NOTE: no 'v1' here
export class ContractsController {
  @Get('list')
  list(): ContractRow[] {
    // Always return an array (never throw) so the UI renders
    return [
      // (Leave commented sample if you want visible rows)
      // {
      //   id: 'c1',
      //   title: 'Season Contract',
      //   status: 'active',
      //   amount: 2500000,
      //   nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      // },
    ];
  }

  @Get('upcoming-payments')
  upcoming() {
    // Keep consistent with dashboard needs; return empty safely
    return [];
  }

  @Get('expiring')
  expiring() {
    return [];
  }
}