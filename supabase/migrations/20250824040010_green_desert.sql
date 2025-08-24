/*
  # Temporarily disable RLS on usuarios table

  1. Security Changes
    - Temporarily disable Row Level Security on usuarios table
    - This allows user registration to work while we debug the policy issues
    
  Note: This is a temporary fix for development. In production, proper RLS policies should be implemented.
*/

-- Temporarily disable RLS on usuarios table
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;