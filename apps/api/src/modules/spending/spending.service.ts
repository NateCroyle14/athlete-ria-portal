import { Injectable, Logger } from '@nestjs/common';
import type { Express } from 'express';
import { promises as fs } from 'fs';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type CsvRow = {
  date?: string;
  description?: string;
  category?: string;
  amount?: string | number;
};

@Injectable()
export class SpendingService {
  private readonly logger = new Logger(SpendingService.name);
  private readonly spending: PrismaClient['spendingTxn'];

  constructor(private readonly prisma: PrismaService) {
    // Alias the model so we can write this.spending.findMany(...)
    this.spending = this.prisma.spendingTxn;
  }

  /** GET /v1/spending/txns */
  async list() {
    return this.spending.findMany({
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
  }

  /** GET /v1/spending/summary */
  async summary() {
    const rows = await this.spending.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: { _all: true },
    });

    // Normalize Decimal to number for the API response
    return rows.map((r) => ({
      category: r.category ?? 'Uncategorized',
      total: r._sum.amount ? Number(r._sum.amount) : 0,
      count: r._count._all,
    }));
  }

  /** POST /v1/spending/import (multipart/form-data with field "file") */
  async importCsv(file?: Express.Multer.File): Promise<{ inserted: number }> {
    if (!file) {
      this.logger.warn('importCsv called with no file');
      return { inserted: 0 };
    }

    let buf: Buffer | null = null;

    // Prefer in-memory buffer (multer memory storage), otherwise read from temp path
    if (file.buffer && file.buffer.length > 0) {
      buf = file.buffer;
    } else if ((file as any).path) {
      buf = await fs.readFile((file as any).path);
    }

    if (!buf || buf.length === 0) {
      this.logger.warn('importCsv called with empty file/buffer');
      return { inserted: 0 };
    }

    const text = buf.toString('utf8');
    const rows = parseCsv(text); // CsvRow[]

    // Map & validate
    const data = rows
      .map((r) => normalizeRow(r))
      .filter((x): x is NonNullable<ReturnType<typeof normalizeRow>> => !!x);

    if (data.length === 0) {
      return { inserted: 0 };
    }

    // Insert (no skipDuplicates; not supported in your client and no unique index)
    const { count } = await this.spending.createMany({
      data,
    });

    return { inserted: count };
  }
}

/** Convert one CSV row into a createMany payload, or null if invalid */
function normalizeRow(r: CsvRow):
  | Prisma.SpendingTxnCreateManyInput
  | null {
  // date
  const rawDate = (r.date ?? '').trim();
  const iso = toISODate(rawDate);
  if (!iso) return null;

  // description
  const description = (r.description ?? '').trim();
  if (!description) return null;

  // category
  const category = (r.category ?? 'Uncategorized').trim() || 'Uncategorized';

  // amount
  const amt = typeof r.amount === 'number'
    ? r.amount
    : Number(String(r.amount ?? '').replace(/[$,]/g, '').trim());
  if (!isFinite(amt)) return null;

  return {
    date: new Date(iso),
    description,
    category,
    // Use Decimal to be precise; Prisma will accept number too, but Decimal is safest.
    amount: new Prisma.Decimal(amt),
  };
}

/** Accepts common date formats (YYYY-MM-DD, M/D/YYYY, etc.) and returns ISO YYYY-MM-DD or null */
function toISODate(s: string): string | null {
  if (!s) return null;
  const t = s.trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;

  // M/D/YYYY or MM/DD/YYYY
  const mdy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const m = t.match(mdy);
  if (m) {
    const mm = m[1].padStart(2, '0');
    const dd = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback to Date parse
  const d = new Date(t);
  if (isNaN(d.getTime())) return null;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

/** Minimal CSV parser that handles quotes and commas */
function parseCsv(text: string): CsvRow[] {
  const lines = splitCsvLines(text);
  if (lines.length === 0) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const out: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 1 && cols[0].trim() === '') continue; // skip blank lines
    const row: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c]] = (cols[c] ?? '').trim();
    }
    out.push({
      date: row['date'],
      description: row['description'],
      category: row['category'],
      amount: row['amount'],
    });
  }

  return out;
}

function splitCsvLines(text: string): string[] {
  // Normalize newlines first
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"') {
      // Escaped quote
      if (inQuotes && src[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  lines.push(current);
  return lines;
}

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}