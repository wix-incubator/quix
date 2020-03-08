---
id: about
title: About
sidebar_label: About
---

Quix is an easy-to-use notebook manager with support for [Presto](/quix/docs/presto), [Athena](/quix/docs/athena), [BigQuery](/quix/docs/bigquery), [MySQL](/quix/docs/mysql), [PostgreSQL](/quix/docs/postgresql), [ClickHouse](/quix/docs/clickhouse), [Amazon Redshift](/quix/docs/redshift) and more.

* [Demo](https://quix-demo.io/)
* [Installation](/quix/docs/installation)

## Quick start
Using docker-compose, this will run Quix with a MySQL container and an example Presto installation. Quix will run in a single-user mode without authentication. 

```bash
mkdir quix && cd quix
curl https://raw.githubusercontent.com/wix/quix/master/docker-compose.prebuilt.yml -o docker-compose.yml
curl https://raw.githubusercontent.com/wix/quix/master/env-example -o .env
docker-compose up
```

Be sure to check the [full installation notes](/quix/docs/installation) on how to edit the `.env` file to add more data sources, turn on multi-user mode and customize your deployment.

For support please conatct us via [oss@wix.com](mailto:oss@wix.com).

## Main features
- [Query management](#management) - organize your notebooks in folders for easy access and sharing
- [Visualizations](#visualizations) - quickly plot time and bar series (more visualizations to follow)
- [DB Explorer](#explorer) - explore your data sources
- Search - search notes of all users

#### Management
![](assets/management.gif)

#### Visualizations
![](assets/chart.gif)

#### Explorer
![](assets/db.gif)

