/*
  # Fix RLS policy for usuarios table INSERT operation

  1. Security Changes
    - Drop existing restrictive INSERT policy
    - Create new policy allowing authenticated users to insert their own profile
    - Policy checks that the user ID matches the authenticated user ID

  This fixes the registration error where new users cannot create their profile.
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON usuarios;

-- Create new INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "Allow authenticated users to insert own profile"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);