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
    "^.+\\.(t|j)s$": "ts-jest"
  },
  moduleNameMapper: pkgJson.jest.moduleNameMapper
}
