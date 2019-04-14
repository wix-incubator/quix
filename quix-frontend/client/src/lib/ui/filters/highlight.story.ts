export default app => app
  .story('UI', 'Highlight')
    .section('Highlight', `
      <div ng-non-bindable ng-bind-html="'Hello World!' | biHighlight:'World'"></div>
    `);
