export default app => app
  .story('UI', 'Empty state')
    .section('Empty state', `
      <div class="bi-empty-state">
        <div class="bi-empty-state-header">Default state</div>
        <div class="bi-empty-state-content">State content</div>
      </div>
      <div class="bi-empty-state--info">
        <div class="bi-empty-state-header">Info state</div>
        <div class="bi-empty-state-content">Empty state content</div>
      </div>
      <div class="bi-empty-state--info">
        <div class="bi-empty-state-content">Empty state without header</div>
      </div>
      <div class="bi-empty-state--nothing">
        <div class="bi-empty-state-header">Nothing state</div>
        <div class="bi-empty-state-content">Empty state content</div>
      </div>
      <div class="bi-empty-state--pending">
        <div class="bi-empty-state-header">Pending state</div>
        <div class="bi-empty-state-content">Empty state content</div>
      </div>
      <div class="bi-empty-state--error">
        <div class="bi-empty-state-header">Error state</div>
        <div class="bi-empty-state-content">Empty state content</div>
      </div>
      <div class="bi-empty-state--loading">
        <div class="bi-empty-state-content">Empty state content</div>
      </div>
    `);
