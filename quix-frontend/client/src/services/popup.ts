import {assign} from 'lodash';
import {inject} from '../lib/core';
import {singletone} from '../utils';

const popup = singletone();

export const closePopup = () => popup((scope, element) => {
  element.remove();
  scope.$destroy();

  return null;
});

export const openPopup = (html: string, scope, locals: Record<any, any> = {}) => {
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
      class="quix-popup bi-c-h"
      bi-maximizable="true"
      bm-options="::{offIcon: 'close'}"
      on-load="events.onLoad(instance)"
      on-toggle="events.onToggle(maximized)"
    >${html}</div>
  `)(popupScope).appendTo(document.body);

  return closePopup()(popupScope, element);
}