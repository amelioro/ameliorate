import { Module } from '@nestjs/common';
import { UsersController } from './users/controller';
import { TopicsController } from './topics/controller';
import { UsersService } from './users/service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity';
import { Topic } from './topics/entity';
import { TopicsService } from './topics/service';
import { jsDbConfig } from './db/config';

// managing modules is a waste of time
@Module({
  imports: [
    TypeOrmModule.forRoot(jsDbConfig),
    TypeOrmModule.forFeature([User, Topic]),
  ],
  controllers: [UsersController, TopicsController],
  providers: [UsersService, TopicsService],
})
export class AppModule {}
