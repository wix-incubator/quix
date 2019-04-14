import {ParamParser} from './params-parser';
import {paramSerializerFactory} from './param-serializers';

export {IParam, TType} from './param-types';
export {ParamParser} from './params-parser';

export const paramParserFactory = type => {
  return new ParamParser(paramSerializerFactory(type));
};
