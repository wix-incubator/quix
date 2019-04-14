export default app => app
  .story('UI', 'Scroll')
    .section('Scroll', `
      <div class="bi-scroll" style="width: 100%; height: 300px;">
        <div class="bi-center bi-muted" style="height:1000px;">I'm scrollable</div>
      </div>
    `);
