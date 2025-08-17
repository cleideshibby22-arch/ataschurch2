/*
  # Add missing JSONB columns to atas table

  1. New Columns
    - `participantes` (jsonb) - Array of meeting participants
    - `assuntos_discutidos` (jsonb) - Array of discussed topics
    - `decisoes_tomadas` (jsonb) - Array of decisions made
    - `acoes_designadas` (jsonb) - Array of assigned actions
    - `desobrigacoes` (jsonb) - Array of releases/supports
    - `confirmacoes` (jsonb) - Array of confirmations
    - `ordenacoes_sacerdocio` (jsonb) - Array of priesthood ordinations
    - `bencao_criancas` (jsonb) - Array of child blessings

  2. Default Values
    - All new columns default to empty arrays to ensure consistency
*/

-- Add missing JSONB columns to atas table
DO $$
BEGIN
  -- Add participantes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'participantes'
  ) THEN
    ALTER TABLE atas ADD COLUMN participantes jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add assuntos_discutidos column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'assuntos_discutidos'
  ) THEN
    ALTER TABLE atas ADD COLUMN assuntos_discutidos jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add decisoes_tomadas column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'decisoes_tomadas'
  ) THEN
    ALTER TABLE atas ADD COLUMN decisoes_tomadas jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add acoes_designadas column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'acoes_designadas'
  ) THEN
    ALTER TABLE atas ADD COLUMN acoes_designadas jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add desobrigacoes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'desobrigacoes'
  ) THEN
    ALTER TABLE atas ADD COLUMN desobrigacoes jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add confirmacoes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'confirmacoes'
  ) THEN
    ALTER TABLE atas ADD COLUMN confirmacoes jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add ordenacoes_sacerdocio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'ordenacoes_sacerdocio'
  ) THEN
    ALTER TABLE atas ADD COLUMN ordenacoes_sacerdocio jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add bencao_criancas column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atas' AND column_name = 'bencao_criancas'
  ) THEN
    ALTER TABLE atas ADD COLUMN bencao_criancas jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;