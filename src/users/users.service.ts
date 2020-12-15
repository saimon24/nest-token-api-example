import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

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

  async findOne(id) {
    return this.userModel.findById(id);    
  }

  remove(id: string) {
    return this.userModel.deleteOne({ id }).exec();
  }

  async setCurrentRefreshToken(refreshToken, id) {    
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const updatedUser = await this.userModel.findOneAndUpdate({_id: id}, { currentHashedRefreshToken } );    
  }

  async removeRefreshToken(id) {
    return this.userModel.findByIdAndUpdate(id, {
      currentHashedRefreshToken: null
    });
  }

  async compareUserTokenMatches(refreshToken: string, user) {   
    if (!user.currentHashedRefreshToken) return false;
    
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );
 
    return isRefreshTokenMatching;
  }
}
