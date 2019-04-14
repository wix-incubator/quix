export class ContextFactory {
  private extra: object = {};
  constructor(private base: object = {}) {}

  setExtra(extra?: object) {
    if (extra) {
      this.extra = extra;
    }
    return this;
  }

  create() {
    return new Context(this.base, this.extra);
  }
}

export class Context {
  constructor(private base: object, private extra: object) {}

  set(data: object) {
    return Object.assign(this.base, data);
  }

  get(): any {
    return {...this.extra, ...this.base};
  }
}
