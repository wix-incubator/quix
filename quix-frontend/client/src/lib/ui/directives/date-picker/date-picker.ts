import './date-picker.scss';

import 'jquery-datetimepicker/build/jquery.datetimepicker.full.js';
import 'jquery-datetimepicker/jquery.datetimepicker.css';
import {assign} from 'lodash';
import {initNgScope, createNgModel} from '../../../core';
import BiDate from '../../services/date';

function getRange(options) {
  let minDate: Date, maxDate: Date;

  if (options.maxRange) {
    const range = BiDate.getRange(options.maxRange, {maxDate: options.maxDate});

    maxDate = new Date(range.end);
    minDate = new Date(range.start);
  } else {
    minDate = (options.minDate && new Date(options.minDate)) || undefined;
    maxDate = (options.maxDate && new Date(options.maxDate)) || undefined;
  }

  return {minDate, maxDate};
}

function formatter(model, dateFormat) {
  const date = model && new BiDate(model);

  return date && (dateFormat ? date.asMoment().format(dateFormat) : date.fromUTC().format(BiDate.DATE_FORMAT));
}

function parser(model, dateFormat) {
  const date = new BiDate(model).toUTC();

  return dateFormat ? date.format(dateFormat) : date.valueOf();
}

function init(scope, element) {
  let params = {
    parentID: scope.options.parent === 'self' ? element : 'body',
    lazyInit: true,
    value: scope.model,
    defaultTime: '00:00',
    minDate: null,
    maxDate: null,
    timepicker: scope.options.timepicker,
    format: scope.options.widgetDateFormat,
    scrollInput: scope.options.enableScroll,
    className: scope.options.className,
    onShow() {
      if (scope.options.parent === 'self') {
        setTimeout(() => element.find('.xdsoft_datetimepicker').css({
          left: 0,
          top: 34
        }, 0));
      }
    },
    onChangeDateTime: date => {
      scope.$apply(() => {
        scope.model = date && date.valueOf();
        scope.onChange({date: scope.model});
      });
    }
  };

  params = assign<typeof params, any>(params, getRange(scope.options));
  element.find('input').datetimepicker(params);
}

function renderer(element, model) {
  element.find('input').val(model);
}

export default () => {
  return {
    restrict: 'E',
    template: `
      <input
        class="bi-input bi-grow"
        ng-class="{'bi-input__sm': options.size === 'small'}"
        placeholder="{{::placeholder}}"
        ng-readonly="::readonly"
      >
    `,
    require: ['ngModel', '?errors'],
    scope: {
      onChange: '&',
      bdpOptions: '=',
      readonly: '='
    },

    link: {
      pre(scope, element, attrs, [ngModel, errors]) {
        createNgModel(scope, ngModel)
          .formatWith(model => formatter(model, scope.options.dateFormat))
          .parseWith(model => parser(model, scope.options.dateFormat))
          .renderWith(model => renderer(element, model));

        initNgScope(scope, {errors})
          .readonly(scope.readonly)
          .withOptions('bdpOptions', {
            size: 'normal',
            minDate: null,
            maxDate: null,
            maxRange: null,
            dateFormat: BiDate.DATE_FORMAT,
            timepicker: true,
            widgetDateFormat: 'Y/m/d H:i',
            enableScroll: true,
            className: '',
            parent: null  // null|self
          })
          .withErrors([{
            name: 'required',
            text: 'Date is required'
          }])
          .thenIfNotReadonly(() => init(scope, element));

        scope.placeholder = attrs.placeholder;

        scope.$on('$destroy', () => element.find('input').datetimepicker('destroy'));
      }
    }
  };
};
