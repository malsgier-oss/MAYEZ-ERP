-- Run this in Supabase SQL Editor if you use Process Return with unpaid/partial invoices.
-- Required for: reducing customer debt when items are returned from unpaid/partial invoices.

-- Add debt column if it doesn't exist (e.g. created by a view or trigger elsewhere)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'debt'
  ) THEN
    ALTER TABLE customers ADD COLUMN debt decimal(12,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
