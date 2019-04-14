export default app => app
  .story('UI', 'Progress')
    .section('Progress gauge', `
      <bi-progress-gauge value="75" ng-non-bindable></bi-progress-gauge>
    `);
