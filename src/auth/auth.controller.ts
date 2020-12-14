import { Controller, Post, Body, Res, HttpStatus, UseGuards, Req, Headers, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto'
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UsersService) { }

    @Post() 
    async login(@Body() loginUserDto: LoginUserDto, @Res() res){
        const result = await this.authService.validateUserByPassword(loginUserDto);
        
        if (result.success) {
            return res.json(result.data);
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).json({msg: result.msg});
        }
    }

    @UseGuards(AuthGuard('jwt-refresh-token'))
    @Get('/refresh')
    async refresh(@Body() body, @Res() res, @Req() req, @Headers('Authorization') token) {
        console.log('in refresh logic, user already validated');
        console.log('user is: ', req.user);
        console.log('request header: ', token);
        
        const user = req.user;
        const isMatching = await this.userService.compareUserTokenMatches(token, user);
        console.log('ismatching: ', isMatching);
        
        if (isMatching) {
            const token = this.authService.getAccessToken(user._id, user._username);
            console.log('new token: ', token);
            return res.json({ acessToken: token});
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({msg: 'Invalid refresh token'});
        }
    }

    @UseGuards(AuthGuard())
    @Post('/logout')
    async logout(@Body() body, @Res() res, @Req() req) {
        console.log('user: ', req.user);
        await this.userService.removeRefreshToken(req.user._id);
        return res.json({ msg: 'Successful logged out.'});
    }
}