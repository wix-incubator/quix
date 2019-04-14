export default app => app
  .story('UI', 'Layout')
    .section('Column / Row', `
      <div class="bi-row-inline bi-space-h--x3">
        <div class="bi-space-v">
          <span class="bi-label--sm">column</span>
          <div class="bi-column">
            <div><button class="bi-button" type="button">1</button></div>
            <div><button class="bi-button" type="button">2</button></div>
            <div><button class="bi-button" type="button">3</button></div>
          </div>
        </div>

        <div class="bi-space-v">
          <span class="bi-label--sm">row</span>
          <div class="bi-row">
            <button class="bi-button" type="button">1</button>
            <button class="bi-button" type="button">2</button>
            <button class="bi-button" type="button">3</button>
          </div>
        </div>
      </div>
    `)
    .section('Grow', `
      <div class="bi-row bi-space-h">
        <button class="bi-button" type="button">1</button>
        <button class="bi-button" type="button">2</button>
        <button class="bi-button bi-grow" type="button">I should grow</button>
      </div>
    `);
