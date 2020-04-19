import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddBody, ListResponce } from './models';
import { Thanks } from './thanks.entity';

@Injectable()
export class ThanksService {
  
  constructor(
    @InjectRepository(Thanks)
    private thanksRepository: Repository<Thanks>,
  ) {}
  
  async list(toUserId: string, perPage: string, page = 0): Promise<ListResponce> {
    const perPageInt = parseInt(perPage);
    const list = await this.thanksRepository.find({ toUserId });

    const [items, nextCursor] = ThanksService.getPage(page, perPageInt, toUserId, list);
  
    return {
      total: list.length,
      nextCursor,
      items,
    }
  }

  private static getPage(
    page: number,
    perPage: number,
    toUserId: string,
    list: Thanks[],
  ): [Thanks[], string | null] {
    const nextPage = page + 1;
    const result = list.filter((_, index) => index >= page * perPage && index < nextPage * perPage);

    if (result[result.length - 1] == list[list.length -1 ]) {
      return [result, null]
    }
    return [result, this.createCursor(toUserId, nextPage, perPage)];
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
  ): [string, number, string] {
    const [toUserId, page, perPage] = new Buffer(decodeURIComponent(cursor), 'base64').toString('ascii').split('_');
    return [toUserId, parseInt(page), perPage];
  }

  listByCursor(cursor: string): Promise<ListResponce>  {
    const [toUserId, page, perPage] = ThanksService.parseCursor(cursor);
    return this.list(toUserId, perPage, page);
  }

  tryAdd(body: AddBody, tryIndex = 0): Promise<Thanks> {
    return this.add(body)
      .catch(error => {
        if (tryIndex > 3) throw error;
        return this.tryAdd(body, tryIndex + 1)
      });
  }

  private async add(body: AddBody): Promise<Thanks> {
    const count = await this.thanksRepository.count({ toUserId: body.to });

    const thanks = new Thanks();
    thanks.id = ThanksService.generatePrimeryKey(count, body.to);
    thanks.fromUserId = body.from;
    thanks.toUserId = body.to;
    thanks.reason = body.reason;

    return this.thanksRepository.save(thanks);
  }

  private static generatePrimeryKey(count: number, id: string): string {
    return `${id}#${('00000' + count.toString()).slice(-6)}`;
  }

}
