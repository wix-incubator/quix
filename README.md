# Quix [![Build Status](https://travis-ci.com/wix/quix.svg?branch=master)](https://travis-ci.com/wix/quix)

Quix is an easy-to-use notebook manager with support for [Presto](https://wix.github.io/quix/docs/presto), [Athena](https://wix.github.io/quix/docs/athena), [BigQuery](https://wix.github.io/quix/docs/bigquery), [MySQL](https://wix.github.io/quix/docs/mysql), [PostgreSQL](https://wix.github.io/quix/docs/postgresql), [ClickHouse](https://wix.github.io/quix/docs/clickhouse) and more.

* [Demo](http://quix.wix.com)
* [Installation](https://wix.github.io/quix/docs/installation)
## Getting Started (or the TL;DR version on how to install)
Using docker-compose, this will run Quix with a mysql container, and an example presto installation. Quix will run in a single-user mode, no authentication. 
```bash
mkdir quix && cd quix
curl https://raw.githubusercontent.com/wix/quix/master/docker-compose.prebuilt.yml -o docker-compose.yml
curl https://raw.githubusercontent.com/wix/quix/master/env-example -o .env
docker-compose up
```
Be sure to check the [full installation notes](https://wix.github.io/quix/docs/installation) on how to edit the `.env` file and setup multiple data sources, add multiple users, or any other settings needed for custom deployment. 
## Features
- [Query organizer](#Organize) - organize your notebooks in folders for easy access and sharing
- [Query executor](#Execute) - execute multi-statement [Presto](https://github.com/prestosql/presto) queries
- [Visualizations](#Visualize) - quickly plot time and bar series (more visualizations to follow)
- [DB explorer](#Explore) - use the DB tree to explore your data sources
- Search - all queries are searchable accross all users
- Live syntax validation


#### Organize
![](documentation/docs/assets/management.gif)

#### Execute
![](documentation/docs/assets/presto.gif)

#### Visualize
![](documentation/docs/assets/chart.gif)

#### Explore
![](documentation/docs/assets/db.gif)

## License
MIT
