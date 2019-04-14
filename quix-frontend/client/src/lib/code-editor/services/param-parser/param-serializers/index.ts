import {DefaultParamSerializer} from './default-param-serializer';
import {PythonParamSerializer} from './python-param-serializer';

export {ParamSerializer, ITokenizedParam} from './param-serializer';

export function paramSerializerFactory(type) {
  switch (type) {
    case 'python':
      return new PythonParamSerializer();
    default:
      return new DefaultParamSerializer();
  }
}
