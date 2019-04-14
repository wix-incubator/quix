export default app => app
  .story('UI', 'Alert')
    .section('Alert', `
      <div class="bi-s-v">
        <div class="bi-alert" style="width: 300px;">
          <div class="bi-alert-header">
            My alert
          </div>

          <div class="bi-alert-content">
            My alert content
          </div>
        </div>
        <div class="bi-alert--error" style="width: 300px;">
          <div class="bi-alert-header">
            My error
          </div>

          <div class="bi-alert-content">
            01010110100100010101
          </div>
        </div>
      </div>
    `);
