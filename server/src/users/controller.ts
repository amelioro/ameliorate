import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './create.dto';
import { UsersService } from './service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    return await this.usersService.findByUsername(username);
  }

  @Get('authId/:authId')
  async findByAuthId(@Param('authId') authId: string) {
    return await this.usersService.findByAuthId(authId);
  }
}
