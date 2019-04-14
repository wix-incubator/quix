import {Controller, Get, Render} from '@nestjs/common';
import {ConfigService, EnvSettings} from './config/config.service';

@Controller()
export class AppController {
  private settings: EnvSettings;
  constructor(private configService: ConfigService) {
    this.settings = this.configService.getEnvSettings();
  }

  @Get()
  @Render('index.vm')
  getIndex() {
    return {
      clientTopology: {
        staticsBaseUrl: '',
        quixBackendUrl: this.settings.QuixBackendUrl,
        googleClientId: this.settings.GoogleClientId,
      },
    };
  }
}
