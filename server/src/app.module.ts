import { Module } from '@nestjs/common';
import { UsersController } from './users/controller';
import { TopicsController } from './topics/controller';
import { UsersService } from './users/service';

@Module({
  imports: [],
  controllers: [UsersController, TopicsController],
  providers: [UsersService],
})
export class AppModule {}
