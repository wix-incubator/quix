import { isPlainObject } from 'lodash';
import { hooks } from '../../hooks';
import { App } from '../../lib/app';
import { utils } from '../../lib/core';
import { Store } from '../../lib/store';

const urlFormatter = (name: string, value: any) => {
  const regex = /^https?:\/\/.*/i;

  if (!regex.test(value)) {
    return null;
  }

  const escapedValue = utils.dom.escape(value);

  return `<a class="bi-link" href="${escapedValue}" target="_blank">${escapedValue}</a>`;
}

const jsonFormatter = (name: string, value: any) => {
  if (!isPlainObject(value)) {
    return null;
  }

  const escapedValue = utils.dom.escape(value);

  return JSON.stringify(escapedValue);
}

const identityFormatter = (name: string, value: any) => value;

const Formatters = [
  urlFormatter,
  jsonFormatter,
  identityFormatter,
];

export const getFormatter = (app: App, store: Store, engine: string, id: string) => {
  const formatters = [
    ...hooks.note.results.formatters.pre.call([], app, store, engine, id),
    ...Formatters,
    ...hooks.note.results.formatters.post.call([], app, store, engine, id),
  ];

  return (name: string, value: any) => formatters.reduce((res, formatter) => {
    if (res !== null) {
      return res;
    }

    return formatter(name, value);
  }, null);
}