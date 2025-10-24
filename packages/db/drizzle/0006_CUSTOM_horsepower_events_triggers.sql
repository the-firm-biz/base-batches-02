-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION validate_horsepower_recipient_source()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  horsepower_recipient_table_name text;
  account_id text := NEW.recipient_account_id;
  sql text;
  exists_row boolean;
BEGIN
  IF NEW.recipient_account_type_id IS NULL THEN
    RAISE EXCEPTION 'recipient_account_type_id must not be null';
  END IF;

  IF account_id IS NULL OR account_id = '' THEN
    RAISE EXCEPTION 'recipient_account_id must be non-empty';
  END IF;

  -- Get the table name from the lookup table
  SELECT table_name INTO horsepower_recipient_table_name
  FROM horsepower_recipient_account_types
  WHERE id = NEW.recipient_account_type_id;

  IF horsepower_recipient_table_name IS NULL THEN
    RAISE EXCEPTION 'Invalid recipient_account_type_id: %', NEW.recipient_account_type_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Ensure the table actually exists (in public schema)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
      AND c.relname = horsepower_recipient_table_name
  ) THEN
    RAISE EXCEPTION 'Source table % does not exist in schema public', horsepower_recipient_table_name
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Build query - cast id to text for comparison with text account_id
  sql := format(
    'SELECT EXISTS (SELECT 1 FROM %I WHERE id::text = $1)',
    horsepower_recipient_table_name
  );

  -- Run and store result
  EXECUTE sql USING account_id INTO exists_row;

  -- Validate the row exists, otherwise throw an exception
  IF NOT exists_row THEN
    RAISE EXCEPTION 'No row found in %.id = %',
      horsepower_recipient_table_name, account_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_horsepower_recipient_source
BEFORE INSERT OR UPDATE OF recipient_account_type_id, recipient_account_id
ON horsepower_events
FOR EACH ROW
EXECUTE FUNCTION validate_horsepower_recipient_source();

-- Function to prevent deletion of account records that have been awarded horsepower
CREATE OR REPLACE FUNCTION prevent_account_deletion_with_horsepower()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  horse_power_events_count integer;
  account_type_id integer;
BEGIN
  -- Get the account type info based on the table name
  SELECT id INTO account_type_id
  FROM horsepower_recipient_account_types
  WHERE table_name = TG_TABLE_NAME;

  -- If no match found, raise an exception
  IF account_type_id IS NULL THEN
    RAISE EXCEPTION 'Unknown account table: %', TG_TABLE_NAME;
  END IF;

  -- Check if there are is any horse power awarded events for this account
  SELECT COUNT(*) INTO horse_power_events_count
  FROM horsepower_events
  WHERE recipient_account_type_id = account_type_id
    AND recipient_account_id = OLD.id::text;

  -- If events exist, prevent deletion
  IF horse_power_events_count > 0 THEN
    RAISE EXCEPTION 'Cannot delete % account with id % because it has % horsepower events. Delete horsepower events first.',
      TG_TABLE_NAME, OLD.id, horse_power_events_count
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN OLD;
END;
$$;

-- Create triggers for each account type table
CREATE TRIGGER trg_prevent_farcaster_account_deletion_with_horsepower_conflict
BEFORE DELETE ON farcaster_accounts
FOR EACH ROW
EXECUTE FUNCTION prevent_account_deletion_with_horsepower();

CREATE TRIGGER trg_prevent_wallet_deletion_with_horsepower_conflict
BEFORE DELETE ON wallets
FOR EACH ROW
EXECUTE FUNCTION prevent_account_deletion_with_horsepower();

CREATE OR REPLACE FUNCTION calculate_horsepower_running_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  previous_total integer;
BEGIN
  -- Get the most recent newHorsePowerTotal for this recipient
  SELECT new_horse_power_total INTO previous_total
  FROM horsepower_events
  WHERE recipient_account_id = NEW.recipient_account_id
  ORDER BY id DESC
  LIMIT 1;
  
  -- If no previous record, start from 0
  IF previous_total IS NULL THEN
    previous_total := 0;
  END IF;
  
  -- Set the new running total
  NEW.new_horse_power_total := previous_total + NEW.horse_power_awarded;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calculate_horsepower_running_total
BEFORE INSERT ON horsepower_events
FOR EACH ROW
EXECUTE FUNCTION calculate_horsepower_running_total();