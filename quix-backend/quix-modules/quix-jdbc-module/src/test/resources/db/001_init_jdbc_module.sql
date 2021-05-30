create table empty_table
(
    col1 INTEGER NOT NULL
);

create table small_table
(
    col1 INTEGER NOT NULL
);

INSERT INTO small_table
values (1);

create table large_table
(
    col1 INTEGER NOT NULL
);

INSERT INTO large_table
values (1),
       (2),
       (3),
       (4),
       (5),
       (6),
       (7),
       (8),
       (9),
       (10);

create table wide_table
(
    col1  INTEGER NOT NULL,
    col2  INTEGER NOT NULL,
    col3  INTEGER NOT NULL,
    col4  INTEGER NOT NULL,
    col5  INTEGER NOT NULL,
    col6  INTEGER NOT NULL,
    col7  INTEGER NOT NULL,
    col8  INTEGER NOT NULL,
    col9  INTEGER NOT NULL,
    col10 INTEGER NOT NULL
);