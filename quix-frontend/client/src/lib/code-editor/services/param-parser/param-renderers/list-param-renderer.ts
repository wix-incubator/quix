export default function () {
  return `
    <bi-tags
      class="bi-grow"
      ng-model="param.value"
      ng-change="events.onParamChange(param)"
      bi-options="option as getOptionTitle(option) for option in ::options"
      placeholder="Select values"
    ></bi-tags>
  `;
}
