-- liquibase formatted sql

-- changeset ReidyT:1740396132565-1
CREATE TABLE currency (code VARCHAR(5) NOT NULL, symbol VARCHAR(5) NOT NULL, CONSTRAINT "currencyPK" PRIMARY KEY (code));

-- changeset ReidyT:1740396132565-2
CREATE TABLE permission (user_id UUID NOT NULL, wallet_id UUID NOT NULL, created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL, permission VARCHAR(10) NOT NULL, CONSTRAINT "permissionPK" PRIMARY KEY (user_id, wallet_id));

-- changeset ReidyT:1740396132565-3
CREATE TABLE wallet (id UUID NOT NULL, name VARCHAR(30) NOT NULL, currency_code VARCHAR(5) NOT NULL, CONSTRAINT "walletPK" PRIMARY KEY (id));

-- changeset ReidyT:1740396132565-4
ALTER TABLE currency ADD CONSTRAINT UC_CURRENCYSYMBOL_COL UNIQUE (symbol);

-- changeset ReidyT:1740396132565-5
ALTER TABLE wallet ADD CONSTRAINT UC_WALLETNAME_COL UNIQUE (name);

-- changeset ReidyT:1740396132565-6
CREATE INDEX idx_permission_user ON permission(user_id);

-- changeset ReidyT:1740396132565-7
CREATE INDEX idx_permission_wallet ON permission(wallet_id);

-- changeset ReidyT:1740396132565-8
CREATE INDEX idx_wallet_currency ON wallet(currency_code);

-- changeset ReidyT:1740396132565-9
ALTER TABLE permission ADD CONSTRAINT "fk_permission_wallet_id" FOREIGN KEY (wallet_id) REFERENCES wallet (id);

-- changeset ReidyT:1740396132565-10
ALTER TABLE wallet ADD CONSTRAINT "fk_wallet_currency_code" FOREIGN KEY (currency_code) REFERENCES currency (code);

-- changeset ReidyT:1740396132565-11
ALTER TABLE permission ADD CONSTRAINT "fk_permission_user_id" FOREIGN KEY (user_id) REFERENCES bee_user (id);

