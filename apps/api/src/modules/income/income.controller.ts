import { Controller, Get } from "@nestjs/common";

@Controller('income')
export class IncomeController {
  // Demo: return 3 days from now. Replace later with real schedule logic.
  @Get("/next-pay")
  nextPay() {
    const dt = new Date();
    dt.setDate(dt.getDate() + 3);
    return { date: dt.toISOString() };
  }
}