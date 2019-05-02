# Quix
[![Build Status](https://travis-ci.com/wix-incubator/quix.svg?branch=master)](https://travis-ci.com/wix-incubator/quix)
<br />
Quix is a Web IDE for [Presto](https://prestosql.io).

It's your single point of truth and a shared space for your company's BI insights, with quick turnaround, interactive visual perspectives, and mixed data sources.<br />

## Disclaimer
Please note that this is a beta version of Quix which is still undergoing final testing before its official release.

## Main features

* Presto notes
* Notebooks
* Folders
* DB-tree
* Smart Editor

![](docs/flow.gif)

## Requirements
* [Presto](https://prestosql.io)
* [Docker Compose](https://docs.docker.com/compose/install/)

 
## Installation

All you need to do is to run Docker Compose:
```
docker-compose up
open http://localhost:3000
```

## Configuration

Most of the configuration you'll need is done in [.env](./.env) configuration file. <br />

##### Presto
By default, Quix works with demo Presto instance that runs inside Docker Compose. <br />
To work with your real Presto DB, change `PRESTO_API` URL.
Note that you need to specify full URL, including protocol, port and API version. For example: `http://presto.my.domain:8181/v1`

##### DB
Quix also uses MySQL to store notebooks and other application data. Location of this data is specified by `DB_VOLUME_PATH`. <br />
As an alternative, you may use external MySQL database, by specifying some of the following variables:

* DB_NAME - defaults to `Quix`, must exist
* DB_USER - defaults to `root`
* DB_PASS - defaults to empty password
* DB_HOST - defaults to `db`
* DB_PORT - defaults to `3306`

##### User authentication
Quix can work in two modes, multi-user mode authenticated with [Google OAuth](https://console.developers.google.com/apis/credentials), or a single-user mode. This is controlled by the following variables:
* AUTH_TYPE - can be `fake` or `google`. defaults to `fake` (single-user mode).

If you use google oauth, you must supply the clientId and the secret:
* GOOGLE_SSO_CLIENT_ID
* GOOGLE_SSO_SECRET

Other variables related to authentication:
* AUTH_COOKIE - defaults to `__quix`
* AUTH_SECRET - the encyption key for the cookie.
* COOKIE_MAX_AGE - should be in seconds, default is 30 days.


##### Configuration for custom deployment
Running quix with `docker-compose` should "just work", but when deploying quix, there are a couple more variables you might want to change:

* BACKEND_INTERNAL_URL - An address + port (no protocol) where the backend service is deployed to, and accessible to the frontend service.
* BACKEND_PUBLIC_URL - An address + port (no protocol) to the backend service, that will be accessbile to the user's browser. For most use-cases, this is the same as the previous variable.
* DB_AUTO_MIGRATE - In case of upgrades/schema change, should quix try to upgrade the schema automaticlly. defaults to `true`.

## Architecture

![](docs/architecture.png)

Quix consists of three main elements:

* Frontend to serve UI and manage notebooks persistence
* Backend to communicate with Presto
* DB to persist notebooks

Each component is run in a separate Docker container, and all of them are managed by a single Docker Compose configuration. 

There's fourth Docker container which we provide that runs Presto inside Docker Compose, but it's for demonstration purposes only.

## License
MIT
