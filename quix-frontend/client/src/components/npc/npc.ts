import template from './npc.html';
import './npc.scss';

import {without} from 'lodash';
import {initNgScope, inject} from '../../lib/core';
import {Store} from '../../lib/store';
import {App} from '../../lib/app';

const TriggerChance = 1/5;
const TriggerDelayMinutes = 10;
const Speed = 25; // pixels per second
const Phrases = [
  'What to do...what to do...',
  'I wonder...',
  'Hmm...',
  'What now...',
  'Perplexing...',
];

const Timeout = {
  AnimationStart: TriggerDelayMinutes * 60 * 1000,
  PhraseShow: 10 * 1000,
  PhraseHide: 5 * 1000,
};

const rotatePhrases = (scope: any) => {
  const timeout = inject('$timeout');
  const {speech} = scope.vm;

  speech.timeout = timeout(() => {
    const phrases = without(Phrases, speech.currentPhrase);

    speech.currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    speech.toggle(true);

    speech.timeout = timeout(() => {
      speech.toggle(false);
      rotatePhrases(scope);
    }, Timeout.PhraseHide);
  }, Timeout.PhraseShow);
}

const startAnimation = (scope: any, element: any) => {
  destroyAnimation(scope);

  const timeout = inject('$timeout');
  const {vm} = scope;

  vm.timeout = timeout(() => {
    vm.toggle(true);
    rotatePhrases(scope);

    timeout(() => {
      element.find('.quix-npc-container').css({
        'animation-duration': `${element.width() / Speed}s`,
      });
    });
  }, Timeout.AnimationStart);
}

const destroyAnimation = (scope: any) => {
  const timeout = inject('$timeout');
  const {vm} = scope;
  const {speech} = vm;

  vm.toggle(false);

  timeout.cancel(vm.timeout);
  timeout.cancel(speech.timeout);
}

export default (app: App, store: Store) => () => ({
  restrict: 'E',
  template,
  scope: {},
  link: {
    async pre(scope: any, element: any) {
      initNgScope(scope)
        .withVM({
          timeout: null,
          speech: {
            timeout: null,
            currentPhrase: null,
          }
        });
      
      if (Math.random() < TriggerChance) {
        startAnimation(scope, element);
        scope.$on('$destroy', () => destroyAnimation(scope));
      }
    }
  }
});
