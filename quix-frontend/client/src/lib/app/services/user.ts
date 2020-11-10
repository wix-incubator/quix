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

const addPrefixSlash = (s: string) => s[0] === '/' ? s : '/' + s;

export class User {
  private email: string;
  private name: string;
  private avatar: string;
  private loggedIn;
  private role: string;
  private id: string;
  private readonly permission = new Permission();

  fetch(apiBasePath?: string) {
    return inject('$resource')(`${apiBasePath ? addPrefixSlash(apiBasePath) : ''}/api/user`).get().$promise
      .then(data => this.set(data.payload || data));
  }

  set({email, name, avatar, role, id}: Record<string, string>) {
    this.email = email;
    this.name = name;
    this.avatar = avatar;
    this.role = role || 'user';
    this.loggedIn = null;
    this.id = id;

    return this;
  }

  getEmail() {
    return this.email;
  }

  getName() {
    return this.name;
  }

  getAvatar() {
    return this.avatar;
  }

  getRole() {
    return this.role;
  }

  getId() {
    return this.id;
  }

  getPermission() {
    return this.permission;
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  toggleLoggedIn(loggedIn) {
    return this.loggedIn = loggedIn;
  }
}
