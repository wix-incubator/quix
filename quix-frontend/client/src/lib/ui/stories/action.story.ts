export default app => {
  app.story('UI', 'Action')
    .section('Icon actions', `
      <div class="bi-column bi-space-v">
        <div class="bi-space-h--x2">
          <span class="bi-action bi-icon">save</span>
          <span class="bi-action bi-icon">cached</span>
          <span class="bi-action bi-icon">delete</span>
          <span class="bi-action bi-icon--sm">save</span>
          <span class="bi-action bi-icon--sm">cached</span>
          <span class="bi-action bi-icon--sm">delete</span>
          <span class="bi-action bi-icon--xs">save</span>
          <span class="bi-action bi-icon--xs">cached</span>
          <span class="bi-action bi-icon--xs">delete</span>
        </div>
        <div class="bi-space-h--x2">
          <span class="bi-action bi-icon" disabled="disabled">save</span>
          <span class="bi-action bi-icon" disabled="disabled">cached</span>
          <span class="bi-action bi-icon" disabled="disabled">delete</span>
          <span class="bi-action bi-icon--sm" disabled="disabled">save</span>
          <span class="bi-action bi-icon--sm" disabled="disabled">cached</span>
          <span class="bi-action bi-icon--sm" disabled="disabled">delete</span>
          <span class="bi-action bi-icon--xs" disabled="disabled">save</span>
          <span class="bi-action bi-icon--xs" disabled="disabled">cached</span>
          <span class="bi-action bi-icon--xs" disabled="disabled">delete</span>
        </div>
      </div>
      <footer>See all available icons <a class="bi-link" href="https://material.io/icons/" target="_blank">here</a></footer>
    `)
    .section('Buttons actions', `
      <div class="bi-column bi-space-v">
        <div class="bi-space-h--x2">
          <span class="bi-action--btn">default</span>
          <span class="bi-action--btn bi-primary bi-text--sm">primary</span>
          <span class="bi-action--btn bi-success">success</span>
          <span class="bi-action--btn bi-warning">warning</span>
          <span class="bi-action--btn bi-danger">danger</span>
        </div>
        <div class="bi-space-h--x2">
          <span class="bi-action--btn" disabled="disabled">default</span>
          <span class="bi-action--btn bi-primary" disabled="disabled">primary</span>
          <span class="bi-action--btn bi-success" disabled="disabled">success</span>
          <span class="bi-action--btn bi-warning" disabled="disabled">warning</span>
          <span class="bi-action--btn bi-danger" disabled="disabled">danger</span>
        </div>
      </div>
    `)
    .section('Round actions', `
      <div class="bi-column bi-space-v">
        <div class="bi-space-h--x2">
          <span class="bi-action--rnd bi-icon">edit</span>
          <span class="bi-action--rnd bi-icon--sm">edit</span>
          <span class="bi-action--rnd bi-icon--xs">edit</span>
        </div>
        <div class="bi-space-h--x2">
          <span class="bi-action--rnd bi-icon" disabled="disabled">edit</span>
          <span class="bi-action--rnd bi-icon--sm" disabled="disabled">edit</span>
          <span class="bi-action--rnd bi-icon--xs" disabled="disabled">edit</span>
        </div>
      </div>
    `);

  app.story('UI', 'Loader')
    .section('Action loader', `
    <span class="bi-action bi-icon" ng-class="{'bi-action-loader': actionClicked}" ng-click="actionClicked = !actionClicked">
      <span>cached</span>
    </span>
  `);
};
