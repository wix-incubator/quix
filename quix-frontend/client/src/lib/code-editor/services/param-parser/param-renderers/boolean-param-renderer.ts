export default function () {
  return `
    <bi-simple-select
      class="bi-grow"
      ng-model="param.value"
      ng-change="events.onParamChange(param)"
      bi-options="option for option in ::[true, false]"
    ></bi-simple-select
  `;
}
