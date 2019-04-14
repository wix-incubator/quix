export default app => app
  .story('UI', 'Media')
    .section('Media', `
      <span class="bi-media--normal">I should be visible on <b>normal</b> screens only</span>
      <span class="bi-media--small">I should be visible on <b>small</b> screens only</span>
    `);
