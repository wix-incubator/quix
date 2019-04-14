export default app => app
  .story('UI', 'Maximizable')
    .section('Maximizable', `
      <div ng-non-bindable bi-maximizable>
        Maximize me
      </div>
    `);
