# Quix
[![Build Status](https://travis-ci.com/wix-incubator/quix.svg?branch=master)](https://travis-ci.com/wix-incubator/quix)

Quix is a robust easy-to-use business intelligence & data analytics tool built to handle both quick insights and massive resource-demanding queries. It features data visualization and export, user management, and organizes queries in notebooks for easy access and sharing across teams.

Please note that this is a beta version of Quix which is still undergoing final testing before its official release.
A web-based IDE for [Presto](https://github.com/prestodb/presto), Quix is your single point of truth and a shared space for your company's BI insights, with quick turnaround, interactive visual perspectives, and mixed data sources.
## Disclaimer

![](docs/flow.gif)

## What can I do with it?

Quix is flexible enough to be used in an array of applications on any scale. It can serve as a:

- Shared space for your company's BI insights
- Single point of truth for all team members on public or proprietary data
- Report generator using built-in charting tools
- A handy tool to store, share, download, and embed live data from reports into any website (internal or public)

## Core features

* Presto notes
* Notebooks
* Folders
* DB-tree
* Smart Editor
<!-- TODO Full text search -->

## Requirements

* [Docker](https://www.docker.com/products) (engine, enterprise or desktop edition, whichever works for you)
* [Docker Compose](https://docs.docker.com/compose/install/)

**N.B.** Quix relies on [Presto](http://prestodb.github.io/), which is included with the Docker container in this repository, but for the **demo purposes** only. To work with real data, it must be accessible via a Presto API URL (more on this in [Configuring](#Configuring)).

## Setup and running

All you need to do is to run Docker Compose:

```
docker-compose up
```

The initial run of the `docker-compose up` command will take care of all the dependencies, like MySQL, Presto, Maven, etc, will install all necessary Quix components and create a web-accessible Quix instance.

To then access Quix, in your browser navigate to:
`http://localhost:3000`

## Configuring

Most of the configuration you'll need is done in the [.env](./.env) configuration file. By default, Quix works with a demo Presto instance that runs inside Docker Compose. To work with your real Presto DB, change the `PRESTO_API` URL.

Note that you need to specify full URL, including protocol, port and API version. For example: `http://presto.my.domain:8181/v1`

Quix also uses MySQL to store notebooks and other application data. Location of this data is specified by `DB_VOLUME_PATH`. <br />
As an alternative, you can use an external MySQL database, by specifying some of the following variables:
* `DB_NAME` - defaults to `Quix`, must exist
* `DB_USER` - defaults to `root`
* `DB_PASS` - defaults to empty password
* `DB_HOST` - defaults to `db`
* `DB_PORT` - defaults to `3306`

## Architecture

![](docs/architecture.png)

Quix consists of three main elements:

* Frontend to serve UI and manage notebooks
* Backend to communicate with Presto
* DB for storing notebooks

Each component is run in a separate Docker container, and all of them are managed by a single Docker Compose configuration.

There's also a fourth Docker container provided with this repository running Presto inside Docker Compose, but it's for demonstration purposes only.

<!-- ### TODO User authentication -->

## Using Quix

Let's start with two major concepts of Quix - **notebooks** and **notes**.

#### Notes

A note is basically a record of an SQL query, which when run, retries data from your database.

Notes can be run on demand or can be scheduled to execute automatically at a specific time, or repeat based on a time interval.

Notes can be shared and query execution results can be embedded online.

#### Notebooks

Notebooks are collections of notes and are primarily used to organize things in a neat way. Notebooks helps group notes together and can also be nested within folders.

The **My notebook** tab is a default view that lists all your notebooks. The OTHER tab is used to view all shared notebooks owned by other users.

To create a new note:

Navigate to the Notebooks in the main menu.
Click Create Notebook to add a notebook to the root: Notebooks Create Icon or click the ellipsis menu next to the folder to put the notebook into, and click New Notebook.


Start here this https://github.com/kgshv/tmp-quix-docs/blob/master/documentation/src/content/docs/4.1___notebooks.md

then use this one - https://github.com/kgshv/tmp-quix-docs/blob/master/documentation/src/content/docs/4.2___notes.md

Consider talking about queries




#### Notes


### Reports
Start here (empty but will give an idea on general direction) https://github.com/kgshv/tmp-quix-docs/blob/master/documentation/src/content/docs/4.4___reports.md

Then incorporate this (`maybe move to examples?`):
https://github.com/kgshv/tmp-quix-docs/blob/master/documentation/src/content/docs/4.5___report_config.md



## Deploying in the cloud

Amazon aws?

Digital ocean?

----
## Questions
- Is there going to be an API avaliable?

`if yes, start here`: https://github.com/kgshv/tmp-quix-docs/blob/master/documentation/src/content/docs/5.1___api.md

-





## License
MIT
