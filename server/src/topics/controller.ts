import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateTopicDto } from './create.dto';

@Controller('topics')
export class TopicsController {
  @Post()
  create(@Body() createTopicDto: CreateTopicDto): string {
    return `create topic with data ${JSON.stringify(createTopicDto)}`;
  }

  @Get(':username')
  findAllByUsername(@Param('username') username: string): string {
    return `return topics for user with username: ${username}`;
  }

  @Get(':username/:title')
  findByUsernameAndTitle(
    @Param('username') username: string,
    @Param('title') title: string,
  ): string {
    return `return topic for user with username: ${username} and with title ${title}`;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): string {
    return `delete topic with id ${id}`;
  }
}
