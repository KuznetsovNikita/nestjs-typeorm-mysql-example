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
  
  async list(toUserId: string, perPage = '20', cursorId = ''): Promise<ListResponse> {
    const perPageInt = parseInt(perPage);

    const builder = this.thanksRepository
      .createQueryBuilder()
      .where('id LIKE :id', { id: `${toUserId}#%` });
    
    const total = await builder.getCount();

    if (cursorId) {
      builder.andWhere(':cursorId > id ', { cursorId })
    }

    const items = await builder
      .orderBy('id', 'DESC')
      .take(perPageInt)
      .getMany();

    const first = await this.thanksRepository.findOne({ toUserId });

    let nextCursor: string | null = null
    if (items.length < total && items[0].id !== first.id) {
      nextCursor = ThanksService.createCursor(items[items.length - 1].id, perPageInt);
    }
  
    return {
      total,
      nextCursor,
      items,
    }
  }

  private static createCursor(
    id: string, 
    perPage: number
  ): string {
    return  encodeURIComponent(new Buffer(`${id}_${perPage}`).toString('base64'));
  }

  private static parseCursor(
    cursor: string,
  ): [string, string] {
    const [id, perPage] = new Buffer(decodeURIComponent(cursor), 'base64').toString('ascii').split('_');
    return [id, perPage];
  }

  listByCursor(cursor: string): Promise<ListResponse>  {
    const [id, perPage] = ThanksService.parseCursor(cursor);
    const [toUserId] = id.split('#');
    return this.list(toUserId, perPage, id);
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
