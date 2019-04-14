export default function () {
  return `
    <bi-simple-select
      class="bi-grow"
      ng-model="param.value"
      ng-change="events.onParamChange(param)"
      bi-options="option as getOptionTitle(option) for option in ::options"
      bs-options="::{dropdownMinWidth: 'toggle', typeahead: true}"
    ></bi-simple-select>
  `;
}
