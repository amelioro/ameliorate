import { Module } from '@nestjs/common';
import { UsersController } from './users/controller';
import { TopicsController } from './topics/controller';
import { UsersService } from './users/service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Topic } from './topics/topic.entity';
import { TopicsService } from './topics/service';
import { jsDbConfig } from './db/config';
import { AuthzModule } from './authz/authz.module';

// managing modules is a waste of time
@Module({
  imports: [
    TypeOrmModule.forRoot(jsDbConfig),
    TypeOrmModule.forFeature([User, Topic]),
    AuthzModule,
  ],
  controllers: [UsersController, TopicsController],
  providers: [UsersService, TopicsService],
})
export class AppModule {}
