import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional({ type: [String], description: 'If omitted, marks all as read' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

export class AlertsStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() unread: number;
}

export class ListQueryDto {
  @ApiPropertyOptional({ default: 50 }) @IsOptional() @IsInt() @Min(1) take?: number;
  @ApiPropertyOptional({ default: 0 })  @IsOptional() @IsInt() @Min(0) skip?: number;
}