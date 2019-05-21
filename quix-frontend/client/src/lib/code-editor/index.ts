import ngApp from './bootstrap';
import init from './init';

export {default as CodeEditorInstance} from './services/code-editor-instance';
export {paramParserFactory} from './services/param-parser';
export {paramSerializerFactory} from './services/param-parser/param-serializers';

init(ngApp);
