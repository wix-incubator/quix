import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import http from 'http';
import {renderVM} from './vm';
import {mock, reset} from '../mocks';
import expressWs from 'express-ws';
import {setupMockWs} from './websocket-mock';

const proxyBaseUrl = 'http://localhost:3000';

export function start(port = process.env.PORT || 3000) {
  const app = express();
  const server = http.createServer(app);
  expressWs(app, server);

  app.use(bodyParser.json());

  app.post('/mock/pattern', (req, res) => {
    const {pattern, payload} = req.body;
    mock(pattern, payload);

    res.status(200).send('OK');
  });

  app.get('/mock/reset', (req, res) => {
    reset();

    res.status(200).send('OK');
  });

  setupMockWs(app);

  app.all('/api/*', (req, res) => {
    if (port === 3000) {
      const [status, payload] = mock(req.path);

      res.status(status).json(payload);
    } else {
      const url = proxyBaseUrl + req.url;
      req.pipe(request[req.method.toLowerCase()](url)).pipe(res);
    }
  });

  app.get('/', (req, res) => {
    res.send(renderVM('./src/index.vm', {}));
  });

  return server.listen(port, () => {
    console.info(`Fake server is running on port ${port}`);
  });
}

