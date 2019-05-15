import path from 'path';
import fs from 'fs';
import {buildAndCopyStatics} from './helpers/copy-statics';

async function main() {
  const projectDir = path.resolve(__dirname, '..');
  const clientDir = path.resolve(__dirname, '..', '..', 'client');

  const mainFile = path.resolve(projectDir, 'src', 'main.ts');

  if (!fs.existsSync(path.resolve(projectDir, 'statics', 'index.vm'))) {
    buildAndCopyStatics(projectDir, clientDir);
  }
  require(mainFile);
}

main();
