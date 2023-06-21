import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTopicDto } from './create.dto';
import { TopicsService } from './service';
import { AuthGuard } from '@nestjs/passport';

@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createTopicDto: CreateTopicDto) {
    return await this.topicsService.create(createTopicDto.title, 1);
  }

  @Get(':username')
  async findAllByUsername(@Param('username') username: string) {
    return await this.topicsService.findAllByUsername(username);
  }

  @Get(':username/:title')
  async findByUsernameAndTitle(
    @Param('username') username: string,
    @Param('title') title: string,
  ) {
    return await this.topicsService.findByUsernameAndTitle(username, title);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.topicsService.delete(id);
  }
}
