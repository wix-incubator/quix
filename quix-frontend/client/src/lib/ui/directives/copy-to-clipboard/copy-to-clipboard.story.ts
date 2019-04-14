export default app => app
  .story('UI', 'Clipboard')
    .section('Copy to clipboard', `
      <bi-copy-to-clipboard ng-non-bindable text="'Hello world!'"></bi-copy-to-clipboard>
    `);
