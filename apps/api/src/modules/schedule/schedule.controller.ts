import { Controller, Get } from '@nestjs/common';
import type { GameCheck } from '@portal/shared';

@Controller('schedule')
export class ScheduleController {
  @Get('upcoming')
  getUpcoming(): GameCheck[] {
    return [
      { date: '2025-09-15', opponent: '@ NY', state: 'NY', amount: 135000, deposit: '2025-09-16' },
      { date: '2025-09-18', opponent: 'vs FL (Home)', state: 'FL', amount: 135000, deposit: '2025-09-19' },
      { date: '2025-09-22', opponent: '@ CA', state: 'CA', amount: 135000, deposit: '2025-09-23' },
      { date: '2025-09-26', opponent: '@ PA', state: 'PA', amount: 135000, deposit: '2025-09-27' },
    ];
  }
}
