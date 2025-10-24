-- Custom SQL migration file, put your code below! --

-- Seed horsepower_recipient_account_types table
INSERT INTO horsepower_recipient_account_types (id, table_name) VALUES
  (1, 'farcaster_accounts'),
  (2, 'wallets')
ON CONFLICT DO NOTHING;