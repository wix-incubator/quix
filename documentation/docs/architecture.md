---
id: architecture
title: Architecture
sidebar_label: Architecture
---

![](assets/architecture.png)

Quix consists of three main elements:

* Frontend to serve UI and manage notebooks
* Backend to communicate with Presto
* DB for storing notebooks

Each component is run in a separate Docker container, and all of them are managed by a single Docker Compose configuration.

There's also a fourth Docker container provided with this repository running Presto inside Docker Compose, but it's for demonstration purposes only.