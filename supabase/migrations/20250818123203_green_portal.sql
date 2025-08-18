/*
  # Corrigir configurações de RLS e políticas

  1. Habilitar RLS nas tabelas que precisam
  2. Corrigir políticas de acesso
  3. Garantir que o sistema funcione corretamente

  ## Tabelas afetadas:
  - usuarios: Habilitar RLS
  - unidades: Habilitar RLS  
  - atas: Habilitar RLS
  - Outras tabelas relacionadas

  ## Políticas:
  - Usuários podem ver e editar seus próprios dados
  - Usuários podem ver dados das unidades que têm acesso
  - Políticas baseadas em relacionamento usuario_unidades
*/

-- Habilitar RLS nas tabelas principais
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela usuarios
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;

CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Política para permitir inserção de novos usuários (para cadastro)
CREATE POLICY "Permitir inserção de novos usuários"
  ON usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para tabela unidades
DROP POLICY IF EXISTS "Usuários podem ver suas unidades" ON unidades;
DROP POLICY IF EXISTS "Administradores podem gerenciar unidades" ON unidades;

CREATE POLICY "Usuários podem ver suas unidades"
  ON unidades
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT unidade_id 
    FROM usuario_unidades 
    WHERE usuario_id = auth.uid()
  ));

CREATE POLICY "Administradores podem gerenciar unidades"
  ON unidades
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM usuario_unidades 
    WHERE usuario_id = auth.uid() 
    AND unidade_id = unidades.id 
    AND tipo IN ('administrador', 'proprietario')
  ));

-- Políticas para tabela atas
DROP POLICY IF EXISTS "Usuários podem ver atas da sua unidade" ON atas;
DROP POLICY IF EXISTS "Usuários podem criar atas" ON atas;
DROP POLICY IF EXISTS "Usuários podem editar atas" ON atas;
DROP POLICY IF EXISTS "Usuários podem excluir atas" ON atas;

CREATE POLICY "Usuários podem ver atas da sua unidade"
  ON atas
  FOR SELECT
  TO authenticated
  USING (unidade_id IN (
    SELECT uu.unidade_id
    FROM usuario_unidades uu
    WHERE uu.usuario_id = auth.uid()
    AND (
      uu.tipo IN ('administrador', 'proprietario')
      OR (uu.permissoes->>'verTodasAtas')::boolean = true
      OR (
        (uu.permissoes->>'verAtasPorChamado')::boolean = true
        AND (
          uu.chamado IS NULL 
          OR atas.tipo = 'sacramental'
          OR (
            (uu.chamado = 'bispado' AND atas.tipo IN ('bispado', 'conselho-ala'))
            OR (uu.chamado = 'mocas' AND atas.tipo = 'presidencia-mocas')
            OR (uu.chamado = 'sociedade-socorro' AND atas.tipo = 'presidencia-sociedade-socorro')
            OR (uu.chamado = 'primaria' AND atas.tipo = 'presidencia-primaria')
            OR (uu.chamado = 'rapazes' AND atas.tipo = 'presidencia-rapazes')
            OR (uu.chamado = 'escola-dominical' AND atas.tipo = 'presidencia-escola-dominical')
            OR (uu.chamado = 'correlacao' AND atas.tipo = 'correlacao')
          )
        )
      )
    )
  ));

CREATE POLICY "Usuários podem criar atas"
  ON atas
  FOR INSERT
  TO authenticated
  WITH CHECK (unidade_id IN (
    SELECT uu.unidade_id
    FROM usuario_unidades uu
    WHERE uu.usuario_id = auth.uid()
    AND (uu.permissoes->>'criarAta')::boolean = true
  ));

CREATE POLICY "Usuários podem editar atas"
  ON atas
  FOR UPDATE
  TO authenticated
  USING (unidade_id IN (
    SELECT uu.unidade_id
    FROM usuario_unidades uu
    WHERE uu.usuario_id = auth.uid()
    AND (uu.permissoes->>'editarAta')::boolean = true
  ));

CREATE POLICY "Usuários podem excluir atas"
  ON atas
  FOR DELETE
  TO authenticated
  USING (unidade_id IN (
    SELECT uu.unidade_id
    FROM usuario_unidades uu
    WHERE uu.usuario_id = auth.uid()
    AND (uu.permissoes->>'excluirAta')::boolean = true
  ));

-- Habilitar RLS nas tabelas relacionadas se ainda não estiver
DO $$
BEGIN
  -- Verificar e habilitar RLS para participantes
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'participantes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para assuntos_discutidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'assuntos_discutidos' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE assuntos_discutidos ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para decisoes_tomadas
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'decisoes_tomadas' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE decisoes_tomadas ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para acoes_designadas
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'acoes_designadas' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE acoes_designadas ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para desobrigacoes
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'desobrigacoes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE desobrigacoes ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para confirmacoes
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'confirmacoes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE confirmacoes ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para ordenacoes_sacerdocio
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'ordenacoes_sacerdocio' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE ordenacoes_sacerdocio ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para bencao_criancas
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'bencao_criancas' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE bencao_criancas ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verificar e habilitar RLS para hinos_personalizados
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'hinos_personalizados' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE hinos_personalizados ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;