## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests - against sqlite
$ npm run test

# unit tests - against mysql
$ npm run test:mysql

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Configuration
The app expects the following enviorment variables:
```bash
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
DB_PORT=
BACKEND_INTERNAL_URL=
BACKEND_PUBLIC_URL=
GOOGLE_SSO_CLIENT_ID=
GOOGLE_SSO_SECRET=
AUTH_COOKIE=
AUTH_SECRET=
COOKIE_MAX_AGE=
DB_TYPE=
AUTH_TYPE=
DB_AUTO_MIGRATE=
MINIFIED_STATICS=
```

You can set those in `.env` file. When testing, values are read from `.testenv`.


This app is built using ![Nest.js](https://raw.githubusercontent.com/nestjs/docs.nestjs.com/master/src/assets/logo.png).