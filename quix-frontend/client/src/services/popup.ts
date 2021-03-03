import {assign} from 'lodash';
import {inject} from '../lib/core';
import {singletone} from '../utils';

const popup = singletone();

export const closePopup = () => popup((scope, element) => {
  element.remove();
  scope.$destroy();

  return null;
});

const openPopup = (html: string, scope, locals: Record<any, any> = {}) => {
  if (popup()) {
    return () => {};
  }

  const popupScope: any = assign(scope.$new(true), locals, {
    events: {
      onLoad(instance) {
        inject('$timeout')(() => instance.toggle());
      },
      onToggle(maximized: boolean) {
        if (!maximized) {
          closePopup();
        }
      }
    }
  });

  const element = inject('$compile')(`
    <div 
      class="quix-popup bi-c-h bi-theme--lighter"
      bi-maximizable="true"
      bm-options="::{offIcon: 'close'}"
      on-load="events.onLoad(instance)"
      on-toggle="events.onToggle(maximized)"
    >${html}</div>
  `)(popupScope).appendTo(document.body);

  closePopup()(popupScope, element);

  return closePopup;
}

export const openSearchResults = (scope) => {
  const closeFn = openPopup(`
    <quix-search-results class="bi-c-h bi-grow"></quix-search-results>
  `, scope);

  popup((_, element) => element.addClass('quix-search-popup'));

  return closeFn;
}

export const openTempQuery = (scope, type?: string, code: string = '', autorun = false) => {
  return openPopup(`
    <quix-temp-query
      class="bi-c-h bi-grow"
      type="type"
      text-content="code"
      autorun="autorun"
    ></quix-temp-query>`, 
    scope, {
      type,
      code,
      autorun
    }
  );
}