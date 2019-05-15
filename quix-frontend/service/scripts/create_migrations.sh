#!/usr/bin/env bash

usage() {
  printf '**** usage: ****\n'
  printf 'create_migrations.sh \e[4mversion_number\e[0m\n'
  exit -2
}

if [ -z $1 ]; then
  usage
else

  DEFAULTPORT=3306
  DEFAULTDB="quix"
  DEFAULTPASS=""
  DEFAULTPUSER="root"
  DEFAULTHOST="localhost"

  export DB_HOST=${DB_HOST:-$DEFAULTHOST}
  export DB_USER=${DB_USER:-$DEFAULTPUSER}
  export DB_PASS=${DB_PASS:-$DEFAULTPASS}
  export DB_NAME=${DB_NAME:-$DEFAULTDB}
  export DB_PORT=${DB_PORT:-$DEFAULTPORT}

  sed -e "s/:dbhost:/$DB_HOST/" \
    -e "s/:dbuser:/$DB_USER/" \
    -e "s/:dbpass:/$DB_PASS/" \
    -e "s/:dbname:/$DB_NAME/" \
    -e "s/:dbport:/$DB_PORT/" \
    scripts/ormconfig.json.template > ormconfig.generated.migration-generate.json

  ./node_modules/.bin/ts-node -O '{"strict":false}' -r tsconfig-paths/register node_modules/.bin/typeorm migration:generate -n v$1 -f ormconfig.generated.migration-generate
fi

