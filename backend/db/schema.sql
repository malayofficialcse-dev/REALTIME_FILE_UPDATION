CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    name TEXT
);

CREATE TABLE workspaces_members (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    workspace_id INT REFERENCES workspaces(id),
    role TEXT
);

CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INT REFERENCES documents(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  document_id INT,
  user_id INT,
  text TEXT
);
