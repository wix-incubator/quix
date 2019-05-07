import * as WebSocket from 'ws';
import express from 'express';

const successEvents = [
  {event: "start", "data": {"id": "6b823033-25a6-4601-b090-60f2ffa32074", "numOfQueries": 1}},
  {event: "query-start", "data": {"id": "20190506_150006_00177_xps63"}},
  {event: "query-details", "data": {"id": "20190506_150006_00177_xps63", "code": "select 1"}},
  {event: "percentage", "data": {"id": "20190506_150006_00177_xps63", "percentage": 0}},
  {event: "percentage", "data": {"id": "20190506_150006_00177_xps63", "percentage": 0}},
  {event: "fields", "data": {"id": "20190506_150006_00177_xps63", "fields": ["_col0"]}},
  {event: "percentage", "data": {"id": "20190506_150006_00177_xps63", "percentage": 100}},
  {event: "row", "data": {"id": "20190506_150006_00177_xps63", "values": [1]}},
  {event: "query-end", "data": {"id": "20190506_150006_00177_xps63"}},
  {event: "end", "data": {"id": "6b823033-25a6-4601-b090-60f2ffa32074"}},
];

const failEvents = [
  {event: "start", "data": {"id": "274370d2-6755-4d3c-8248-b573a63523d2", "numOfQueries": 1}},
  {event: "query-start", "data": {"id": "20190506_152226_00201_xps63"}},
  {event: "query-details", "data": {"id": "20190506_152226_00201_xps63", "code": "select a"}},
  {event: "percentage", "data": {"id": "20190506_152226_00201_xps63", "percentage": 0}},
  {event: "percentage", "data": {"id": "20190506_152226_00201_xps63", "percentage": 0}},
  {event: "error", "data": {"id": "20190506_152226_00201_xps63", "message": "line 1:8: Column 'a' cannot be resolved"}},
  {event: "query-end", "data": {"id": "20190506_152226_00201_xps63"}},
  {event: "end", "data": {"id": "274370d2-6755-4d3c-8248-b573a63523d2"}}
]

export const setupMockWs = (app: express.Express) => {
  const router = express.Router();
  router.ws('/sql', (ws, req) => {
    ws.on('message', async (msg) => {
      const payload: {data: {code: string}; event: string} = JSON.parse(msg.toString());
      const match = payload.data.code.match(/timeout=(\d+)/)
      const timeout = match && match[1] ? parseInt(match[1], 10) : 0;
      if (payload.event === 'execute') {
        if ((payload.data.code).includes('do success')) {
          sendEvents(ws, successEvents, timeout);
        } else if ((payload.data.code).includes('do error')) {
          sendEvents(ws, failEvents, timeout);
        } else {
          ws.close();
        }
      }
    });
  });
  app.use('/fakeBackend/api/v1/execute/', router)
}
const promisifiedSend = (WS: WebSocket) => (data: any) => new Promise((resolve, reject) => {
  WS.send(data, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve()
    }
  });
})
const sendEvents = (WS: WebSocket, events: any[], timeout: number) => {
  setTimeout(async () => {
    const send = promisifiedSend(WS);
    for (const event of events) {
      await send(JSON.stringify(event));
    }
  }, timeout);
};
