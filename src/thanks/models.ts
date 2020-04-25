import { IsNotEmpty, IsNumberString, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Thanks } from "./thanks.entity";

export class AddBody {
  @IsString()
  from: string | null;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ListQuery {
  @ValidateIf(o => o.cursor == null)
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumberString()
  @IsOptional()
  perPage: string;

  @IsString()
  @IsOptional()
  cursor: string;
}

export interface ListResponse {
  total: number;
  nextCursor: string | null;
  items: Thanks[];
}