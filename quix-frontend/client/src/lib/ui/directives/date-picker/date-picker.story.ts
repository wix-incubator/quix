export default app => app
  .story('UI', 'Datepicker')
    .section('Datepicker', `
      <output>{{model}}</output>

      <bi-date-picker ng-non-bindable
        class="bi-grow"
        ng-model="model"
        bdp-options="::{dateFormat: 'YYYY-MM-DD HH:mm'}"
        placeholder="Enter value"
      ></bi-date-picker>
    `, scope => scope.model = '2019-02-01 00:00')
    .section('Datepicker raw', `
      <output>{{model2}}</output>

      <bi-date-picker ng-non-bindable
        class="bi-grow"
        ng-model="model2"
        bdp-options="::{dateFormat: null}"
        placeholder="Enter value"
      ></bi-date-picker>
    `, scope => scope.model2 = 1548979200000);
