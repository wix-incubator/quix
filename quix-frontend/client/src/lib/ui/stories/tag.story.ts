export default app => {
  app.story('UI', 'Tag')
    .section('Tags', `
      <span class="bi-tag">Default</span>
      <span class="bi-tag bi-primary">Primary</span>
      <span class="bi-tag bi-success">Success</span>
      <span class="bi-tag bi-warning">Warning</span>
      <span class="bi-tag bi-danger">Danger</span>
    `);
};
