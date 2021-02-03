const path = require('path');
const pkgJsonPath = path.resolve(__dirname, '..', 'package.json');
const pkgJson = require(pkgJsonPath)

module.exports =  {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "../src",
  "roots": ["<rootDir>", "<rootDir>/../test"],
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "transformIgnorePatterns": ["/node_modules/", "/quix-frontend\\shared/"],
}
