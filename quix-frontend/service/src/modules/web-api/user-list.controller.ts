import {Controller, Get, Param, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {UsersService} from 'modules/auth';

@Controller('/api/users')
@UseGuards(AuthGuard())
export class UserListController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getListOfUsers();
  }
}
