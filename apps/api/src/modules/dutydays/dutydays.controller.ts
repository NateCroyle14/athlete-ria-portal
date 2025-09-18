import { Controller, Get, Post, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type DutyDay = {
  date: string;  // YYYY-MM-DD
  state: string;
  location?: string;
  type?: 'game'|'travel'|'practice'|'other';
  notes?: string;
};

// store file lives in apps/api/.data/dutydays.json
const STORE_DIR  = path.join(process.cwd(), 'apps', 'api', '.data');
const STORE_FILE = path.join(STORE_DIR, 'dutydays.json');

function ensureStore(): DutyDay[] {
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    if (!fs.existsSync(STORE_FILE)) {
      const seed: DutyDay[] = [
        { date: '2025-09-10', state: 'NY', location: 'NYC',   type: 'travel', notes: 'Arrival' },
        { date: '2025-09-11', state: 'NY', location: 'NYC',   type: 'game',   notes: 'Game day' },
        { date: '2025-09-12', state: 'FL', location: 'Miami', type: 'travel' },
      ];
      fs.writeFileSync(STORE_FILE, JSON.stringify(seed, null, 2));
      return seed;
    }
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
function writeStore(data: DutyDay[]) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}
function summarizeByState(list: DutyDay[]) {
  const map = new Map<string, number>();
  for (const d of list) map.set(d.state, (map.get(d.state) ?? 0) + 1);
  return Array.from(map.entries()).map(([state, days]) => ({
    state, days, estTax: ['CA','NY','MA','PA'].includes(state) ? Math.round(days*900) : 0
  }));
}

@Controller('dutydays')
export class DutyDaysController {
  @Get('list') getList() { return ensureStore(); }
  @Post('add')
  add(@Body() body: DutyDay) {
    if (!body?.date || !body?.state) return { ok: false, error: 'date and state are required' };
    const j = ensureStore();
    j.push({ date: body.date, state: body.state, location: body.location ?? '', type: (body.type as any) ?? 'other', notes: body.notes ?? '' });
    writeStore(j);
    return { ok: true };
  }
  @Get('summary') getSummary() { return summarizeByState(ensureStore()); }
}