import express from 'express';
import request from 'request';
import http from 'http';
import { renderVM } from './vm';
import { mock, reset } from '../mocks';
import expressWs from 'express-ws';
import {setupMockWs, setupSubscriptionMockWs} from './websocket-mock';

const proxyBaseUrl = 'http://localhost:3000';

export function start(port = process.env.PORT || '3000') {
  const app = express();
  const server = http.createServer(app);
  expressWs(app, server);

  app.use(express.json());

  app.post('/mock/pattern', (req, res) => {
    const { pattern, payload, options } = req.body;
    mock(pattern, payload, options);

    res.status(200).send('OK');
  });

  app.get('/mock/reset', (req, res) => {
    reset();

    res.status(200).send('OK');
  });

  setupMockWs(app);
  setupSubscriptionMockWs(app);

  app.all('/api/*', async (req, res) => {
    if (port === '3000' || port === '3100') {
      const [status, payload] = await mock(req.path);

      res.status(status).json(payload);
    } else {
      const url = proxyBaseUrl + req.url;
      req.pipe(request[req.method.toLowerCase()](url)).pipe(res);
    }
  });

  app.get('/', (req, res) => {
    const quixConfig = {
      modules: [
        {
          id: 'presto',
          name: 'presto',
          components: { db: {}, note: {} },
          engine: 'presto',
          syntax: 'presto'
        },
        {
          id: 'athena',
          name: 'athena',
          components: { db: {}, note: {} },
          engine: 'athena',
          syntax: 'presto'
        },
        {
          id: 'python',
          name: 'athena',
          components: { note: {} },
          engine: 'python',
          syntax: 'python'
        }
      ],
      auth: { googleClientId: '' },
      clientTopology: {
        executeBaseUrl: `localhost:${port}/mock`,
        staticsBaseUrl: '//localhost:3200/',
        apiBasePath: ''
      },
      mode: { debug: true, demo: false }
    };
    res.send(
      renderVM('./src/index.vm', {
        quixConfig: JSON.stringify(quixConfig, null, 2)
      })
    );
  });

  return server.listen(port, () => {
    console.info(`Fake server is running on port ${port}`);
  });
}
