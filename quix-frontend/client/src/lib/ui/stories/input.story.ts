export default app => app
  .story('UI', 'Input')
    .section('Text input', `
      <input class="bi-input" placeholder="Default"/>
      <input class="bi-input" bi-focus placeholder="Auto focused"/>
      <input class="bi-input" placeholder="I'm disabled" disabled="true"/>
      <input class="bi-input" placeholder="I'm required" ng-required="true" ng-model="someVar"/>
    `)
    .section('Textarea', `
      <textarea class="bi-input" placeholder="Enter some text"></textarea>
      <textarea class="bi-input" placeholder="I'm disabled" disabled="true"></textarea>
    `)
    .section('Input with action', `
      <div class="bi-r-i" ng-non-bindable>
        <input class="bi-input" placeholder="Default"/>
        <span class="bi-input-action">
          <bi-copy-to-clipboard text="'hi!'"></bi-copy-to-clipboard>
        </span>
      </div>
    `);
