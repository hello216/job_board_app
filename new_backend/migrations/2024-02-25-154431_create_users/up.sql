CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  status VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  company VARCHAR,
  url VARCHAR NOT NULL,
  location VARCHAR,
  date_submitted VARCHAR NOT NULL,
  note VARCHAR,
  created_at VARCHAR NOT NULL,
  updated_at VARCHAR NOT NULL
)
