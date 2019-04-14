export default class RunnerEvent {
  private readonly handlers = [];
  private readonly status = {
    callCount: 0
  };

  constructor (private readonly name, private readonly options = {dontDigest: false}) { }

  public getName() {
    return this.name;
  }

  public getOptions() {
    return this.options;
  }

  public append(handler) {
    this.handlers.push(handler);
  }

  public prepend(handler) {
    this.handlers.unshift(handler);
  }

  public apply(data, meta) {
    this.status.callCount++;

    this.handlers.every(handler => {
      data = handler(data, meta, this.status);

      // break if data is false
      if (data === false) {
        return false;
      }
      return true;
    });
  }
}
