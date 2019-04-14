import velocity from 'velocity';

function expressEngine() {
  return function render(template: string, data: any, cb: any) {
    const vm = new velocity.Engine({
      template,
    });
    cb(null, vm.render(data));
  };
}
export default expressEngine;
