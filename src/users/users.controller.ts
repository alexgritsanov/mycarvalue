import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Session,
    UseInterceptors,
} from '@nestjs/common';
import { Seralize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
// import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';  не нужен потому что заменили на кастомный декоратор
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { User } from './user.entity';
import { UsersService } from './users.service';


// Пересмотреть 58 урок  по исключениям
@Controller('auth')
@Seralize(UserDto)
@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
    constructor(private usersService: UsersService,
        private authService: AuthService
    ) { }

    @Get('/colors/:color')
    setColor(@Param('color') color: string, @Session() session: any) {
        session.color = color;
    }

    @Get('/colors')
    getColor(@Session() session: any) {
        return session.color;
    }


    // @Get('/whoami')
    // whoAmI(@Session() session: any) {
    //     return this.usersService.findOne(session.userId)
    // }


    @Get('/whoami')
    whoAmI(@CurrentUser() user: User) {
        return user
    }

    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        console.log(body);
        // this.usersService.create(body.email, body.password);
        // return this.authService.signup(body.email, body.password)
        const user = await this.authService.signup(body.email, body.password)
        session.userId = user.id
        return user;
    }

    @Post('/signout')
    signOut(@Session() session: any) {
        session.userId = null;
    }


    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        console.log(" this is body", body)
        // return this.authService.signin(body.email, body.password)
        const user = await this.authService.signin(body.email, body.password)
        session.userId = user.id
        return user;
    }

    // @UseInterceptors(ClassSerializerInterceptor)

    // @UseInterceptors(new SerializeInterceptor(UserDto))
    @Get('/:id')
    async findUser(@Param('id') id: string) {
        console.log('handler is running');
        const user = await this.usersService.findOne(parseInt(id));
        if (!user) {
            throw new NotFoundException('user not found');
        }
        return user;
    }

    @Get('/')
    findAllUsers(@Query('email') email: string) {
        return this.usersService.find(email);
        // ПОчему нельзя всунуть объект  ???
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(parseInt(id));
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(parseInt(id), body);
    }
}
