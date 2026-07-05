CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  github_id VARCHAR(255) UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(255),
  provider_id VARCHAR(255),
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  bio TEXT,
  role VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT uk_users_provider_provider_id UNIQUE (provider, provider_id)
);

CREATE INDEX idx_users_provider_lookup ON users (provider, provider_id);
CREATE INDEX idx_users_email ON users (email);

CREATE TABLE repositories (
  id BIGSERIAL PRIMARY KEY,
  github_repo_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  full_name VARCHAR(255),
  description TEXT,
  language VARCHAR(255),
  stars INTEGER,
  forks INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE contributions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  repository_id BIGINT NOT NULL REFERENCES repositories(id),
  commit_count INTEGER,
  pr_count INTEGER,
  issue_count INTEGER,
  last_contribution_date TIMESTAMP
);

CREATE TABLE pull_requests (
  id BIGSERIAL PRIMARY KEY,
  github_pr_id VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  repository_id BIGINT NOT NULL REFERENCES repositories(id),
  title VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  merged_at TIMESTAMP
);

CREATE TABLE issues (
  id BIGSERIAL PRIMARY KEY,
  github_issue_id VARCHAR(255) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  repository_id BIGINT NOT NULL REFERENCES repositories(id),
  title VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  type VARCHAR(50),
  message VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP
);

CREATE TABLE analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
  total_commits INTEGER,
  consistency_score DOUBLE PRECISION,
  top_languages_json TEXT,
  updated_at TIMESTAMP
);
