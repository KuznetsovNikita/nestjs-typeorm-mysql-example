import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThanksController } from './thanks.controller';
import { Thanks } from './thanks.entity';
import { ThanksService } from './thanks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thanks]),
  ],
  controllers: [ThanksController],
  providers: [ThanksService],
})
export class ThanksModule {}
