import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddBody, ListResponse } from './models';
import { Thanks } from './thanks.entity';

@Injectable()
export class ThanksService {
  
  constructor(
    @InjectRepository(Thanks)
    private thanksRepository: Repository<Thanks>,
  ) {}
  
  async list(toUserId: string, perPage = 20, page = 0): Promise<ListResponse> {

    const [items, total] = await this.thanksRepository
      .createQueryBuilder()
      .where("thanks.id LIKE :id", { id: `${toUserId}#%` })
      .orderBy("thanks.id", "DESC")
      .skip(perPage * page)
      .take(perPage)
      .getManyAndCount();

    const first = await this.thanksRepository.findOne({ toUserId });

    let nextCursor: string | null = null
    if (items.length < total && items[0].id !== first.id) {
      nextCursor = ThanksService.createCursor(toUserId, page + 1, perPage)
    }
  
    return {
      total,
      nextCursor,
      items,
    }
  }

  private static createCursor(
    toUserId: string, 
    page: number,
    perPage: number
  ): string {
    return  encodeURIComponent(new Buffer(`${toUserId}_${page}_${perPage}`).toString('base64'));
  }

  private static parseCursor(
    cursor: string,
  ): [string, number, number] {
    const [toUserId, page, perPage] = new Buffer(decodeURIComponent(cursor), 'base64').toString('ascii').split('_');
    return [toUserId, parseInt(page), parseInt(perPage)];
  }

  listByCursor(cursor: string): Promise<ListResponse>  {
    const [toUserId, page, perPage] = ThanksService.parseCursor(cursor);
    return this.list(toUserId, perPage, page);
  }

  tryAdd(body: AddBody, tryIndex = 0): Promise<Thanks> {
    return this.add(body)
      .catch(async error => {
        if (tryIndex > 3) throw error;

        await ThanksService.delay(100);
        return this.tryAdd(body, tryIndex + 1)
      });
  }

  private async add(body: AddBody): Promise<Thanks> {
    const count = await this.thanksRepository.count({ toUserId: body.to });

    const thanks = new Thanks();
    thanks.id = ThanksService.generatePrimaryKey(count, body.to);
    thanks.fromUserId = body.from;
    thanks.toUserId = body.to;
    thanks.reason = body.reason;

    return this.thanksRepository
      .createQueryBuilder()
      .insert()
      .values([ thanks ])
      .execute()
      .then(() => thanks);
  }

  private static delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  private static generatePrimaryKey(count: number, id: string): string {
    return `${id}#${count.toString().padStart(6, '0')}`;
  }

}
