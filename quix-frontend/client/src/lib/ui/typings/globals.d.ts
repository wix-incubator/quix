import {LoDashStatic} from "lodash";

declare global {
  module NodeJS {
    interface Global {
      window: Window;
      angular: ng.IAngularStatic;
      localStorage: any;
      inject: ng.IInjectStatic;
      _: LoDashStatic

    }
  }

  interface Window {
    beforeEach: any;
    afterEach: any;
    angular: ng.IAngularStatic;
    localStorage: any;
    inject: ng.IInjectStatic;
    _: LoDashStatic
    jQuery: JQueryStatic
  }
}

