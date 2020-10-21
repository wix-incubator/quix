---
title: First release
author: Quix Team
---
Quix is a notebook manager that focuses on ease of use and shareability.  
It aims to be a shared space for your company's BI insights and know-how.

Since the official announcement this summer and following the requests from our first users we added support for more data sources (Athena, BigQuery, JDBC), tweaked the visualizations, fixed bugs and improved the documentation.

If you're in the market for an intuitive and fast tool to query and share your data, give Quix a try:
* [Online demo](https://quix-demo.io/)
* Quick start
```bash
mkdir quix && cd quix
curl https://raw.githubusercontent.com/wix/quix/master/docker-compose.prebuilt.yml -o docker-compose.yml
curl https://raw.githubusercontent.com/wix/quix/master/env-example -o .env
docker-compose up
```
* [Full installation](https://wix.github.io/quix/docs/installation)

### Here's what's available in our first release:

#### Notebook/note management with multi-user support
* Shareable folders/notebooks/notes
* Favorite notebooks
* Full-text note search across all users
* Readonly access to the notebooks of all users

#### Query editor
* Multiple statements
* Syntax highlighting
* Live syntax validation and autocompletion (currently for Presto only)
* Keyboard shortcuts
* Typed parameters (String, Boolean, Number, Date, Option, List)
* Export results as CSV

#### One-click visualizations
* Timeline chart
* Bar chart
* Pie chart

#### DB types you can query
* Presto (supports live syntax validation and basic autocompletion)
* Amazon Athena
* Google BigQuery
* Generic JDBC (MySQL, PostgreSQL, SQL Server, ClickHouse, etc...)

#### DB Explorer
* Navigate, search and preview your catalogs and tables

#### What's in the pipeline?
* Python note
* More SSO options (OpenID)
* More visualizations
* Note embedding
* Scheduled queries
* Public queries
* SDK for extending the base functionality of Quix

#### Contributors
@frolovv, @sthuck, @antonpod, @ittaym, @yaarams, @stas-slu, @shl3vi, @amitmarx, @kgshv, @erezr
