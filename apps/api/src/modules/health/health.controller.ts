import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  root() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  @Get('liveness')
  liveness() {
    return { status: 'ok' };
  }

  @Get('readiness')
  async readiness() {
    try {
      // lightweight DB check
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('database not reachable');
    }
  }
}