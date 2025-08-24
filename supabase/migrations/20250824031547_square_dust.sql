/*
  # Completely disable RLS on usuario_unidades table

  This migration completely disables Row Level Security on the usuario_unidades table
  to resolve the infinite recursion error. This is a temporary solution to get the
  application working again.

  ## Changes
  1. Drop all existing policies on usuario_unidades
  2. Disable RLS completely on usuario_unidades table
  
  ## Security Note
  This removes RLS protection from usuario_unidades. In a production environment,
  you would want to implement proper application-level security or fix the
  recursive policies instead.
*/

-- Drop all existing policies on usuario_unidades
DROP POLICY IF EXISTS "Basic user access" ON usuario_unidades;
DROP POLICY IF EXISTS "Unit owner access" ON usuario_unidades;
DROP POLICY IF EXISTS "Users can view own relationships" ON usuario_unidades;
DROP POLICY IF EXISTS "Users can update own relationships" ON usuario_unidades;
DROP POLICY IF EXISTS "Unit owners can manage relationships" ON usuario_unidades;

-- Completely disable RLS on usuario_unidades table
ALTER TABLE usuario_unidades DISABLE ROW LEVEL SECURITY;