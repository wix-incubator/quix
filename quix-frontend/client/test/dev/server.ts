import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import http from 'http';
import {renderVM} from './vm';
import {mock, reset} from '../mocks';

export function start(port = process.env.PORT || 3000) {
  const app = express();

  app.use(bodyParser.json());

  // proxy to quix-backend API
  app.all('/api/db/*', (req, res) => {
    const url = 'http://localhost:8080' + req.url;
    req.pipe(request[req.method.toLowerCase()](url)).pipe(res);
  });

  app.post('/mock/pattern', (req, res) => {
    const {pattern, payload} = req.body;
    mock(pattern, payload);

    res.status(200).send('OK');
  });

  app.get('/mock/reset', (req, res) => {
    reset();
    res.status(200).send('OK');
  });

  app.all('*/api/*', (req, res) => {
    const payload = mock(req.path);

    if (payload) {
      res.json(payload);
    } else {
      res.status(404).send('Mock not found');
    }
  });

  app.use('/', (req, res) => {
    res.send(renderVM('./src/index.vm', {}));
  });

  return http.createServer(app).listen(port, () => {
    console.info(`Fake server is running on port ${port}`);
  });
}
