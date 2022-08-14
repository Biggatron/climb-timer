CREATE TABLE climber (
    id serial primary key,
    name varchar(64) not null,
    dob date,
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE user_account (
    id serial primary key,
    google_id varchar(32),
    email varchar(128),
    name varchar(64),
    climber_id integer REFERENCES climber(id),
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE competition (
    id serial primary key,
    name varchar(64),
    date date,
    type varchar(10),
    description varchar(1024),
    parent_comp integer REFERENCES competition(id) ON DELETE CASCADE,
    owner_id integer REFERENCES user_account(id),
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE problem (
    id serial primary key,
    comp_id integer REFERENCES competition(id) ON DELETE CASCADE,
    category varchar(10),
    problem_name varchar(64),
    remark varchar(1024),
    problem_order integer,
    max_tries integer,
    time_limit integer,
    time_buffer integer,
    hold_count integer,
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE attempt (
    problem_id integer REFERENCES problem(id) ON DELETE CASCADE,
    climber_id integer REFERENCES climber(id) ON DELETE CASCADE,
    tries integer,
    top integer,
    bonus integer,
    max_hold integer,
    comment varchar(1024),
    UNIQUE(problem_id, climber_id),
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE moderator (
    comp_id integer NOT NULL REFERENCES competition(id),
    user_id integer NOT NULL REFERENCES user_account(id),
    UNIQUE(comp_id, user_id),
    create_timestamp timestamp,
    modify_timestamp timestamp
);

CREATE TABLE timer (
    timer_code varchar(4) primary key,
    create_timestamp timestamp,
    start_time timestamp,
    time_remaining_from_start time(3),
    user_id integer,
    timer_duration integer,
    timer_buffer integer,
    is_paused boolean,
    comp integer REFERENCES competition(id)
);

-- CREATE TABLE image (
--     id serial primary key,
--     name varchar(64),
--     original_name varchar(64),
--     file_type varchar(5),
--     description varchar(512),
--     xlarge_src varchar(256),
--     large_src varchar(256),
--     medium_src varchar(256),
--     small_src varchar(256),
--     preview_src varchar(256),
--     watermark_src varchar(256),
--     userid integer NOT NULL REFERENCES user_account(id) ON DELETE CASCADE
-- );

-- CREATE TABLE tag (
--     id serial primary key,
--     name varchar(32) NOT NULL,
--     loacation boolean NOT NULL default false
-- );

-- CREATE TABLE image_tag (
--     imageid integer NOT NULL REFERENCES image(id) ON DELETE CASCADE,
--     tagid integer NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
--     UNIQUE(imageid, tagid)
-- );