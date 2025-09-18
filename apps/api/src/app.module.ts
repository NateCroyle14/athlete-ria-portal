import { Module } from '@nestjs/common';

// Make Prisma available app-wide
import { PrismaModule } from './prisma/prisma.module';

// Feature modules
import { AlertsModule } from './modules/alerts/alerts.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { DutyDaysModule } from './modules/dutydays/dutydays.module';
import { IncomeModule } from './modules/income/income.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { LiquidityModule } from './modules/liquidity/liquidity.module';
import { AssetsModule } from './modules/assets/assets.module';
import { VaultModule } from './modules/vault/vault.module';
import { SpendingModule } from './modules/spending/spending.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    PrismaModule,        // global PrismaService
    AlertsModule,
    KpiModule,
    TaxesModule,
    ContractsModule,
    DutyDaysModule,
    IncomeModule,
    PortfolioModule,
    LiquidityModule,
    AssetsModule,
    VaultModule,
    SpendingModule,
    HealthModule,
  ],
})
export class AppModule {}