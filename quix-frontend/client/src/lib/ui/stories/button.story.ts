export default app => {
  app.story('UI', 'Button')
    .section('Main Buttons', `
      <div class="bi-column bi-space-v">
        <div class="bi-space-h--x2">
          <button class="bi-button" type="button">Default</button>
          <button class="bi-button--primary" type="button">primary</button>
          <button class="bi-button--success" type="button">success</button>
          <button class="bi-button--warning" type="button">warning</button>
          <button class="bi-button--danger" type="button">danger</button>
        </div>
        <div class="bi-space-h--x2">
          <button class="bi-button" type="button" disabled="disabled">Default</button>
          <button class="bi-button--primary" type="button" disabled="disabled">primary</button>
          <button class="bi-button--success" type="button" disabled="disabled">success</button>
          <button class="bi-button--warning" type="button" disabled="disabled">warning</button>
          <button class="bi-button--danger" type="button" disabled="disabled">danger</button>
        </div>
      </div>
    `);

  app.story('UI', 'Loader')
    .section('Button loader', `
      <button type="button" class="bi-button--primary" ng-class="{'bi-button-loader': buttonClicked}" ng-click="buttonClicked = !buttonClicked">
        <span>click me</span>
      </button>
    `);
};
