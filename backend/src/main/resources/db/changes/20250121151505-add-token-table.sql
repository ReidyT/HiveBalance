-- liquibase formatted sql

-- changeset ReidyT:1737562686070-1
CREATE TABLE token (token_id UUID NOT NULL, expire_at TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL, is_blacklisted BOOLEAN NOT NULL, parent_id UUID, type VARCHAR(255) NOT NULL, user_id UUID NOT NULL, CONSTRAINT "tokenPK" PRIMARY KEY (token_id));

-- changeset ReidyT:1737562686070-2
CREATE INDEX idx_token_expire_at ON token(expire_at);

-- changeset ReidyT:1737562686070-3
CREATE INDEX idx_token_parent_id ON token(parent_id);

-- changeset ReidyT:1737562686070-4
CREATE INDEX idx_token_user_id ON token(user_id);

