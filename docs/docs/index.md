---
id: formatting
title: Quix Docs
sidebar_label: Quix Docs Home - Formatting Boilerplate
---

{%seo%}

FREE HTML


# Formatting

> \**italic*\*, \*\***bold**\*\*, ~~underscore~~

*italic*, **bold**, ~~underscore~~

## Lists

> Note: Empty line is necessary between the lists and sublists. 

1. ...
2. ...
3. ...

* ...
* ...
* ...

  * ...
  * ...
  * ...

    + ...
    + ...
    + ...

## Dividers

> ----, ****, ___

----
****
___

# Building Table of Contents

Use Markdown TOC extension to insert and update table of contents. Result looks as good as the hand-made one, but it'll save you a bit of time and focus efforts.

<!-- TOC -->

- [Formatting](#formatting)
    - [Lists](#lists)
    - [Dividers](#dividers)
- [Building Table of Contents](#building-table-of-contents)
- [Header h1](#header-h1)
    - [Header h2](#header-h2)
        - [Header h3](#header-h3)
            - [Header h4](#header-h4)
                - [Header h5](#header-h5)
                    - [Header h6](#header-h6)
- [Header h1 (the next one)](#header-h1-the-next-one)
- [Known limitations (h1)](#known-limitations-h1)
- [Include images](#include-images)
- [Expandable text](#expandable-text)
- [Notes, tips, and warnings](#notes-tips-and-warnings)
- [Code samples](#code-samples)
    - [By lang](#by-lang)
    - [Tables](#tables)
    - [Tip](#tip)
- [Links](#links)
- [Embed videos](#embed-videos)

<!-- /TOC -->

Sample headers: 

# Header h1

## Header h2

### Header h3

#### Header h4

##### Header h5

###### Header h6

# Header h1 (the next one)

> Note that headers in the same file must be unique. 

text

# Known limitations (h1)

* Header text must be unique in the doc/proj?

# Include images



# Expandable text

<details>
<summary><b>To expand the detailed steps, click here...</b></summary>
Expanded detailed steps... 
</details>

# Notes, tips, and warnings

# Code samples

``` 

code
sample

code
sample

```

## By lang

**TODO**: find a plugin that enables highlighting the line!

js

```js{3}
import React from 'react';

import style.css;
import random_file.css;

```

bash {4} highlights the 4th line

```bash{3}
cd ~/
cat index.html
echo "import React from 'react';"
import React from 'react';
```

**Todo**: add more langs here

## Tables

| Header   | Header    | Header |
| -------- |:---------:| ------:|
| The text is left      | centered | Right- |
| -aligned by     | text      |   aligned |
| default |       |    text |

## Tip

Pre-pend the text with > to highlight it as a tip:

    >Tip
    >
    >This is a tip long tip: <Lorem ipsum ...>
    >
    >Separate paragraphs with an empty line.

Preview:

>Tip
>
>This is a long tip: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac euismod odio, eu consequat dui. Nullam molestie consectetur risus id imperdiet. Proin sodales ornare turpis, non mollis massa ultricies id. Nam at nibh scelerisque, feugiat ante non, dapibus tortor. Vivamus volutpat diam quis tellus elementum bibendum. Praesent semper gravida velit quis aliquam. Etiam in cursus neque. Nam lectus ligula, malesuada et mauris a, bibendum faucibus mi. Phasellus ut interdum felis. Phasellus in odio pulvinar, porttitor urna eget, fringilla lectus. Aliquam sollicitudin est eros. Mauris consectetur quam vitae mauris interdum hendrerit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
>
>Separate paragraphs with an empty line.

# Links



# Embed videos

Note: GitHub viewer does not support iframes. However, Docusaurus-based swebsite does. You can embed the video via the plain html with no leading spaces. 

    HTML code that renders the video is: <iframe width="560" height="315" src="https://www.youtube.com/embed/Jx7L_2VkfR4" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/Jx7L_2VkfR4" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
