export default app => app
  .story('UI', 'Badge')
    .section('Badge', `
      <span class="bi-badge">1</span>
      <span class="bi-badge--primary">2</span>
      <span class="bi-badge--success">3</span>
      <span class="bi-badge--warning">4</span>
      <span class="bi-badge--danger">5</span>
    `);
