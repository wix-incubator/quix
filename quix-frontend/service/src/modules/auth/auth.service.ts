import {Injectable, Inject} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Request} from 'express';
import {ConfigService} from '../../config/config.service';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async getUser(req: Request) {
    return {
      email: 'defaultUser@wix.com',
      id: 1,
      avatar: '',
    };
  }
}
