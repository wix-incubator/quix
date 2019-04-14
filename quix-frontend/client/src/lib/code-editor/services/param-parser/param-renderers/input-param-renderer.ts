export default function (type: 'text' | 'number' = 'text') {
  return `
    <input
      class="bi-input bi-grow"
      type="${type}"
      ng-model="param.value"
      ng-model-options="::{debounce: 100}"
      ng-change="events.onParamChange(param)"
      placeholder="Enter value"
    >
  `;
}
