export default app => app
  .story('UI', 'Colors')
    .section('Main colors', `
      <span class="bi-icon">color_lens</span>
      <span class="bi-icon bi-muted">color_lens</span>
      <span class="bi-icon bi-primary">color_lens</span>
      <span class="bi-icon bi-success">color_lens</span>
      <span class="bi-icon bi-warning">color_lens</span>
      <span class="bi-icon bi-danger">color_lens</span>

      <code>@import '../lib/ui/assets/css/def/colors.def';</code>
    `);
