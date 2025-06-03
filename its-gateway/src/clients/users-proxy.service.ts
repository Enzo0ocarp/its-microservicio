import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';

@Injectable()
export class UsersProxyService {
  constructor(
    @Inject('MS_USER') private readonly client: ClientProxy,
  ) {}

  createUser(dto: CreateUserDto) {
    return firstValueFrom(this.client.send('createUser', dto));
  }

  validateUser(dto: LoginDto) {
    return firstValueFrom(this.client.send('validateUser', dto));
  }
}