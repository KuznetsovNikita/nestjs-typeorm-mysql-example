import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
    if (query.cursor) {
      return  this.thanksService.listByCursor(query.cursor);
    }
    return this.thanksService.list(query.id, query.perPage);
  }
}
