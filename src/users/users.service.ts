import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {

  constructor(@InjectModel('User') private readonly userModel: Model<User>) { }

  async findOneByUsername(username: string): Promise<User> {
    return await this.userModel.findOne({ username }, '+password');
  }

  async create(createUserDTO: CreateUserDto): Promise<User> {
    const newUser = await new this.userModel(createUserDTO);
    return newUser.save();
  }

  async findOne(id: number) {
    return this.userModel.findById(id);    
  }

  remove(id: string) {
    return this.userModel.deleteOne({ id }).exec();
  }
}
