# Quix
[![Build Status](https://travis-ci.com/wix-incubator/quix.svg?branch=master)](https://travis-ci.com/wix-incubator/quix)
<br />
Quix is a Web IDE for Presto.

It's your single point of truth and a shared space for your company's BI insights, with quick turnaround, interactive visual perspectives, and mixed data sources.<br />

## Main features

* Presto notes
* Notebooks
* Folders
* DB-tree
* Smart Editor

![](docs/flow.gif)

## Requirements
* Presto
* [Docker Compose](https://docs.docker.com/compose/install/)

 
## Installation

All you need to do is to run Docker Compose:
```
docker-compose up
open http://localhost:3000
```

## Configuration

Most of the configuration you'll need is done in [.env](./.env) configuration file. <br />
By default, Quix works with demo Presto instance that runs inside Docker Compose. <br />
To work with your real Presto DB, change `PRESTO_API` URL.
Note that you need to specify full URL, including protocol, port and API version. For example: `http://presto.my.domain:8181/v1`

Quix also uses MySQL to store notebooks and other application data. Location of this data is specified by `DB_VOLUME_PATH`. <br />
As an alternative, you may use external MySQL database, by specifying some of the following variables:
* DB_NAME - defaults to `Quix`, must exist
* DB_USER - defaults to `root`
* DB_PASS - defaults to empty password
* DB_HOST - defaults to `db`
* DB_PORT - defaults to `3306`

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
