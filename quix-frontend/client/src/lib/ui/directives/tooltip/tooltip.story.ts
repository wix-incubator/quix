export default app => app
  .story('UI', 'Tooltip')
    .section('Tooltip', `
      <bi-tooltip bt-text="This does something" ng-non-bindable>
        <bi-toggle>
          <button type="button" class="bi-button--primary">default tooltip</button>
        </bi-toggle>
      </bi-tooltip>

      <bi-tooltip bt-text="I'm on top" bt-options="{position: 'top'}" ng-non-bindable>
        <bi-toggle>
          <button type="button" class="bi-button--primary">tooltip on top</button>
        </bi-toggle>
      </bi-tooltip>

      <bi-tooltip ng-non-bindable>
        <bi-toggle>
          <button type="button" class="bi-button--primary">HTML tooltip</button>
        </bi-toggle>

        <div class="bi-text--lg">I'm big!</div>
        <div>Linebreak!</div>
      </bi-tooltip>
    `);
