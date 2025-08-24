/*
  # Fix RLS policies for usuarios table

  1. Security Changes
    - Drop existing restrictive policies on usuarios table
    - Create new policies that allow users to manage their own data
    - Allow INSERT for new user registration
    - Allow SELECT for users to read their own profile
    - Allow UPDATE for users to modify their own profile

  2. Policy Details
    - INSERT policy: Allows creating user profile where auth.uid() matches the user id
    - SELECT policy: Allows users to read their own profile data
    - UPDATE policy: Allows users to update their own profile
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Administradores podem ver usuários da unidade" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;

-- Create new policies for usuarios table
CREATE POLICY "Users can insert their own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select their own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow administrators to view users in their units
CREATE POLICY "Administrators can view users in their units"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT uu1.usuario_id
      FROM usuario_unidades uu1
      WHERE uu1.unidade_id IN (
        SELECT uu2.unidade_id
        FROM usuario_unidades uu2
        WHERE uu2.usuario_id = auth.uid()
          AND (uu2.tipo IN ('administrador', 'proprietario') 
               OR (uu2.permissoes->>'gerenciarUsuarios')::boolean = true)
      )
    )
  );