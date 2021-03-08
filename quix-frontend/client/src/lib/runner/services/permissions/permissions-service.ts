import {confirm} from '../../../../lib/ui';
import {RunnerComponentInstance} from '../../directives/runner/runner';

const PERMISSION_ERROR_PATTERNS = [
  'permission denied',
  'permission was denied',
  'you do not have permission',
  'under the current security context',
  'Login failed. The login is from an untrusted domain and cannot be used with Windows authentication'
];

export const isPermissionError = (msg: string) => {
  return PERMISSION_ERROR_PATTERNS.some(pattern => msg.indexOf(pattern) !== -1);
}

export const requestCredentials = (scope, runnerInstance: RunnerComponentInstance) => {
  const user = runnerInstance.getUser();

  if (!user) {
    throw new Error('To use promptOnPermissionError please call runnerComponentInstance.setUser(user)');
  }

  user.getPermission().deelevate();

  return confirm({
    title: `Permission denied`,
    actionType: 'neutral',
    icon: 'gpp_bad',
    yes: 'Submit',
    html: `
      <div class="bi-c-h bi-s-v--x05">
        <span class="bi-text--sm bi-muted">Please enter your password to access restricted data</span>
        <input type="password" class="bi-input" ng-model="model.password" placeholder="Password" required="true" bi-focus/>
      </div>
    `
  }, scope, {model: {password: null}}).then(({model}) => {
    user.getPermission().elevate(model.password);
  });
}
