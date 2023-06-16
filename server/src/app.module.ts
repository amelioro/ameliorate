import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/controller';
import { TopicsController } from './topics/controller';
import { UsersService } from './users/service';

@Module({
  imports: [],
  controllers: [AppController, UsersController, TopicsController],
  providers: [AppService, UsersService],
})
export class AppModule {}
