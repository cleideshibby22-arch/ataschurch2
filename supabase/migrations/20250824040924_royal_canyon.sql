/*
  # Fix RLS policies for unidades table

  1. Security Changes
    - Add INSERT policy for authenticated users to create units as owners
    - Ensure proper RLS policies for all operations
    - Allow users to create units where they are the proprietario_id

  2. Policy Details
    - INSERT: Users can create units where proprietario_id = auth.uid()
    - SELECT: Users can view units they have access to via usuario_unidades
    - UPDATE: Owners and admins can update their units
    - DELETE: Only owners can delete units
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Usuários podem criar suas próprias unidades" ON unidades;
DROP POLICY IF EXISTS "Proprietários podem gerenciar suas unidades" ON unidades;
DROP POLICY IF EXISTS "Administradores podem editar unidades" ON unidades;
DROP POLICY IF EXISTS "Usuários podem ver suas unidades" ON unidades;

-- Create comprehensive RLS policies for unidades table
CREATE POLICY "Users can create units as owners"
  ON unidades
  FOR INSERT
  TO authenticated
  WITH CHECK (proprietario_id = auth.uid());

CREATE POLICY "Users can view their units"
  ON unidades
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can update units"
  ON unidades
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND (
        uu.tipo IN ('proprietario', 'administrador')
        OR (uu.permissoes->>'gerenciarSistema')::boolean = true
      )
    )
  )
  WITH CHECK (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND (
        uu.tipo IN ('proprietario', 'administrador')
        OR (uu.permissoes->>'gerenciarSistema')::boolean = true
      )
    )
  );

CREATE POLICY "Owners can delete units"
  ON unidades
  FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND uu.tipo = 'proprietario'
    )
  );