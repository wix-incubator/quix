import {
  IParam, TType, TYPES, AUTO_PARAMS, TYPE_DEFAULTS, AUTO_PARAM_TYPES, AUTO_PARAM_DEFAULTS, TUserSelectableTypes
} from './param-types';

import {TPredefindListsTypes, PREDEFINED_LISTS, PREDEFINED_LISTS_DATA} from './params-predefined-types';
import {ParamSerializer, ITokenizedParam} from './param-serializers';

export type IParamTransformer = (param: ITokenizedParam) => string;

export type IParamReplacer = (text: string, oldParam: string, newParam: string) => string;

function defaultReplacer(text: string, oldParam: string, newParam: string) {
  return text.replace(oldParam, newParam);
}

const isPredefinedListType = (type: TUserSelectableTypes): type is TPredefindListsTypes =>
  PREDEFINED_LISTS.some(value => value === type);

export class ParamParser {
  constructor(private readonly serializer: ParamSerializer) {

  }

  static TYPES: TUserSelectableTypes[] = [...TYPES, ...PREDEFINED_LISTS];
  static AUTO_PARAMS = AUTO_PARAMS;

  /**
   * Iterates over params in text
   * By default, doesn't interate over more than one instance of param
   */
  public *each(text: string, all: boolean = false): Iterable<ITokenizedParam> {
    const processed = {};

    for (const param of this.serializer.params(text)) {
      if (!all && (param.isKeyOnlyParam || processed[param.key])) {
        continue;
      }

      processed[param.key] = true;

      yield param;
    }
  }

  /**
   * Iterates over all params in text
   */
  private all(text: string): Iterable<ITokenizedParam> {
    return this.each(text, true);
  }

  /**
   * Iterates over params in text and replaces them
   */
  private replace(text: string, transformer: IParamTransformer, replacer: IParamReplacer = defaultReplacer): string {
    return Array.from(this.all(text)).reduce((res, param) => replacer(res, param.match, transformer(param)), text);
  }

  /**
   * Indexes params by key
   */
  private paramsByKey(params: IParam[]): {[key: string]: IParam} {
    return params.reduce((res, param: IParam) => {
      res[param.key] = param;
      return res;
    }, {});
  }

  /**********************************************
   * PUBLIC
   **********************************************/

  public getSerializer(): ParamSerializer {
    return this.serializer;
  }

  /**
   * Checks for differences between the params encoded in the text and the array of params
   */
  public isSynced(params: IParam[], text: string): boolean {
    let res = true;
    const paramsByKey = this.paramsByKey(params);

    for (const {key, value, isAutoParam} of this.all(text)) {
      if (!isAutoParam && (!paramsByKey[key] || paramsByKey[key].value !== value)) {
        res = false;
        break;
      }
    }

    return res;
  }

  /**
   * Embeds params into text
   */
  public embed(text, params: IParam[], replacer: IParamReplacer = defaultReplacer): string {
    const embeded = this.serializer.extract(text);

    if (!embeded) {
      return params.length ? replacer(text, text, `${this.serializer.embed(text, params)}${text}`) : text;
    }

    return replacer(text, embeded, params.length ? this.serializer.embed(text, params) : '');  
  }

  /**
   * Creates an array of params encoded in the text
   */
  public params(text: string, {customParamsEnabled} = {customParamsEnabled: true}, params: IParam[] = []): IParam[] {
    const paramsByKey = this.paramsByKey(params);

    return Array.from(this.each(text)).reduce((res, {key, value, type, isAutoParam, options}) => {
      if (!isAutoParam && !customParamsEnabled) {
        return res;
      }

      res.push(this.createParam(key, type, isAutoParam && paramsByKey[key] ? paramsByKey[key].value : value, options));

      return res;
    }, []);
  }

  /**
   * Updates params encoded in the text with values in the params array
   * Returns lock ranges
   */
  public sync(text: string, params: IParam[], {customParamsEnabled} = {customParamsEnabled: true}, replacer: IParamReplacer = defaultReplacer): [number, number][] {
    let res = this.embed(text, params, replacer);
    const paramsByKey = this.paramsByKey(params);

    res = this.replace(res, param => {
      if (!paramsByKey[param.key] || (!param.isAutoParam && !customParamsEnabled)) {
        return param.match;
      }

      return this.serializer.serialize({...param, ...paramsByKey[param.key] || {}});
    }, replacer);

    return this.serializer.getLockRange(res);
  }

  /**
   * Replaces params in text with their respective values
   */
  public format(text: string, params: IParam[], options = {customParamsEnabled: true, keepEmbed: false}): string {
    if (!text) {
      return text;
    }

    const res = options.keepEmbed ? text : this.embed(text, []);
    const paramsByKey = this.paramsByKey(params);

    return this.replace(res, param => {
      if (!paramsByKey[param.key] || (!param.isAutoParam && !options.customParamsEnabled)) {
        return param.match;
      }

      return this.serializer.serialize({...param, ...paramsByKey[param.key] || {}}, 'value');
    });
  }

  public createParam(key: string, type: TUserSelectableTypes = 'string', value: any, options?: string[]): IParam {
    const isAutoParam = AUTO_PARAMS.indexOf(key) !== -1;

    type = isAutoParam ? AUTO_PARAM_TYPES[key] : type || 'string';

    if (isAutoParam) {
      type = AUTO_PARAM_TYPES[key];
      value = value || AUTO_PARAM_DEFAULTS[key];
    }

    const actualType: TType = isPredefinedListType(type) ? 'list' : type;

    if (isPredefinedListType(type)) {
      options = PREDEFINED_LISTS_DATA[type];
    }

    if (typeof value === 'undefined') {
      value = TYPE_DEFAULTS[type];
    }

    return {
      key,
      type: actualType,
      value,
      isAutoParam,
      options
    };
  }
}
