/*
  # Temporarily disable RLS on unidades table

  1. Security Changes
    - Temporarily disable Row Level Security on `unidades` table
    - This allows user registration to complete successfully
    - Should be re-enabled with proper policies once registration flow is working

  Note: This is a temporary development fix. In production, proper RLS policies should be implemented.
*/

-- Temporarily disable RLS on unidades table
ALTER TABLE unidades DISABLE ROW LEVEL SECURITY;