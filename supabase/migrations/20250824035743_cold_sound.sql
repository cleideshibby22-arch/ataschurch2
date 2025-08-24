/*
  # Fix RLS policy for usuarios table INSERT

  1. Security
    - Drop existing conflicting policies
    - Create proper INSERT policy for authenticated users
    - Allow users to insert their own profile where auth.uid() = id
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can insert their own profile" ON usuarios;
DROP POLICY IF EXISTS "Usuário pode criar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Allow public INSERT during registration" ON usuarios;
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can read their own profile" ON usuarios;

-- Create the correct INSERT policy
CREATE POLICY "Enable INSERT access for authenticated users"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy for users to read their own data
CREATE POLICY "Enable SELECT access for own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create UPDATE policy for users to update their own data
CREATE POLICY "Enable UPDATE access for own data"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);