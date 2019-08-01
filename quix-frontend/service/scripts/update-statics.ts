import path from 'path';
import {buildAndCopyStatics} from './helpers/copy-statics';

function main() {
  const projectDir = path.resolve(__dirname, '..');
  const clientDir = path.resolve(__dirname, '..', '..', 'client');
  buildAndCopyStatics(projectDir, clientDir);
}

main();
