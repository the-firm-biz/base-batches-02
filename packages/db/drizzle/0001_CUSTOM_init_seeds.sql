-- Custom SQL migration file, put your code below! --

-- Seed verification_sources table
INSERT INTO verification_sources (id, name) VALUES
  (1, 'Farcaster'),
  (2, 'WireTap'),
  (3, 'Privy')
ON CONFLICT DO NOTHING;

-- Seed deployer_account_types table
INSERT INTO deployer_account_types (id, name, table_name) VALUES
  (1, 'farcaster', 'farcaster_accounts'),
  (2, 'wallet', 'wallets'),
  (3, 'x', 'x_accounts')
ON CONFLICT DO NOTHING;

-- Seed uniswap_versions table
INSERT INTO uniswap_versions (id, name) VALUES
  (1, 'v3'),
  (2, 'v4')
ON CONFLICT DO NOTHING;

-- Seed currencies table
INSERT INTO currencies (address, name, symbol, decimals) VALUES
  ('0x4200000000000000000000000000000000000006', 'Wrapped Ether', 'WETH', 18)
ON CONFLICT DO NOTHING;

-- Seed employee_departments table
INSERT INTO employee_departments (id, name) VALUES
  (1, 'Precarious Asset Bundling'),
  (2, 'Mergers & Appropriations'),
  (3, 'Synergy'),
  (4, 'Investment Post-Rationalization'),
  (5, 'Consolidated Diversifications'),
  (6, 'Manifest Fulfillment'),
  (7, 'Infinite Yield Solutions'),
  (8, 'Global Opportunity Calibration'),
  (9, 'Speculative Minerals'),
  (10, 'High-Frequency Market Penetration')
ON CONFLICT DO NOTHING;

-- Seed employee_cohorts table
INSERT INTO employee_cohorts (id, name) VALUES
  (1, '1')
ON CONFLICT DO NOTHING;

-- Seed horsepower_event_sources table
INSERT INTO horsepower_event_sources (id, name) VALUES
  (1, 'completeAddAppToFarcaster'),
  (2, 'completeEOnboarding'),
  (3, 'completeGreetColleagues'),
  (4, 'channelBehavior')
ON CONFLICT DO NOTHING;