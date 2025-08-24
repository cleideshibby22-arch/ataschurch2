/*
  # Fix infinite recursion in usuario_unidades policies

  1. Problem
    - Current policies on usuario_unidades table are causing infinite recursion
    - The policies are referencing the same table they're protecting, creating circular dependencies

  2. Solution
    - Drop all existing policies on usuario_unidades
    - Create simple, non-recursive policies that only use auth.uid()
    - Avoid any self-referencing queries within the policies

  3. New Policies
    - Users can see their own relationships (simple auth.uid() check)
    - Users can update their own relationships (simple auth.uid() check)
    - No complex joins or subqueries that could cause recursion
*/

-- Drop all existing policies on usuario_unidades to start fresh
DROP POLICY IF EXISTS "Administradores podem gerenciar usuários da unidade" ON usuario_unidades;
DROP POLICY IF EXISTS "Administradores podem ver relações da unidade" ON usuario_unidades;
DROP POLICY IF EXISTS "Usuários podem ver suas relações" ON usuario_unidades;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own relationships"
  ON usuario_unidades
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can update their own relationships"
  ON usuario_unidades
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Allow administrators to manage users (but only for their own units)
-- This policy is safe because it doesn't reference usuario_unidades in the condition
CREATE POLICY "Unit owners can manage all relationships in their units"
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