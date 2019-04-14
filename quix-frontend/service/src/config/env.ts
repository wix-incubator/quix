import dotenv from 'dotenv';
import {isJestTest} from './utils';
import path from 'path';
import fs from 'fs';

let enviormentLoaded = false;
export const loadEnv = () => {
  if (!enviormentLoaded) {
    dotenv.config();
    if (isJestTest()) {
      const testEnv = dotenv.parse(
        fs.readFileSync(path.resolve(process.cwd(), '.testenv')),
      );
      for (const k of Object.keys(testEnv)) {
        process.env[k] = testEnv[k];
      }
    }
    enviormentLoaded = true;
  }
};
