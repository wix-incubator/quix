export class Config<T> {
  private options: Partial<T> = {};

  get() {
    return this.options;
  }

  set(options: Partial<T>) {
    this.options = {...this.options as any, ...options as any};
  }
}
