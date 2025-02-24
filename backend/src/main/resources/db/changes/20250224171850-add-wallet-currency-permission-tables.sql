-- liquibase formatted sql

-- changeset ReidyT:1740413957089-1
CREATE TABLE currency (code VARCHAR(5) NOT NULL, symbol VARCHAR(5) NOT NULL, CONSTRAINT "currencyPK" PRIMARY KEY (code));

-- changeset ReidyT:1740413957089-2
CREATE TABLE permission (user_id UUID NOT NULL, wallet_id UUID NOT NULL, created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL, permission VARCHAR(10) NOT NULL, CONSTRAINT "permissionPK" PRIMARY KEY (user_id, wallet_id));

-- changeset ReidyT:1740413957089-3
CREATE TABLE wallet (id UUID NOT NULL, name VARCHAR(30) NOT NULL, currency_code VARCHAR(5) NOT NULL, created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL, CONSTRAINT "walletPK" PRIMARY KEY (id));

-- changeset ReidyT:1740413957089-4
ALTER TABLE currency ADD CONSTRAINT UC_CURRENCYSYMBOL_COL UNIQUE (symbol);

-- changeset ReidyT:1740413957089-5
CREATE INDEX idx_permission_user ON permission(user_id);

-- changeset ReidyT:1740413957089-6
CREATE INDEX idx_permission_wallet ON permission(wallet_id);

-- changeset ReidyT:1740413957089-7
CREATE INDEX idx_wallet_currency ON wallet(currency_code);

-- changeset ReidyT:1740413957089-8
CREATE INDEX idx_wallet_name ON wallet(name);

-- changeset ReidyT:1740413957089-9
ALTER TABLE permission ADD CONSTRAINT "fk_permission_wallet_id" FOREIGN KEY (wallet_id) REFERENCES wallet (id);

-- changeset ReidyT:1740413957089-10
ALTER TABLE permission ADD CONSTRAINT "fk_permission_user_id" FOREIGN KEY (user_id) REFERENCES bee_user (id);

-- changeset ReidyT:1740413957089-11
ALTER TABLE wallet ADD CONSTRAINT "fk_wallet_currency_code" FOREIGN KEY (currency_code) REFERENCES currency (code);

