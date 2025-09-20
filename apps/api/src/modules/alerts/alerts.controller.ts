import { Body, Controller, Get, Post } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts') // <-- no /v1 here; global prefix adds it
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  /** GET /v1/alerts */
  @Get()
  list() {
    return this.service.list();
  }

  /** GET /v1/alerts/stats */
  @Get('stats')
  stats() {
    return this.service.stats();
  }

  /** POST /v1/alerts/read  -> { ids?: number[], all?: boolean } */
  @Post('read')
  markRead(@Body() body: { ids?: number[]; all?: boolean }) {
    return this.service.markRead(body);
  }

  /** POST /v1/alerts/refresh  -> reimport from .data/alerts.json */
  @Post('refresh')
  refresh() {
    return this.service.refresh();
  }
}