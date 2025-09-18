import { Module } from '@nestjs/common';
import { LiquidityController } from './liquidity.controller';
@Module({ controllers: [LiquidityController] })
export class LiquidityModule {}

