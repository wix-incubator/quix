import {inject} from '../../core';

export class Permission {
  private timeout;

  private password: string;

  elevate(password) {
    this.password = password;
  }

  deelevate() {
    this.password = null;
  }

  isElevated() {
    return !!this.password;
  }

  getPassword() {
    return this.password;
  }

  renew() {
    if (!this.isElevated()) {
      return;
    }

    const timeout = inject('$timeout');

    timeout.cancel(this.timeout);
    this.timeout = timeout(() => this.deelevate(), 30 * 60 * 10000); // 30 minutes
  }
}

export class User {
  private email: string;
  private avatar: string;
  private loggedIn;
  private role: string;
  private readonly permission = new Permission();

  fetch(appId?: string) {
    return inject('$resource')(`${appId ? `/${appId}` : ''}/api/user`).get().$promise.then(data => this.set(data.payload || data));
  }

  set({email, avatar, role}: Record<string, string>) {
    this.email = email;
    this.avatar = avatar;
    this.role = role || 'user';
    this.loggedIn = true;

    return this;
  }

  getEmail() {
    return this.email;
  }

  getAvatar() {
    return this.avatar;
  }

  getRole() {
    return this.role;
  }

  getPermission() {
    return this.permission;
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}
