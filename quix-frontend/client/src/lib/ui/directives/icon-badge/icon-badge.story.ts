export default (app) =>
  app.story('UI', 'Icon Badge').section(
    'Icon Badge',

    /*html*/ `
    <bi-icon-with-badge count="oneDigitCount"  hide="true">
         <i class="bi-action bi-icon"
            title="Hidden">delete_outline</i>
    </bi-icon-with-badge>
    <bi-icon-with-badge count="oneDigitCount"  hide="false">
         <i class="bi-action bi-icon"
            title="One Digit">delete_outline</i>
    </bi-icon-with-badge>
    <bi-icon-with-badge count="twoDigitCount"  hide="false">
         <i class="bi-action bi-icon"
            title="Two Digits">delete</i>
    </bi-icon-with-badge>
    <bi-icon-with-badge count="threePlusDigitsCount"  hide="false">
         <i class="bi-action bi-icon"
            title="Three + Digits">delete_outline</i>
    </bi-icon-with-badge>  
    `,
    (scope) => {
      scope.oneDigitCount = 7;
      scope.twoDigitsCount = 42;
      scope.threePlusDigitsCount = 256;
    }
  );
