import * as toast from './toast';

export default app => app
  .story('UI', 'Toast')
    .section('Toast', `
      <code>import {toast} from '@wix/bi-ui';</code>

      <button
        type="button"
        class="bi-button--primary"
        ng-click="status !== 'visible' ? showToast({
          text: 'I am a toast'
        }) : hideToast()"
      >
        {{status !== 'visible' ? 'show toast' : 'hide toast'}}
      </button>

      <button
        type="button"
        class="bi-button--primary"
        ng-click="showToast({
          text: 'You can hide me',
          ok: 'do something',
          cancel: 'hide'
        })"
      >
        show toast with actions
      </button>

      <button
        type="button"class="bi-button--primary"
        ng-click="showToast({
          text: 'I will be hidden in 3 seconds',
          hideDelay: 3000
        })"
      >
        show toast with hide delay
      </button>

      <output>Status: {{status}}</output>
    `, $scope => {
      $scope.status = 'hidden';

      $scope.showToast = (({text, cancel, ok, hideDelay}) => {
        $scope.status = 'visible';

        toast.showToast({text, cancel, ok, hideDelay})
          .then(() => $scope.status = 'hidden and resolved')
          .catch(() => $scope.status = 'hidden and rejected');
      });

      $scope.hideToast = () => {
        $scope.status = 'hidden';
        toast.hideToast();
      };
    });
