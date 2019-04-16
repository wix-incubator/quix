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
