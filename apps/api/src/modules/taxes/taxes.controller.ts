import { Controller, Get } from '@nestjs/common';

type StateRow = { state: string; amount: number };

@Controller('taxes') // NOTE: no 'v1' here
export class TaxesController {
  // Used by the dashboard widget (YTD)
  @Get('ytd')
  ytd() {
    // Demo: return 0 by default (matches your current dashboard screenshot)
    return { ytdState: 0 };
  }

  // Used by the Taxes page (breakdown + headline)
  @Get('estimate')
  estimate() {
    // Demo data that is always safe to .map() over on the client
    const stateBreakdown: StateRow[] = []; // start empty by default
    const ytd = stateBreakdown.reduce((sum, r) => sum + r.amount, 0);
    return { ytd, stateBreakdown };
  }

  // (Optional) tax rates endpoint your UI may call
  @Get('rates')
  rates() {
    return {
      states: [
        { state: 'FL', rate: 0 },
        { state: 'NY', rate: 0.0641 },
        { state: 'CA', rate: 0.08 },
      ],
      updatedAt: new Date().toISOString(),
    };
  }
}