import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { AddBody, ListQuery, ListResponse } from './models';
import { Thanks } from './thanks.entity';
import { ThanksService } from './thanks.service';

@Controller()
export class ThanksController {
  constructor(
    private readonly thanksService: ThanksService,
  ) {}

  @Post('add')
  add(@Body() body: AddBody): Promise<Thanks> {
    return this.thanksService.tryAdd(body);
  }

  @Get('list')
  list(@Query() query: ListQuery): Promise<ListResponse> {
    if (!query) {
      throw new HttpException('missing information', HttpStatus.BAD_REQUEST);
    }
    if (query.cursor) {
      return  this.thanksService.listByCursor(query.cursor);
    }
    if (!query.id) {
      throw new HttpException('missing user id', HttpStatus.BAD_REQUEST);
    }
    if (!query.perPage) {
      query.perPage = '20'
    }
    return this.thanksService.list(query.id, query.perPage);
  }
}
