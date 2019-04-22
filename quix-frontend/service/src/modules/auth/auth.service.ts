import {Injectable} from '@nestjs/common';
import {Request} from 'express';
import {ConfigService} from 'config';

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
