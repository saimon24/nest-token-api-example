import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService, private jwtService: JwtService, private configService: ConfigService){ }

    async validateUserByPassword(loginAttempt: LoginUserDto): Promise<any> {
        let userToAttempt: any = await this.usersService.findOneByUsername(loginAttempt.username);
        
        return new Promise((resolve) => {
            if (!userToAttempt) {
                resolve({success: false, msg: 'User not found'});
            }
            userToAttempt.checkPassword(loginAttempt.password, async (err, isMatch) => {
                if(err) resolve({success: false, msg: 'Unexpected error. Please try again later.'});
    
                if(isMatch){
                    const data = await this.createJwtPayload(userToAttempt);
                    console.log('my data: ', data);
                    resolve({success: true, data });
                } else {
                    resolve({success: false, msg: 'Wrong password'})
                }
            });
        });
    }

    async createJwtPayload(user){
        let accessToken = this.getAccessToken(user._id, user._username);
        let refreshToken = this.jwtService.sign({ id: user._id }, { expiresIn: '6d', secret: this.configService.get('JWT_REFRESH_SECRET')});
        await this.usersService.setCurrentRefreshToken(refreshToken, user._id);
        console.log('after refreshToken stored');
        
        return {
            accessToken,
            refreshToken           
        }
    }

    getAccessToken(id, username) {
        return this.jwtService.sign({ id, username }, { expiresIn: 10 });
    }

    async validateUser(payload: JwtPayload): Promise<any> {
        const user = await this.usersService.findOne(payload.id);
        console.log('found: ', user);
        return user;
    }

    async validateUserRefresh(payload: JwtPayload): Promise<any> {
        // return this.usersService.getUserIfRefreshTokenMatches(payload.refreshToken, payload.id);
    }
}