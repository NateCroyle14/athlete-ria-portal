import { Module } from '@nestjs/common';
import { DutyDaysController } from './dutydays.controller';
@Module({ controllers: [DutyDaysController] })
export class DutyDaysModule {}
