# Quix ![Support](https://img.shields.io/npm/l/@wix/quix-client) [![Build Status](https://travis-ci.com/wix/quix.svg?branch=master)](https://travis-ci.com/wix/quix) [![Maven Central](https://maven-badges.herokuapp.com/maven-central/com.wix/quix-api_2.13/badge.svg)](https://maven-badges.herokuapp.com/maven-central/com.wix/quix-api_2.13)

Quix is an easy-to-use notebook manager with support for [Presto](https://wix.github.io/quix/docs/presto), [Athena](https://wix.github.io/quix/docs/athena), [BigQuery](https://wix.github.io/quix/docs/bigquery), [MySQL](https://wix.github.io/quix/docs/mysql), [PostgreSQL](https://wix.github.io/quix/docs/postgresql), [ClickHouse](https://wix.github.io/quix/docs/clickhouse) and more.

* [Online demo](https://quix-demo.io/)
* [Installation](https://wix.github.io/quix/docs/installation)

## Intro
Check out these blog posts introducing Quix on Wix Engineering Blog : 
* [Introducing Quix: Presto-based Notebook Manager for Fast and Easy Data Exploration ](https://www.wix.engineering/post/introducing-quix-presto-based-notebook-manager-for-fast-and-easy-data-exploration)
* [Quix Version 1: Now also Supporting Amazon Athena, Google BigQuery and Generic JDBC](https://www.wix.engineering/post/quix-version-1-now-also-supporting-amazon-athena-google-bigquery-and-generic-jdbc)

## Quick start
Using `docker-compose`, this will run Quix with a MySQL container and an example Presto installation. Quix will run in a single-user mode without authentication. 

```bash
mkdir quix && cd quix
curl https://raw.githubusercontent.com/wix/quix/master/docker-compose.prebuilt.yml -o docker-compose.yml
curl https://raw.githubusercontent.com/wix/quix/master/env-example -o .env
docker-compose up
```

Be sure to check the [full installation notes](https://wix.github.io/quix/docs/installation) on how to edit the `.env` file to add more data sources, turn on multi-user mode and customize your deployment.

For support please contact us via [oss@wix.com](mailto:oss@wix.com).

## Main features
- [Query management](#Management) - organize your notebooks in folders for easy access and sharing
- [Visualizations](#Visualizations) - quickly plot time and bar series (more visualizations to follow)
- [DB Explorer](#Explorer) - explore your data sources
- Search - search notes of all users

#### Management
![](documentation/docs/assets/management.gif)

#### Visualizations
![](documentation/docs/assets/chart.gif)

#### Explorer
![](documentation/docs/assets/db.gif)

## License
MIT
