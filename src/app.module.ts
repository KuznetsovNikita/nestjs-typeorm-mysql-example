import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThanksModule } from './thanks/thanks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ThanksModule,
  ],
})
export class AppModule {}
