export default app => app
  .story('UI', 'Droppable')
    .section('Droppable', `
      <div ng-non-bindable bi-draggable="onDrag()">
        Drag me
      </div>
      <div ng-non-bindable bi-droppable="onDrop(foo)">
        Drop here
      </div>

      <output>{{foo}}</output>
    `, scope => {
      scope.onDrag = () => {
        return {foo: 1};
      };

      scope.onDrop = foo => {
        scope.foo = foo;
      };
    });
