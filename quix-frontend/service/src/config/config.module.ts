import {Module} from '@nestjs/common';
import {ConfigService, DefaultConfigService} from './config.service';

const configServiceProvider = {
  provide: ConfigService,
  useClass: DefaultConfigService,
};

@Module({
  imports: [],
  controllers: [],
  providers: [configServiceProvider],
  exports: [configServiceProvider],
})
export class ConfigModule {}
