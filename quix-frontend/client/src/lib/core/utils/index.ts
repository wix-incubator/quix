'use strict';

import * as _ from 'lodash';
import jquery from 'jquery';
import * as Uuid from 'uuid';
import escapeHtml from 'escape-html';

export function isPromise(obj: any): boolean {
  return (obj && typeof obj.then === 'function');
}

export function uuid() {
  return Uuid.v4();
}

export const scope = {
  safeApply(sc, fn: Function) {
    const phase = sc.$root.$$phase;

    if (phase === '$apply' || phase === '$digest') {
      fn();
    } else {
      sc.$apply(fn);
    }
  },

  safeDigest(sc, fn: Function) {
    const phase = sc.$root.$$phase;

    if (phase === '$apply' || phase === '$digest') {
      fn();
    } else {
      fn();
      sc.$digest();
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

  onKey(key, fn, s?): Function {
    const document = $(window.document);
    const eventName = _.uniqueId('keydown.utils.dom.onKey.' + key);
    const codes = (Array.isArray(key) ? key : [key]).map(k => dom.KEYS[k] || k);

    function off() {
      document.off(eventName);
    }

    document.on(eventName, e => {
      // tslint:disable-next-line: deprecation
      if (codes.indexOf(e.keyCode) !== -1) {
        e.preventDefault();

        if (scope) {
          // tslint:disable-next-line: deprecation
          s.$apply(() => fn(off, e.keyCode));
        } else {
          // tslint:disable-next-line: deprecation
          fn(off, e.keyCode);
        }
      }
    });

    if (s) {
      s.$on('$destroy', off);
    }

    return off;
  },

  escape(str) {
    return escapeHtml(str);
  },

  scrollIntoView(element, animate = false, offset = 0) {
    const scrollParent = element.scrollParent();
    // tslint:disable-next-line: restrict-plus-operands
    const scrollTop = element.position().top + scrollParent.scrollTop() + offset;

    scrollParent.animate({scrollTop}, animate ? 200 : 0);
  },
}

export function stripDollars<T extends object>(data: T): Partial<T> {
  if (_.isPlainObject(data)) {
    // tslint:disable-next-line: restrict-plus-operands
    data = _.omitBy(data, (value, key) => ('' + key).charAt(0) === '$') as T;
    data = _.mapValues(data, value => stripDollars(value as any)) as T;
  }

  if (_.isArray(data)) {
    data = data.map(item => stripDollars(item)) as any;
  }

  return data;
}

export function copyToClipboard(text: string) {
  const input = jquery('<input>').val(text);

  input.appendTo(window.document.body);
  input.get(0).focus();
  (input.get(0) as any).select();
  document.execCommand('Copy');
  input.remove();
}

export const lodash: any = _;
import './lodash4-polyfill';
