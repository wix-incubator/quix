export default function (dateFormat: string = 'YYYY-MM-DD HH:mm', widgetDateFormat: string = 'Y-m-d H:i') {
  return `
    <bi-date-picker
      class="bi-r-i bi-grow"
      ng-model="param.widgetValue"
      ng-change="param.value = param.widgetValue; events.onParamChange(param)"
      bdp-options="::{
        dateFormat: '${dateFormat}',
        widgetDateFormat: '${widgetDateFormat}'
      }"
      placeholder="Enter value"
    ></bi-date-picker>
  `;
}
