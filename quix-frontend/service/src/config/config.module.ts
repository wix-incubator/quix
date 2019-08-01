import {Module} from '@nestjs/common';
import {ConfigService, DefaultConfigService} from './config.service';

const configServiceProvider = {
  provide: ConfigService,
  useClass: DefaultConfigService,
};

const globalEnvProvider = {
  provide: 'GLOBAL_ENV',
  useValue: process.env,
};

@Module({
  imports: [],
  controllers: [],
  providers: [configServiceProvider, globalEnvProvider],
  exports: [configServiceProvider],
})
export class ConfigModule {}
