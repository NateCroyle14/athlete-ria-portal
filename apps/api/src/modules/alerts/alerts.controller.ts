import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertEntity } from './alerts.entity';
import { MarkReadDto, AlertsStatsDto, ListQueryDto } from './alerts.dto';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOkResponse({ type: AlertEntity, isArray: true })
  async list(@Query() q: ListQueryDto = {}) {
    const take = q.take ?? 50;
    const skip = q.skip ?? 0;
    return this.prisma.alert.findMany({
      take, skip,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('stats')
  @ApiOkResponse({ type: AlertsStatsDto })
  async stats(): Promise<AlertsStatsDto> {
    const total = await this.prisma.alert.count();
    const unread = await this.prisma.alert.count({ where: { read: false } });
    return { total, unread };
  }

  @Post('read')
  @ApiBody({
    type: MarkReadDto,
    examples: {
      all: { summary: 'Mark all as read', value: {} },
      some: { summary: 'Mark specific IDs', value: { ids: ['a1', 'b2'] } },
    },
  })
  async markRead(@Body() body: MarkReadDto) {
    if (!body?.ids?.length) {
      await this.prisma.alert.updateMany({ data: { read: true } });
    } else {
      await this.prisma.alert.updateMany({
        where: { id: { in: body.ids } },
        data: { read: true },
      });
    }
    return { ok: true };
  }

  @Post('refresh')
  async refresh() {
    // your existing seeding/demo logic here
    return { ok: true };
  }
}