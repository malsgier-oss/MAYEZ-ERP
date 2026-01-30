-- Run this in Supabase SQL Editor to support returns (refunded status)
-- Required for: Process Return feature (full return sets invoice status to 'refunded')

ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'refunded';
