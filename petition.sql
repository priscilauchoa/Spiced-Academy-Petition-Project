DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles CASCADE;


CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first           VARCHAR(255) NOT NULL CHECK (first != ''),
    last            VARCHAR(255) NOT NULL CHECK (last != ''),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature   TEXT 
);
    -- signature   TEXT NOT NULL CHECK (signature != '')



-- ambigous quando as duas tabelas tem o mesmo nome  vc precisa ser mais clara por exemplo: singers.id (coluna id na tabela singers)

CREATE TABLE user_profiles(
id SERIAL PRIMARY KEY,
age INT,
city VARCHAR(255),
url VARCHAR(255),
user_id INT NOT NULL REFERENCES users(id)
);