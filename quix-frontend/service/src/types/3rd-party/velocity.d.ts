declare module 'velocity' {
  export class Engine {
    constructor(options: {template: string});
    render(data: any): string;
  }
}
