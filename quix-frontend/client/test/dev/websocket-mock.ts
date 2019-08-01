import * as WebSocket from 'ws';
import express from 'express';

const successEvents = [
  {event:'start',data:{id:'d85eed1e-fec8-4f1c-abba-5ab8593ea46b','numOfQueries':1}},
  {event:'query-start',data:{id:'20190507_155320_00041_s9xam'}},
  {event:'query-details',data:{id:'20190507_155320_00041_s9xam','code':'select 1'}},
  {event:'percentage',data:{id:'20190507_155320_00041_s9xam','percentage':0}},
  {event:'percentage',data:{id:'20190507_155320_00041_s9xam','percentage':0}},
  {event:'fields',data:{id:'20190507_155320_00041_s9xam','fields':['date_created','num','category']}},

  {event:'percentage',data:{id:'20190507_155320_00041_s9xam','percentage':30}},

  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-01',100,'A']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-02',100,'A']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',200,'A']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',100,'A']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-04',250,'A']}},

  {event:'percentage',data:{id:'20190507_155320_00041_s9xam','percentage':60}},

  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-01',150,'B']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-02',150,'B']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',250,'B']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',150,'B']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-04',250,'B']}},

  {event:'percentage',data:{id:'20190507_155320_00041_s9xam','percentage':100}},

  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-01',120,'C']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-02',120,'C']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',220,'C']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-03',120,'C']}},
  {event:'row',data:{id:'20190507_155320_00041_s9xam',values:['2019-01-04',220,'C']}},

  {event:'query-end',data:{id:'20190507_155320_00041_s9xam'}},
  {event:'end',data:{id:'d85eed1e-fec8-4f1c-abba-5ab8593ea46b'}}
];

const failEvents = [
  {event: 'start', data: {id: '274370d2-6755-4d3c-8248-b573a63523d2', 'numOfQueries': 1}},
  {event: 'query-start', data: {id: '20190506_152226_00201_xps63'}},
  {event: 'query-details', data: {id: '20190506_152226_00201_xps63', 'code': 'select a'}},
  {event: 'percentage', data: {id: '20190506_152226_00201_xps63', 'percentage': 0}},
  {event: 'percentage', data: {id: '20190506_152226_00201_xps63', 'percentage': 0}},
  {event: 'error', data: {id: '20190506_152226_00201_xps63', 'message': 'line 1:8: Column \'a\' cannot be resolved'}},
  {event: 'query-end', data: {id: '20190506_152226_00201_xps63'}},
  {event: 'end', data: {id: '274370d2-6755-4d3c-8248-b573a63523d2'}}
]

export const setupMockWs = (app: express.Express) => {
  const router = express.Router();

  router.ws('/presto', (ws, req) => {
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

  app.use('/mock/api/v1/execute/', router)
}

const promisifiedSend = (WS: WebSocket) => (data: any) => new Promise((resolve, reject) => {
  WS.send(data, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve()
    }
  });
});

const sendEvents = (WS: WebSocket, events: any[], timeout: number) => {
  const send = promisifiedSend(WS);

  events.reduce((res, event) => {
    return new Promise(resolve => res.then(() => setTimeout(() => send(JSON.stringify(event)).then(resolve), timeout)));
  }, Promise.resolve() as any);
};
