import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import httpProxy from 'http-proxy-middleware';
import {ConfigService} from '../../config';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class ProxyDbApiBackend implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    let backendUrl = this.configService.getEnvSettings().QuixBackendInternalUrl;

    if (['http://', 'https://'].every(s => !backendUrl.startsWith(s))) {
      backendUrl = 'http://' + backendUrl;
    }

    consumer
      .apply(
        httpProxy({
          target: backendUrl,
          changeOrigin: true,
        }),
      )
      .forRoutes('/api/db');
    consumer
      .apply(
        httpProxy({
          target: backendUrl,
          changeOrigin: true,
          pathRewrite: {
            '^/api/history': '/api/history/executions',
          },
        }),
      )
      .forRoutes('/api/history');
  }
}
