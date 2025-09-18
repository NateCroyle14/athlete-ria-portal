import * as fs from 'fs';
import * as path from 'path';

export type Payment = {
  id: string;
  date: string;      // YYYY-MM-DD
  amount: number;    // USD
  note?: string;
};

export type Contract = {
  id: string;
  title: string;
  counterparty: string;           // Team, Brand, etc.
  type: 'Team' | 'Endorsement' | 'Appearance' | 'Licensing' | 'Other';
  startDate: string;              // YYYY-MM-DD
  endDate: string;                // YYYY-MM-DD
  totalValue?: number;            // optional, overall headline value
  status: 'active' | 'pending' | 'ended';
  notes?: string;
  payments: Payment[];            // upcoming + past payments
};

const DATA_DIR = path.join(process.cwd(), 'apps', 'api', '.data');
const FILE = path.join(DATA_DIR, 'contracts.json');

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export class ContractsService {
  private ensureStore() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE)) {
      const seed: Contract[] = [
        {
          id: uid(),
          title: 'Team Salary — 2025 Season',
          counterparty: 'New York Franchise',
          type: 'Team',
          startDate: '2025-08-01',
          endDate: '2026-06-30',
          totalValue: 5400000,
          status: 'active',
          notes: 'Standard player contract',
          payments: [
            { id: uid(), date: '2025-09-15', amount: 135000, note: 'Game 1' },
            { id: uid(), date: '2025-09-22', amount: 135000, note: 'Game 2' },
            { id: uid(), date: '2025-09-29', amount: 135000, note: 'Game 3' },
          ],
        },
        {
          id: uid(),
          title: 'Endorsement — Shoe Deal',
          counterparty: 'Nike',
          type: 'Endorsement',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          totalValue: 750000,
          status: 'active',
          payments: [
            { id: uid(), date: '2025-10-01', amount: 250000, note: 'Q4 retainer' },
          ],
        },
      ];
      fs.writeFileSync(FILE, JSON.stringify(seed, null, 2));
    }
  }

  private readAll(): Contract[] {
    this.ensureStore();
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) as Contract[];
  }

  private writeAll(rows: Contract[]) {
    fs.writeFileSync(FILE, JSON.stringify(rows, null, 2));
  }

  list(): Contract[] {
    return this.readAll().sort((a, b) => (a.endDate < b.endDate ? 1 : -1));
  }

  get(id: string): Contract | undefined {
    return this.readAll().find((c) => c.id === id);
  }

  add(body: Partial<Contract>) {
    const c: Contract = {
      id: uid(),
      title: body.title || 'Untitled Contract',
      counterparty: body.counterparty || 'Counterparty',
      type: (body.type as any) || 'Other',
      startDate: body.startDate || new Date().toISOString().slice(0, 10),
      endDate: body.endDate || new Date().toISOString().slice(0, 10),
      totalValue: Number(body.totalValue ?? 0),
      status: (body.status as any) || 'active',
      notes: body.notes || '',
      payments: Array.isArray(body.payments) ? body.payments : [],
    };
    const rows = this.readAll();
    rows.unshift(c);
    this.writeAll(rows);
    return c.id;
  }

  update(id: string, patch: Partial<Contract>) {
    const rows = this.readAll();
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    const merged: Contract = {
      ...rows[i],
      ...patch,
      payments: patch.payments ? patch.payments : rows[i].payments,
    };
    rows[i] = merged;
    this.writeAll(rows);
    return true;
  }

  remove(id: string) {
    const rows = this.readAll().filter((r) => r.id !== id);
    this.writeAll(rows);
    return true;
  }

  addPayment(contractId: string, p: Partial<Payment>) {
    const rows = this.readAll();
    const i = rows.findIndex((r) => r.id === contractId);
    if (i === -1) return false;
    const pay: Payment = {
      id: uid(),
      date: p.date || new Date().toISOString().slice(0, 10),
      amount: Math.abs(Number(p.amount || 0)),
      note: p.note || '',
    };
    rows[i].payments.unshift(pay);
    this.writeAll(rows);
    return pay.id;
  }

  upcomingPayments(days = 60) {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 3600_000);
    const out: Array<Payment & { contractId: string; title: string }> = [];
    this.readAll().forEach((c) => {
      c.payments.forEach((p) => {
        const d = new Date(p.date);
        if (d >= now && d <= end) out.push({ ...p, contractId: c.id, title: c.title });
      });
    });
    return out.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  expiringContracts(days = 45) {
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 3600_000);
    return this.readAll()
      .filter((c) => {
        const d = new Date(c.endDate);
        return d >= now && d <= end;
      })
      .map((c) => ({
        id: c.id,
        title: c.title,
        endDate: c.endDate,
        daysLeft: Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (24 * 3600_000)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }
}