export default app => app
  .story('UI', 'Draggable')
    .section('Draggable', `
      <div ng-non-bindable bi-draggable>
        Drag me
      </div>
    `);
