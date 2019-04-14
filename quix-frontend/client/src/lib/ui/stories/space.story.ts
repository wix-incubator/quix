export default app => app
  .story('UI', 'Layout')
    .section('Space', `
      <div class="bi-c bi-s-v">
        <span class="bi-label--sm">horizontal</span>

        <div class="bi-r bi-s-h--x05">
          <button class="bi-button" type="button">1</button>
          <button class="bi-button" type="button">2</button>
          <button class="bi-button" type="button">3</button>
        </div>

        <div class="bi-r bi-s-h">
          <button class="bi-button" type="button">1</button>
          <button class="bi-button" type="button">2</button>
          <button class="bi-button" type="button">3</button>
        </div>

        <div class="bi-r bi-s-h--x2">
          <button class="bi-button" type="button">1</button>
          <button class="bi-button" type="button">2</button>
          <button class="bi-button" type="button">3</button>
        </div>

        <div class="bi-r bi-s-h--x3">
          <button class="bi-button" type="button">1</button>
          <button class="bi-button" type="button">2</button>
          <button class="bi-button" type="button">3</button>
        </div>
      </div>

      <div class="bi-c bi-s-v">
        <span class="bi-label--sm">vertical</span>

        <div class="bi-r bi-s-h">
          <div class="bi-c bi-s-v--x05">
            <button class="bi-button" type="button">1</button>
            <button class="bi-button" type="button">2</button>
            <button class="bi-button" type="button">3</button>
          </div>

          <div class="bi-c bi-s-v">
            <button class="bi-button" type="button">1</button>
            <button class="bi-button" type="button">2</button>
            <button class="bi-button" type="button">3</button>
          </div>

          <div class="bi-c bi-s-v--x2">
            <button class="bi-button" type="button">1</button>
            <button class="bi-button" type="button">2</button>
            <button class="bi-button" type="button">3</button>
          </div>

          <div class="bi-c bi-s-v--x3">
            <button class="bi-button" type="button">1</button>
            <button class="bi-button" type="button">2</button>
            <button class="bi-button" type="button">3</button>
          </div>
        </div>
      </div>
    `);
