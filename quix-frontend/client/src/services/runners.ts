import {fromPairs} from 'lodash';

const runners = new Map();

export const addRunner = (id: string, runner) => {
  runners.set(id, runner);
}

export const removeRunner = (id: string) => {
  runners.delete(id);
}

export const getRunner = (id: string) => {
  return runners.get(id);
}

export const getRunners = () => fromPairs([...runners.entries()]);
