import {DynamicModule, Module} from '@nestjs/common';
import {ConfigService, DefaultConfigService} from './config.service';
import {EnvSettings} from './env';

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
export class ConfigModule {
  static create(overrides: Partial<EnvSettings> = {}): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [
        {
          provide: 'CONFIG_OVERRIDES',
          useValue: overrides,
        },
      ],
    };
  }
}
