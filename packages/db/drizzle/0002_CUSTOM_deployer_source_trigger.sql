-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION validate_token_deployer_source()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  deployer_table_name text;
  account_id text := NEW.deployer_account_id;
  sql text;
  exists_row boolean;
BEGIN
  IF NEW.deployer_account_type_id IS NULL THEN
    RAISE EXCEPTION 'deployer_account_type_id must not be null';
  END IF;

  IF account_id IS NULL OR account_id = '' THEN
    RAISE EXCEPTION 'deployer_account_id must be non-empty';
  END IF;

  -- Get the table name from the lookup table
  SELECT table_name INTO deployer_table_name
  FROM deployer_account_types
  WHERE id = NEW.deployer_account_type_id;

  IF deployer_table_name IS NULL THEN
    RAISE EXCEPTION 'Invalid deployer_account_type_id: %', NEW.deployer_account_type_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Ensure the table actually exists (in public schema)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
      AND c.relname = deployer_table_name
  ) THEN
    RAISE EXCEPTION 'Source table % does not exist in schema public', deployer_table_name
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Build query - cast id to text for comparison with text account_id
  sql := format(
    'SELECT EXISTS (SELECT 1 FROM %I WHERE id::text = $1)',
    deployer_table_name
  );

  -- Run and store result
  EXECUTE sql USING account_id INTO exists_row;

  -- Validate the row exists, otherwise throw an exception
  IF NOT exists_row THEN
    RAISE EXCEPTION 'No row found in %.id = %',
      deployer_table_name, account_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_token_deployer_source
BEFORE INSERT OR UPDATE OF deployer_account_type_id, deployer_account_id
ON tokens
FOR EACH ROW
EXECUTE FUNCTION validate_token_deployer_source();

-- Function to prevent deletion of account records that have deployed tokens
CREATE OR REPLACE FUNCTION prevent_account_deletion_with_tokens()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  token_count integer;
  account_type_id integer;
  account_type_name text;
BEGIN
  -- Get the account type info based on the table name
  SELECT id, name INTO account_type_id, account_type_name
  FROM deployer_account_types
  WHERE table_name = TG_TABLE_NAME;

  -- If no match found, raise an exception
  IF account_type_id IS NULL THEN
    RAISE EXCEPTION 'Unknown account table: %', TG_TABLE_NAME;
  END IF;

  -- Check if there are any tokens deployed by this account
  SELECT COUNT(*) INTO token_count
  FROM tokens
  WHERE deployer_account_type_id = account_type_id
    AND deployer_account_id = OLD.id::text;

  -- If tokens exist, prevent deletion
  IF token_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete % account with id % because it has % deployed token(s). Delete tokens first.',
      account_type_name, OLD.id, token_count
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN OLD;
END;
$$;

-- Create triggers for each account type table
CREATE TRIGGER trg_prevent_farcaster_account_deletion
BEFORE DELETE ON farcaster_accounts
FOR EACH ROW
EXECUTE FUNCTION prevent_account_deletion_with_tokens();

CREATE TRIGGER trg_prevent_wallet_deletion
BEFORE DELETE ON wallets
FOR EACH ROW
EXECUTE FUNCTION prevent_account_deletion_with_tokens();

CREATE TRIGGER trg_prevent_x_account_deletion
BEFORE DELETE ON x_accounts
FOR EACH ROW
EXECUTE FUNCTION prevent_account_deletion_with_tokens();
