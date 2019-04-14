export default app => app
  .story('UI', 'Form')
    .section('Horizontal labels (Default)', `
      <div class="bi-form" style="width: 500px;" ng-non-bindable>
        <div class="bi-form-row">
          <div class="bi-form-label">label1</div>
          <input class="bi-form-input bi-input" ng-model="model1" placeholder="Enter value">
        </div>
        <div class="bi-form-row">
          <div class="bi-form-label--required">label1</div>
          <input class="bi-form-input bi-input" ng-model="model2" placeholder="Enter value" required="true">
        </div>
      </div>
    `)
    .section('Vertical labels', `
      <div class="bi-form--vertical" style="width: 500px;" ng-non-bindable>
        <div class="bi-form-row">
          <div class="bi-form-label">label1</div>
          <input class="bi-form-input bi-input" ng-model="model1" placeholder="Enter value">
        </div>
        <div class="bi-form-row">
          <div class="bi-form-label--required">label1</div>
          <input class="bi-form-input bi-input" ng-model="model2" placeholder="Enter value" required="true">
        </div>
      </div>
    `);
