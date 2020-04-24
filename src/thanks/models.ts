import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumberString()
  perPage: string;

  @IsString()
  cursor: string;
}

export interface ListResponse {
  total: number;
  nextCursor: string | null;
  items: Thanks[];
}