import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export type KpiSummary = {
  ytdNetEarnings: number;
  dutyDaysLogged: number;
  nextPayDate: string | null;
  estStateTaxYtd: number;
  alertsCount: number;
};

export type KpiDebugDump = {
  baseURL: string;
  spendingSummary: any;
  dutyDays: any;
  incomeNext: any;
  taxesYtd: any;
  alertsStats: any;
};

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);
  private readonly baseURL: string;

  constructor(private readonly http: HttpService) {
    // Build a self-call base URL that works in dev by default
    const port = process.env.PORT || '3001';
    const prefix = process.env.GLOBAL_PREFIX || 'v1';
    // Allow override if you prefer configuring explicitly
    this.baseURL = process.env.SELF_API_URL || `http://localhost:${port}/${prefix}`;
  }

  private async get<T = any>(path: string, fallback: T): Promise<T> {
    try {
      const url = `${this.baseURL}${path}`;
      const res = await firstValueFrom(this.http.get<T>(url));
      return res.data as T;
    } catch (err: any) {
      const status = err?.response?.status;
      this.logger.warn(`GET ${path} failed${status ? `: ${status}` : ''}`);
      return fallback;
    }
  }

  async getSummary(): Promise<KpiSummary> {
    const [spendingSummary, dutyDays, incomeNext, taxesYtd, alertsStats] =
      await Promise.all([
        this.get<any>('/spending/summary', {}),
        this.get<any>('/dutydays/summary', {}),
        this.get<any>('/income/next-pay', null),
        this.get<any>('/taxes/ytd', {}),
        this.get<any>('/alerts/stats', {}),
      ]);

    // ytdNetEarnings: try common shapes from /spending/summary
    let ytdNetEarnings = 0;
    if (typeof spendingSummary?.net === 'number') ytdNetEarnings = spendingSummary.net;
    else if (typeof spendingSummary?.netYtd === 'number') ytdNetEarnings = spendingSummary.netYtd;
    else if (
      typeof spendingSummary?.income === 'number' &&
      typeof spendingSummary?.spent === 'number'
    ) ytdNetEarnings = spendingSummary.income - spendingSummary.spent;
    else if (
      typeof spendingSummary?.incomeYtd === 'number' &&
      typeof spendingSummary?.expenseYtd === 'number'
    ) ytdNetEarnings = spendingSummary.incomeYtd - spendingSummary.expenseYtd;

    // dutyDaysLogged: accept a variety of summary shapes
    let dutyDaysLogged = 0;
    if (typeof dutyDays?.total === 'number') dutyDaysLogged = dutyDays.total;
    else if (typeof dutyDays?.count === 'number') dutyDaysLogged = dutyDays.count;
    else if (typeof dutyDays?.ytd === 'number') dutyDaysLogged = dutyDays.ytd;

    // nextPayDate: from /income/next-pay
    let nextPayDate: string | null = null;
    if (incomeNext) {
      if (typeof incomeNext?.date === 'string') nextPayDate = incomeNext.date;
      else if (typeof incomeNext?.nextDate === 'string') nextPayDate = incomeNext.nextDate;
      else if (incomeNext?.next?.date) nextPayDate = String(incomeNext.next.date);
    }

    // estStateTaxYtd: from /taxes/ytd
    let estStateTaxYtd = 0;
    if (typeof taxesYtd?.ytdState === 'number') estStateTaxYtd = taxesYtd.ytdState;
    else if (typeof taxesYtd?.state === 'number') estStateTaxYtd = taxesYtd.state;
    else if (typeof taxesYtd?.ytd === 'number') estStateTaxYtd = taxesYtd.ytd;

    // alertsCount: unread preferred, else total
    let alertsCount = 0;
    if (typeof alertsStats?.unread === 'number') alertsCount = alertsStats.unread;
    else if (typeof alertsStats?.total === 'number') alertsCount = alertsStats.total;

    return {
      ytdNetEarnings,
      dutyDaysLogged,
      nextPayDate,
      estStateTaxYtd,
      alertsCount,
    };
  }

  // Optional: inspect what raw endpoints returned if something looks off
  async debug(): Promise<KpiDebugDump> {
    const [spendingSummary, dutyDays, incomeNext, taxesYtd, alertsStats] =
      await Promise.all([
        this.get<any>('/spending/summary', { _error: true }),
        this.get<any>('/dutydays/summary', { _error: true }),
        this.get<any>('/income/next-pay', { _error: true }),
        this.get<any>('/taxes/ytd', { _error: true }),
        this.get<any>('/alerts/stats', { _error: true }),
      ]);

    return {
      baseURL: this.baseURL,
      spendingSummary,
      dutyDays,
      incomeNext,
      taxesYtd,
      alertsStats,
    };
  }
}