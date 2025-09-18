import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class SpendingService {
  private readonly logger = new Logger(SpendingService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ✅ this getter name is fine; the RETURN must be the correct delegate
  private get spending() {
    return this.prisma.spendingTxn; // matches `model SpendingTxn { ... }`
  }

  async listTxns() {
    return this.spending.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async summaryByCategory() {
    const rows = await this.spending.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
    });
    return rows.map(r => ({
      category: r.category,
      total: r._sum.amount,
      count: r._count._all,
    }));
  }

  async importCsv(fileBuffer: Buffer) {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{ Date: string; Description: string; Category: string; Amount: string }>;

    const data = records.map(r => ({
      date: new Date(r.Date),
      description: r.Description,
      category: r.Category || 'Uncategorized',
      amount: r.Amount ? Number(r.Amount) : 0,
    }));

    if (!data.length) return { inserted: 0 };

    await this.spending.createMany({ data });
    return { inserted: data.length };
  }
}