import ngApp from './bootstrap';
import init from './init';

init(ngApp);

export {default as createRunner, Runner} from './services/runner-service';
export {config} from './config';
