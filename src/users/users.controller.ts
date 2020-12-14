import { Controller, Get, Post, Body, Put, Param, Delete, Res, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async addUser(@Res() res, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return res.status(HttpStatus.OK).json({
        msg: 'User has been created successfully',
        user
      });
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).json({
        msg: 'User already exists'
      });
    }
  }

  @UseGuards(AuthGuard())
  @Get('/secret')
  async getSecretUserInfo(@Res() res) {    
    return res.status(HttpStatus.OK).json({
      msg: 'This is my secret message from the server!'
    });
  }

  @UseGuards(AuthGuard())
  @Get(':userID')
  async getUser(@Res() res, @Param('userID') userID) {
    const user = await this.usersService.findOne(userID);
    if (!user) throw new NotFoundException('User does not exist!');
    return res.status(HttpStatus.OK).json(user);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}
