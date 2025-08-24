/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - The `usuario_unidades` policies are causing infinite recursion
    - This happens when policies reference the same table they're protecting
    - The `uid()` function queries `usuario_unidades` which triggers the policy again

  2. Solution
    - Simplify policies to avoid self-referencing loops
    - Use direct user ID comparisons instead of complex joins
    - Remove circular dependencies between policies

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies
    - Ensure no policy references its own table in a recursive way
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Administradores podem gerenciar usuários da unidade" ON usuario_unidades;
DROP POLICY IF EXISTS "Administradores podem ver relações da unidade" ON usuario_unidades;
DROP POLICY IF EXISTS "Usuários podem ver suas relações" ON usuario_unidades;

-- Drop problematic policies on other tables that reference usuario_unidades
DROP POLICY IF EXISTS "Usuários podem ver atas baseado em permissões" ON atas;
DROP POLICY IF EXISTS "Usuários podem criar atas com permissão" ON atas;
DROP POLICY IF EXISTS "Usuários podem editar atas com permissão" ON atas;
DROP POLICY IF EXISTS "Usuários podem excluir atas com permissão" ON atas;

DROP POLICY IF EXISTS "Administradores podem ver usuários da unidade" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver suas unidades" ON unidades;
DROP POLICY IF EXISTS "Administradores podem editar unidades" ON unidades;
DROP POLICY IF EXISTS "Proprietários podem gerenciar suas unidades" ON unidades;

-- Create simplified policies for usuario_unidades (no self-reference)
CREATE POLICY "Usuários podem ver suas próprias relações"
  ON usuario_unidades
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias relações"
  ON usuario_unidades
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias relações"
  ON usuario_unidades
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários podem deletar suas próprias relações"
  ON usuario_unidades
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- Create simplified policies for usuarios
CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create simplified policies for unidades
CREATE POLICY "Usuários podem ver unidades onde participam"
  ON unidades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Proprietários podem gerenciar unidades"
  ON unidades
  FOR ALL
  TO authenticated
  USING (proprietario_id = auth.uid())
  WITH CHECK (proprietario_id = auth.uid());

-- Create simplified policies for atas (avoid complex joins)
CREATE POLICY "Usuários podem ver atas de suas unidades"
  ON atas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = atas.unidade_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar atas"
  ON atas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = atas.unidade_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem editar atas"
  ON atas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = atas.unidade_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = atas.unidade_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar atas"
  ON atas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = atas.unidade_id AND uu.usuario_id = auth.uid()
    )
  );

-- Create simplified policies for related tables
CREATE POLICY "Usuários podem gerenciar participantes"
  ON participantes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = participantes.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = participantes.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar assuntos"
  ON assuntos_discutidos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = assuntos_discutidos.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = assuntos_discutidos.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar decisões"
  ON decisoes_tomadas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = decisoes_tomadas.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = decisoes_tomadas.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar ações"
  ON acoes_designadas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = acoes_designadas.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = acoes_designadas.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar desobrigações"
  ON desobrigacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = desobrigacoes.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = desobrigacoes.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar confirmações"
  ON confirmacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = confirmacoes.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = confirmacoes.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar ordenações"
  ON ordenacoes_sacerdocio
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = ordenacoes_sacerdocio.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = ordenacoes_sacerdocio.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar bênçãos"
  ON bencao_criancas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = bencao_criancas.ata_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE a.id = bencao_criancas.ata_id AND uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar hinos personalizados"
  ON hinos_personalizados
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = hinos_personalizados.unidade_id AND uu.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario_unidades uu 
      WHERE uu.unidade_id = hinos_personalizados.unidade_id AND uu.usuario_id = auth.uid()
    )
  );