import ngApp from './bootstrap';
import init from './init';

init(ngApp);

export {default as createRunner, Runner} from './services/runner-service';
export {default as RunnerQuery} from './services/runner-query';
export {config} from './config';
