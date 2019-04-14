export default app => app
  .story('UI', 'Layout')
    .section('Align', `
      <div class="bi-row-inline bi-space-h--x05">
        <button class="bi-button" type="button">1</button>
        <i class="bi-label--sm">top</i>
      </div>

      <div class="bi-row-inline bi-space-h--x05 bi-align">
        <button class="bi-button" type="button">2</button>
        <i class="bi-label--sm">middle</i>
      </div>

      <div class="bi-row-inline bi-space-h--x05 bi-align--bottom">
        <button class="bi-button" type="button">3</button>
        <i class="bi-label--sm">bottom</i>
      </div>
    `)
    .section('Spread', `
      <div class="bi-spread" style="width: 100%;">
        <button class="bi-button" type="button">look right</button>
        <button class="bi-button" type="button">look left</button>
      </div>
    `);
