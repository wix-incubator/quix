---
id: installation
title: Installation
sidebar_label: Installation
---

## Requirements
* [Docker](https://www.docker.com/products)
* [Docker Compose](https://docs.docker.com/compose/install/)

**N.B.** Quix relies on [Presto](https://prestosql.io/), which is included with the Docker container in this repository, but for the **demo purposes** only. To work with real data, it must be accessible via a Presto API URL (more on this in [Configuration](#Configuration)).

## Running
Run Docker Compose:

```
docker-compose up
```

The initial run of the `docker-compose up` command will take care of all the dependencies, like MySQL, Presto, Maven, etc, will install all necessary Quix components and create a web-accessible Quix instance.

To access Quix, navigate to:
`http://localhost:3000`

## Configuration
Most of the configuration you'll need is done in the [.env](../../.env) configuration file.

#### Presto
By default, Quix works with demo Presto instance that runs inside Docker Compose.  
To work with your real Presto DB, change `PRESTO_API` URL.

Note that you need to specify full URL, including protocol, port and API version. For example: `http://presto.my.domain:8181/v1`

#### DB
Quix also uses MySQL to store notebooks and other application data. Location of this data is specified by `DB_VOLUME_PATH`.  
As an alternative, you can use an external MySQL database, by specifying some of the following variables:
* DB_NAME - defaults to `quix`, must exist
* DB_USER - defaults to `root`
* DB_PASS - defaults to empty password
* DB_HOST - defaults to `db`
* DB_PORT - defaults to `3306`

#### User authentication
Quix can work in two modes: multi-user mode, authenticated with [Google OAuth](https://console.developers.google.com/apis/credentials), or in a single-user mode. This is controlled by the following variables:
* AUTH_TYPE - can be `fake` or `google`. defaults to `fake` (single-user mode).

If you use google oauth, you must supply the clientId and the secret:
* GOOGLE_SSO_CLIENT_ID
* GOOGLE_SSO_SECRET

Other variables related to authentication:
* AUTH_COOKIE - defaults to `__quix`
* AUTH_SECRET - the encyption key for the cookie.
* COOKIE_MAX_AGE - should be in seconds, default is 30 days.

#### Configuration for custom deployment
Running quix with `docker-compose` should "just work", but when deploying quix, there are a couple more variables you might want to change:

* BACKEND_INTERNAL_URL - An address + port number (no protocol) where you have the backend service deployed and accessible to the frontend service.
* BACKEND_PUBLIC_URL - An address + port number (no protocol) to the backend service, made accessible to user's browser. In most scenarios, it's value is the same as `BACKEND_INTERNAL_URL`.
* DB_AUTO_MIGRATE - In case of upgrades/schema change, this controls whether quix should try and upgrade the schema automatically. Defaults to `true`.