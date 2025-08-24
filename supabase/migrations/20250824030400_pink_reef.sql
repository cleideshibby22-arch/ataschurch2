/*
  # Fix infinite recursion in usuario_unidades policies

  1. Temporarily disable RLS on usuario_unidades
  2. Drop all existing policies
  3. Re-enable RLS with minimal, safe policies
  4. Ensure no circular references or complex joins
*/

-- Temporarily disable RLS to clear all policies
ALTER TABLE usuario_unidades DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on usuario_unidades
DROP POLICY IF EXISTS "Users can view their own relationships" ON usuario_unidades;
DROP POLICY IF EXISTS "Users can update their own relationships" ON usuario_unidades;
DROP POLICY IF EXISTS "Unit owners can manage all relationships in their units" ON usuario_unidades;
DROP POLICY IF EXISTS "Proprietários podem gerenciar relacionamentos da unidade" ON usuario_unidades;
DROP POLICY IF EXISTS "Usuários podem ver seus relacionamentos" ON usuario_unidades;
DROP POLICY IF EXISTS "Usuários podem atualizar seus relacionamentos" ON usuario_unidades;

-- Re-enable RLS
ALTER TABLE usuario_unidades ENABLE ROW LEVEL SECURITY;

-- Create the most basic policies possible to avoid recursion
CREATE POLICY "Basic user access"
  ON usuario_unidades
  FOR ALL
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Create a separate policy for unit owners using direct table lookup
CREATE POLICY "Unit owner access"
  ON usuario_unidades
  FOR ALL
  TO authenticated
  USING (
    unidade_id IN (
      SELECT id FROM unidades WHERE proprietario_id = auth.uid()
    )
  )
  WITH CHECK (
    unidade_id IN (
      SELECT id FROM unidades WHERE proprietario_id = auth.uid()
    )
  );