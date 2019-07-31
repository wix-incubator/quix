import {exec, ExecOutputReturnValue, cp} from 'shelljs';
import path from 'path';

export function buildAndCopyStatics(projectDir: string, clientDir: string) {
  const build = exec('npm run build', {
    cwd: clientDir,
  }) as ExecOutputReturnValue;

  if (build.code) {
    process.exit(-1);
  }

  const copy = cp('-R', path.resolve(clientDir, 'dist', 'statics'), projectDir);
  if (copy.code) {
    process.exit(-1);
  }
}
