/*
  # Fix RLS policy for usuarios table registration

  1. Security Changes
    - Drop existing restrictive INSERT policies
    - Create new policy allowing public INSERT during registration
    - Maintain SELECT policy for authenticated users

  This allows users to create their profile during the Supabase Auth signup process,
  when they are not yet fully authenticated but need to insert their profile data.
*/

-- Drop existing INSERT policies that might be too restrictive
DROP POLICY IF EXISTS "Usuário pode criar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuário pode criar o próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Users can insert their own profile" ON usuarios;

-- Create policy allowing public INSERT during registration
CREATE POLICY "Allow public INSERT during registration"
  ON usuarios
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure SELECT policy exists for authenticated users
DROP POLICY IF EXISTS "Usuário pode ler seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuário pode ver seu próprio perfil" ON usuarios;

CREATE POLICY "Users can read their own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure UPDATE policy exists for authenticated users
DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON usuarios;

CREATE POLICY "Users can update their own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);