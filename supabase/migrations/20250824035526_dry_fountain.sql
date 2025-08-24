/*
  # Fix RLS policy for usuarios table registration

  1. Security Changes
    - Temporarily disable RLS on usuarios table
    - Create proper INSERT policy for authenticated users
    - Re-enable RLS with correct policies
    
  2. Policy Details
    - Allow authenticated users to insert their own profile
    - Allow users to read their own data
    - Allow users to update their own profile
    - Allow admins to view users in their units
*/

-- Temporarily disable RLS to clear existing policies
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON usuarios;
DROP POLICY IF EXISTS "Usuário pode deletar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem ver usuários de suas unidades" ON usuarios;
DROP POLICY IF EXISTS "Allow public INSERT during registration" ON usuarios;
DROP POLICY IF EXISTS "Usuário pode criar seu próprio perfil" ON usuarios;

-- Re-enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for authenticated users
CREATE POLICY "Users can insert their own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create SELECT policy for users to read their own data
CREATE POLICY "Users can read own profile"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create UPDATE policy for users to update their own data
CREATE POLICY "Users can update their own profile"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create DELETE policy for users to delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON usuarios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create SELECT policy for admins to view users in their units
CREATE POLICY "Admins can view users in their units"
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
        AND (
          uu2.tipo = ANY(ARRAY['administrador'::text, 'proprietario'::text])
          OR ((uu2.permissoes->>'gerenciarUsuarios')::boolean = true)
        )
      )
    )
  );