import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import httpProxy from 'http-proxy-middleware';
import {ConfigService, ConfigModule} from 'config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class ProxyDbApiBackend implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        httpProxy({
          target: `http://${
            this.configService.getEnvSettings().QuixBackendInternalUrl
          }`,
          changeOrigin: true,
        }),
      )
      .forRoutes('/api/db');
    consumer
      .apply(
        httpProxy({
          target: `http://${
            this.configService.getEnvSettings().QuixBackendInternalUrl
          }`,
          changeOrigin: true,
          pathRewrite: {
            '^/api/history': '/api/history/executions',
          },
        }),
      )
      .forRoutes('/api/history');
  }
}
