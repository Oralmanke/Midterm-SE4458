#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 -U postgres <<-EOSQL
    CREATE USER midterm WITH password '12345678';
    CREATE DATABASE midterm OWNER midterm;
    GRANT ALL PRIVILEGES ON DATABASE "midterm" TO midterm; 
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO midterm;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO midterm;
    GRANT USAGE ON SCHEMA public TO midterm;
    ALTER USER midterm WITH SUPERUSER;
EOSQL

psql -v ON_ERROR_STOP=1 -U postgres --dbname midterm <<-EOSQL

    CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        phone_number VARCHAR(20),
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );


    CREATE TABLE listings (
        listing_id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        price_per_night DECIMAL(10, 2),
        address VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE reservations (
        reservation_id SERIAL PRIMARY KEY,
        user_id INT,
        listing_id INT,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
        start_date DATE,
        end_date DATE,
        guests INT,
        total_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

EOSQL

