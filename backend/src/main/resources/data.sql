-- Add some currency
INSERT INTO currency (code, symbol) VALUES ('USD', '$') ON CONFLICT (code) DO NOTHING;
INSERT INTO currency (code, symbol) VALUES ('EUR', '€') ON CONFLICT (code) DO NOTHING;
INSERT INTO currency (code, symbol) VALUES ('GBP', '£') ON CONFLICT (code) DO NOTHING;
INSERT INTO currency (code, symbol) VALUES ('CHF', 'CHF') ON CONFLICT (code) DO NOTHING;