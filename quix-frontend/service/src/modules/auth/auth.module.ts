import {Module} from '@nestjs/common';
import {ConfigModule} from 'config/config.module';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
