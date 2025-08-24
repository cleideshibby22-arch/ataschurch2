/*
  # Fix RLS policy for unidades table INSERT

  1. Security Changes
    - Add INSERT policy for unidades table
    - Allow authenticated users to create units where they are the proprietario_id
    - Ensure proper security with auth.uid() check

  2. Changes Made
    - Create policy "Usuários podem criar suas próprias unidades"
    - Policy allows INSERT for authenticated users
    - WITH CHECK ensures proprietario_id matches auth.uid()
*/

-- Create INSERT policy for unidades table
CREATE POLICY "Usuários podem criar suas próprias unidades"
  ON unidades
  FOR INSERT
  TO authenticated
  WITH CHECK (proprietario_id = auth.uid());