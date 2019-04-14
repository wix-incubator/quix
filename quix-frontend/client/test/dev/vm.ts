import * as fs from 'fs';
import {Engine} from 'velocity';

function loadData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8').toString());
  } catch (ex) {
    throw ex;
  }
}

export function renderVM(template, data) {
  const engine = new Engine({template});
  const velocityData = loadData('./velocity.data.json');
  const velocityDataPrivate = loadData('./velocity.private.data.json');

  return engine.render({...velocityData, ...velocityDataPrivate, ...data});
}
