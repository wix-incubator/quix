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