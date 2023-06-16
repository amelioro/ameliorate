import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './create.dto';
import { UsersService } from './service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): string {
    return `create user with data ${JSON.stringify(createUserDto)}`;
  }

  @Get('username/:username')
  findByUsername(@Param('username') username: string): string {
    return `return user with username: ${username}`;
  }

  @Get('authId/:authId')
  findByAuthId(@Param('authId') authId: string): string {
    return `return user with authId: ${authId}`;
  }
}
