CREATE TABLE user_account (
    id serial primary key,
    google_id varchar(32),
    email varchar(128),
    name varchar(64),
    hashed_password bytea,
    salt bytea,
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE timer (
    timer_code varchar(4) primary key,
    timer_name varchar(50),
    create_time timestamp,
    start_time timestamp,
    user_id integer,
    timer_duration integer,
    timer_buffer integer,
    is_paused boolean default true,
    is_public boolean default true,
    rotating_background_color boolean default false,
    main_color char(7),
    secondary_color char(7),
    buffer_color char(7),
    visit_count integer default 0,
    last_visit_time timestamp default current_timestamp,
    time_elapsed bigint default 0 -- Time elapsed current round on pause
);