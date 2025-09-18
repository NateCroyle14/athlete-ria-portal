import { ApiProperty } from '@nestjs/swagger';

export class AlertEntity {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ description: 'Short body/message' }) body: string;
  @ApiProperty({ enum: ['info', 'warn', 'error'] }) level: 'info' | 'warn' | 'error';
  @ApiProperty() read: boolean;
  @ApiProperty() createdAt: Date;
}