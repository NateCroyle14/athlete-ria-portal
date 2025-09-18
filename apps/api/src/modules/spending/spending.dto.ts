import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SpendingTxnDto {
  @ApiProperty() id: string;

  @ApiProperty({ example: '2025-09-10' })
  @IsDateString() date: string;

  @ApiProperty({ example: 'Travel' })
  @IsString() category: string;

  @ApiProperty({ example: 'Delta Air Lines' })
  @IsString() merchant: string;

  @ApiProperty({ example: 1199.02 })
  @IsNumber() amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddTxnDto {
  @ApiProperty({ example: '2025-09-16' })
  @IsDateString() date: string;

  @ApiProperty({ example: 'Dining' })
  @IsString() category: string;

  @ApiProperty({ example: 'Chipotle' })
  @IsString() merchant: string;

  @ApiProperty({ example: 18.64 })
  @IsNumber() @Min(0) amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CategoryAmountDto {
  @ApiProperty({ example: 'Travel' }) category: string;
  @ApiProperty({ example: 1199.02 }) amount: number;
}

export class SpendingSummaryDto {
  @ApiProperty({ type: [CategoryAmountDto] })
  byCategory: CategoryAmountDto[];

  @ApiProperty({ example: 2000.00 })
  total: number;
}

export class MerchantAmountDto {
  @ApiProperty({ example: 'Delta Air Lines' }) merchant: string;
  @ApiProperty({ example: 2 }) count: number;
  @ApiProperty({ example: 1199.02 }) amount: number;
}