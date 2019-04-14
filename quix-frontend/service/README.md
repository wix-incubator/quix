
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
QUIX_ENV=
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
DB_PORT=
BACKEND_URL=
GOOGLE_CLIENT_ID=
GOOGLE_AUTH_SECRET=
AUTH_COOKIE=
AUTH_SECRET=
```

You can set those in `.env` file.

For testing purposes, you have `.testenv`, which overrides any previous set value. 