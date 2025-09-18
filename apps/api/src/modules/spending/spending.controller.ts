import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpendingService } from './spending.service';

@Controller('spending')
export class SpendingController {
  constructor(private readonly service: SpendingService) {}

  @Get('txns')
  listTxns() {
    return this.service.listTxns();
  }

  @Get('summary')
  summary() {
    return this.service.summaryByCategory();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.service.importCsv(file.buffer);
  }
}