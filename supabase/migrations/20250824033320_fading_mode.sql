/*
  # Create RLS policies for usuarios table

  1. Security Policies
    - Allow users to insert their own profile during registration
    - Allow users to read their own profile data
    - Allow users to update their own profile data
    - Allow administrators to view users in their units

  2. Changes
    - Drop any existing conflicting policies
    - Create INSERT policy for user registration
    - Create SELECT policy for profile access
    - Create UPDATE policy for profile updates
    - Create SELECT policy for admin access
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can select their own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON usuarios;
DROP POLICY IF EXISTS "Administrators can view users in their units" ON usuarios;

-- Policy to allow users to insert their own profile during registration
CREATE POLICY "Usuário pode criar seu próprio perfil"
ON usuarios
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy to allow users to read their own profile
CREATE POLICY "Usuário pode ler seu próprio perfil"
ON usuarios
FOR SELECT
USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Usuário pode atualizar seu próprio perfil"
ON usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy to allow administrators to view users in their units
CREATE POLICY "Administradores podem ver usuários de suas unidades"
ON usuarios
FOR SELECT
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