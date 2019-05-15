#!/usr/bin/env bash

if [ ! -f .quixroot ]; then
  echo "This script must be run from quix root folder"
  exit -1
fi

DEFAULTPORT=3306
DEFAULTDB="quix"
DEFAULTPASS=""
DEFAULTPUSER="root"
DEFAULTHOST="db"

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
  scripts/ormconfig.json.template > ormconfig.generated.migration-run.json

./node_modules/.bin/ts-node -O '{"strict":false}' -r tsconfig-paths/register node_modules/.bin/typeorm migration:run -f ormconfig.generated.migration-run
