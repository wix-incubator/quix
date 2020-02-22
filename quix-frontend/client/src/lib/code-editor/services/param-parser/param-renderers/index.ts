import {isArray} from 'lodash';
import {inject} from '../../../../core';
import {IParam} from '../param-types';
import {default as renderInput} from './input-param-renderer';
import {default as renderBoolean} from './boolean-param-renderer';
import {default as renderDatetime} from './datetime-param-renderer';
import {default as renderOption} from './option-param-renderer';
import {default as renderList} from './list-param-renderer';
import {default as renderTextarea} from './textarea-param-renderer';

function compile(scope, param, html, overrides: Partial<IParam> = {}) {
  const childScope = scope.$new();

  childScope.param = param;
  childScope.options = overrides.options || param.options;
  childScope.getOptionTitle = option => {
    return isArray(option) ? option[1] : option;
  };

  return inject('$compile')(html)(childScope);
}

function getHtml(param: IParam, options: {dateFormat?: string} = {}) {
  switch (param.type) {
    case 'string':
      return renderInput('text');
    case 'number':
      return renderInput('number');
    case 'boolean':
      return renderBoolean();
    case 'datetime':
      (param as any).widgetValue = param.value;

      return renderDatetime(options.dateFormat);
    case 'option':
      return renderOption();
    case 'list':
      return renderList();
    case 'text':
      return renderTextarea();
    default:
      return renderInput('text');
  }
}

export function renderParam(scope, param: IParam, options, overrides?: Partial<IParam>) {
  return compile(scope, param, getHtml(param, options), overrides);
}
