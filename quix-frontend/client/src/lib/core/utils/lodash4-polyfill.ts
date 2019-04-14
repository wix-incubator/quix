'use strict';
import {lodash} from './';

if (!lodash.cloneDeepWith) {
  lodash.cloneDeepWith = function (value, customizerFunction) {
    return lodash.cloneDeep(value, customizerFunction);
  };
}
