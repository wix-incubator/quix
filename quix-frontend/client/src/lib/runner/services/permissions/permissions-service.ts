import {confirm} from '../../../ui';
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
    throw new Error('To use promptOnPermissionError please do runnerComponenetInstance.setUser(user)');
  }

  user.getPermission().deelevate();

  return confirm(`
    <dialog yes="Submit" no="Cancel">
      <dialog-title>Permission denied</dialog-title>
      <dialog-content>
        <div class="bi-c bi-s-v--x05" ng-form="form">
          <span class="bi-text--sm">Please enter your password to access restricted data</span>
          <input type="password" class="bi-input bi-grow" ng-model="model.password" placeholder="Password" required="true" bi-focus/>
        </div>
      </dialog-content>
    </dialog>
  `, scope, {model: {password: null}})
    .then(({model}) => {
      user.getPermission().elevate(model.password);
    })
}
