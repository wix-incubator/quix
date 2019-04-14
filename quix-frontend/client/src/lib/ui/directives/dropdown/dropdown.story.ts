export default app => app
  .story('UI', 'Dropdown')
    .section('Dropdown', `
      <bi-dropdown ng-non-bindable>
        <bi-toggle class="bi-action bi-align bi-space-h--x05">
          <i class="bi-icon">menu</i>
          <span class="bi-label--sm">Default</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{align: 'right'}" ng-non-bindable>
        <bi-toggle class="bi-action bi-align bi-space-h--x05">
          <i class="bi-icon">menu</i>
          <span class="bi-label--sm">Align right</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{align: 'center'}" ng-non-bindable>
        <bi-toggle class="bi-action bi-align bi-space-h--x05">
          <i class="bi-icon">menu</i>
          <span class="bi-label--sm">Center</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{position: 'right'}" ng-non-bindable>
        <bi-toggle class="bi-action bi-align bi-space-h--x05">
          <i class="bi-icon">menu</i>
          <span class="bi-label--sm">Position right</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{hideOnClick: false}" ng-non-bindable>
        <bi-toggle class="bi-action bi-align bi-space-h--x05">
          <i class="bi-icon">menu</i>
          <span class="bi-label--sm">Don't hide on menu click</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{toggleOn: 'hover', hideOn: 'click'}" ng-non-bindable>
        <bi-toggle class="bi-align bi-space-h--x05">
          <i class="bi-icon bi-muted">menu</i>
          <span class="bi-label--sm">Show on hover hide on click</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>

      <bi-dropdown bd-options="{toggleOn: 'hover', delay: {show: 300}}" ng-non-bindable>
        <bi-toggle class="bi-align bi-space-h--x05">
          <i class="bi-icon bi-muted">menu</i>
          <span class="bi-label--sm">With delay</span>
        </bi-toggle>

        <ul class="bi-dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </bi-dropdown>
    `)
    .section('Dropdown menu', `
      <ul class="bi-dropdown-menu">
        <li class="selected">Selected option</li>
        <li disabled>Disabled option</li>
        <li class="bi-dropdown-separator"></li>
        <li>Another option</li>
      </ul>
    `);
