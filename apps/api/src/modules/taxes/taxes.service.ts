import { Injectable } from '@nestjs/common';

type Breakdown = { state: string; amount: number };

export interface TaxEstimate {
  ytdState: number;
  stateBreakdown: Breakdown[];
  lastUpdated: string;
}

@Injectable()
export class TaxesService {
  private estimateData: TaxEstimate | null = null;

  getEstimate(): TaxEstimate {
    // Always return a safe, consistent shape
    if (!this.estimateData) {
      this.estimateData = {
        ytdState: 0,
        stateBreakdown: [],
        lastUpdated: new Date().toISOString(),
      };
    }
    return this.estimateData;
  }

  // Optional helper to seed some demo values
  seedDemo() {
    this.estimateData = {
      ytdState: 12450,
      stateBreakdown: [
        { state: 'NY', amount: 7200 },
        { state: 'CA', amount: 4300 },
        { state: 'FL', amount: 950 },
      ],
      lastUpdated: new Date().toISOString(),
    };
    return this.getEstimate();
  }
}
