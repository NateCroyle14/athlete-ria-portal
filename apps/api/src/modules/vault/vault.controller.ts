import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

const VAULT_DIR = path.join(process.cwd(), 'apps', 'api', '.data', 'vault');

function ensureDir() {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}
function listFiles() {
  ensureDir();
  const names = fs.readdirSync(VAULT_DIR);
  return names.map((name) => {
    const p = path.join(VAULT_DIR, name);
    const s = fs.statSync(p);
    return {
      name,
      size: s.size,
      added: s.birthtime.toISOString(),
      tag: name.toLowerCase().includes('contract') ? 'Legal'
           : name.toLowerCase().includes('pay') ? 'Payroll'
           : 'General',
    };
  }).sort((a, b) => (a.added < b.added ? 1 : -1));
}

@Controller('vault')
export class VaultController {
  @Get('list')
  getDocs() {
    return listFiles();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) return { ok: false, error: 'No file' };
    // File is already saved to VAULT_DIR by Multer's dest config
    return { ok: true, name: file.originalname, storedAs: file.filename };
  }
}