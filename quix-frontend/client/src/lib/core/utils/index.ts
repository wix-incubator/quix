'use strict';

import * as _ from 'lodash';
import * as Uuid from 'uuid';
import * as escapeHtml from 'escape-html';

export function isPromise(obj: any): boolean {
  return (obj && typeof obj.then === 'function');
}

export function uuid() {
  return Uuid.v4();
}

export const scope = {
  safeApply(sc, fn) {
    const phase = sc.$root.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof fn === 'function')) {
        fn();
      }
    } else {
      sc.$apply(fn);
    }
  }
}

export const dom =  {
  KEYS: {
    escape: 27
  },

  onBlur(element, fn, sc?): Function {
    const document = $(window.document);
    const eventName = _.uniqueId('click.utils.dom.onBlur');

    function off() {
      document.off(eventName);
    }

    document.on(eventName, e => {
      const parent = element.parent();
      const target = $(e.target);

      if (!target.closest(parent).length || target.closest(element).length) {
        const child = target.closest(element).length && target;
        let res;

        if (sc) {
          res = sc.$apply(() => fn(off, child));
        } else {
          res = fn(off, child);
        }

        if (res !== false) {
          off();
        }
      }
    });

    if (sc) {
      sc.$on('$destroy', off);
    }

    return off;
  },

  onKey(key, fn, sc): Function {
    if (!dom.KEYS[key]) {
      return;
    }

    const document = $(window.document);
    // tslint:disable-next-line: restrict-plus-operands
    const eventName = _.uniqueId('keydown.utils.dom.onKey.' + key);

    function off() {
      document.off(eventName);
    }

    document.on(eventName, e => {
      // tslint:disable-next-line: deprecation
      if (e.keyCode === dom.KEYS[key]) {
        e.preventDefault();

        if (sc) {
          sc.$apply(() => fn(off));
        } else {
          fn(off);
        }
      }
    });

    if (sc) {
      sc.$on('$destroy', off);
    }

    return off;
  },

  scape(str) {
    return escapeHtml(str);
  }
}

export function stripDollars<T>(data: T): T {
  if (_.isPlainObject(data)) {
    data = _.omit<T, T>(data, (value, key) => ('' + key).charAt(0) === '$');
    data = _.mapValues(data, value => stripDollars(value));
  }

  if (_.isArray(data)) {
    data = data.map(item => stripDollars(item)) as any;
  }

  return data;
}

export const lodash: any = _;
import './lodash4-polyfill';
