import { Thanks } from "./thanks.entity";


export interface AddBody {
  from: string | null;
  to: string;
  reason: string;
}

export interface ListQuery {
  id: string;
  perPage: string;
  cursor: string;
}

export interface ListResponce {
  total: number;
  nextCursor: string | null;
  items: Thanks[];
}