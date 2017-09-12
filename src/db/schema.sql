DROP TABLE IF EXISTS albums;
CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_pic_url VARCHAR DEFAULT 'http://data.whicdn.com/images/85417481/large.jpg'
);

DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  album_id INTEGER,
  user_id INTEGER,
  FOREIGN KEY (album_id) REFERENCES albums (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  content VARCHAR NOT NULL,
  created_at TIMESTAMP
);
