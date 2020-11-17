---
id: installation
title: Installation
sidebar_label: Installation
---

## Requirements
* [Docker](https://www.docker.com/products)
* [Docker Compose](https://docs.docker.com/compose/install/)

## Running
Run Docker Compose:

```
docker-compose up
```

The initial run of the `docker-compose up` command will take care of all the dependencies, like MySQL, Presto, Maven, etc, will install all necessary Quix components and create a web-accessible Quix instance.
You will need an `.env` file to run it. We will configure it in the next step.

To access Quix, navigate to:  
`http://localhost:3000`

## Configuration
Most of the configuration you'll need is done through environment variables. docker-compose can load environment-variables easily through a `.env` file.
You should rename our [env-example](https://github.com/wix/quix/blob/master/env-example) file to `.env`, and modify it's values as needed. 

#### Presto
By default, Quix works with demo Presto instance that runs inside Docker Compose.  
To work with your real Presto DB, change `PRESTO_API` environment variable.

Note that you need to specify full URL, including protocol, port and API version:
* PRESTO_API - `http://presto.my.domain:8181/v1`  

  If you're running Presto locally, use the following instead of `localhost`:
  * Your internal IP
  * Or `host.docker.internal` (macOS only)

#### DB
Quix also uses MySQL to store notebooks and other application data. The default docker-compose uses a mysql container, so no further setup is needed. 
As an alternative, you can also use an external MySQL database, by specifying some of the following variables:
* DB_NAME - defaults to `quix`, must exist
* DB_USER - defaults to `root`
* DB_PASS - defaults to empty password
* DB_HOST - defaults to `db`
* DB_PORT - defaults to `3306`

* DB_AUTO_MIGRATE - this sets the [TypeORM](https://typeorm.io/#/connection-options) `synchronize` flag. Defaults to `false`. You probably only want to set this when running locally for development or if you don't care at all about your data.

#### User authentication
Quix can work in two modes: multi-user mode, authenticated with [Google OAuth](https://console.developers.google.com/apis/credentials), or in a single-user mode. This is controlled by the following variables:
* AUTH_TYPE - can be `fake` or `google`. Defaults to `fake` (single-user mode).

If you use Google OAuth, you must supply the clientId and the secret:
* GOOGLE_SSO_CLIENT_ID
* GOOGLE_SSO_SECRET

Other variables related to authentication:
* AUTH_COOKIE - defaults to `__quix`. When using `google` auth, must be provided.
* AUTH_SECRET - the encryption key for the cookie. Must be provided.
* COOKIE_MAX_AGE - should be in seconds, default is 30 days.

#### Configuration for custom deployment
Running quix with `docker-compose` should "just work", but when deploying quix, there are a couple more variables you might want to change:

* BACKEND_INTERNAL_URL - An address + port number (no protocol) where you have the backend service deployed and accessible to the frontend service.
* BACKEND_PUBLIC_URL - An address + port number (no protocol) to the backend service, made accessible to user's browser. In most scenarios, it's value is the same as `BACKEND_INTERNAL_URL`.
* ENABLE_APPMETRICS - Set this variable if you want to enable [appmetrics-dash](https://github.com/RuntimeTools/appmetrics-dash).
* APPMETRICS_PORT - The port where appmetrics dashboard will be exposed.

## Upgrading Quix
This takes into account a `docker-compose` setup. Extrapolate as needed if you have some other custom deployment. 

1. Backup your data, if possible.
2. Download an updated `docker-compose.yml` or `docker-compose.prebuilt.yml`. If you are not using the prebuilt images, you need to run `docker-compose build`.
3. Stop the frontend and backend services - `docker-compose stop backend frontend`.
4. Make sure all your environment variables are exported correctly in your current shell, specifically all the `DB_*` variables.
5. Run DB migrations: `docker-compose run --no-deps --rm frontend scripts/run_migrations.sh`.
6. Start services again `docker-compose up -d`.
