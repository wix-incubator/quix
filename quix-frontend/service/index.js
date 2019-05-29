if (process.env.ENABLE_APPMETRICS) {
  var dash = require('appmetrics-dash');
  const monitorPort = process.env.APPMETRICS_PORT ? parseInt(process.env.APPMETRICS_PORT, 10) : 3001;
  dash.monitor({port: monitorPort});
}

/* ugly hack to handle path mapping on dist */
const mapValues = require('lodash/mapValues')
const path = require('path');
const tsConfig = require("./tsconfig.json");
const tsConfigPaths = require("tsconfig-paths");

const paths = mapValues(tsConfig.compilerOptions.paths, (value, key) => {
  if (key.startsWith('shared')) {
    value[0] = value[0].replace('../shared', '../../shared/dist');
  } else {
    value[0] = value[0].replace('./src/', './');
  }
  return value;
});
const baseUrl = path.resolve('./', './dist');
const cleanup = tsConfigPaths.register({
  baseUrl,
  paths,
});

require(path.resolve('./', 'dist', 'main'));