import { Injectable } from '@nestjs/common';

export type Severity = 'info' | 'warn';

export interface Alert {
  id: string;
  type: string;
  title: string;
  detail: string;
  when: string;          // ISO string
  severity: Severity;
  read?: boolean;
}

@Injectable()
export class AlertsService {
  private alerts: Alert[] = [];

  private uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private nowISO(offsetMins = 0) {
    const d = new Date(Date.now() + offsetMins * 60_000);
    return d.toISOString();
  }

  seedDemo(count = 6) {
    const samples = [
      { type: 'Contract', title: 'Contract payment received', severity: 'info' as const },
      { type: 'Tax', title: 'Estimated taxes due soon', severity: 'warn' as const },
      { type: 'Duty-Day', title: 'Missing duty-day entry', severity: 'warn' as const },
      { type: 'Spending', title: 'Unusual transaction', severity: 'warn' as const },
      { type: 'Portfolio', title: 'Holdings update available', severity: 'info' as const },
      { type: 'Vault', title: 'New document uploaded', severity: 'info' as const },
    ];

    const list: Alert[] = [];
    for (let i = 0; i < count; i++) {
      const s = samples[i % samples.length];
      list.push({
        id: this.uid(),
        type: s.type,
        title: s.title,
        detail: s.severity === 'warn'
          ? 'Please review and take action.'
          : 'FYI: no action required.',
        when: this.nowISO(-i * 30), // staggered times
        severity: s.severity,
        read: false,
      });
    }
    this.alerts = list;
  }

  list(unreadOnly = false): Alert[] {
    return unreadOnly ? this.alerts.filter(a => !a.read) : this.alerts.slice();
  }

  stats() {
    const total = this.alerts.length;
    const unread = this.alerts.filter(a => !a.read).length;
    return { total, unread };
  }

  markReadByIds(ids: string[]) {
    const set = new Set(ids);
    this.alerts = this.alerts.map(a => (set.has(a.id) ? { ...a, read: true } : a));
    return this.stats();
  }

  markReadById(id: string) {
    return this.markReadByIds([id]);
  }

  refreshDemo() {
    this.seedDemo(6 + Math.floor(Math.random() * 4)); // 6–9 alerts
    return this.stats();
  }
}