type Ctor = new (...args: any[]) => any;

class ItemNotFoundT extends Error {
  private itemType: string;
  constructor(type: Ctor | string, private id: string) {
    super();
    if (typeof type === 'string') {
      this.itemType = type;
    } else {
      this.itemType = type.name;
    }
    this.message = `item of type:${this.itemType} and id:${id} not found.`;
    this.name = `ITEM_NOT_FOUND`;
  }
}

export const ItemNotFound = (type: Ctor | string, id: string) =>
  new ItemNotFoundT(type, id);

class BadActionT extends Error {
  constructor(type: string, customMsg: string) {
    super();
    this.message = `type ${type}. ${customMsg}`;
    this.name = `BAD_ACTION`;
  }
}

export const BadAction = (type: string, msg: string) =>
  new BadActionT(type, msg);
