export default function () {
  return `
    <textarea
      class="bi-input bi-grow"
      ng-model="param.value"
      ng-model-options="::{debounce: 100}"
      ng-change="events.onParamChange(param)"
      placeholder="Enter value"
    ></textarea>
  `;
}
