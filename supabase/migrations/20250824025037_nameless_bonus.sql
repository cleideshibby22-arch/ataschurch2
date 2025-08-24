/*
  # Aprimoramento das Políticas RLS

  1. Políticas Aprimoradas
    - Tabela `usuarios`: Políticas mais seguras para perfil próprio
    - Tabela `unidades`: Acesso baseado em relacionamento usuário-unidade
    - Tabela `usuario_unidades`: Controle granular de acesso
    - Tabela `atas`: Políticas baseadas em permissões e chamados
    - Tabelas relacionadas: Políticas consistentes para todas as tabelas filhas

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em auth.uid()
    - Verificação de permissões granulares
    - Controle de acesso por chamado/área

  3. Funcionalidades
    - Usuários só veem dados de suas unidades
    - Administradores têm acesso ampliado
    - Controle por tipo de reunião e chamado
    - Políticas específicas para cada operação (SELECT, INSERT, UPDATE, DELETE)
*/

-- Remover políticas existentes para recriá-las
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Permitir inserção de novos usuários" ON usuarios;

DROP POLICY IF EXISTS "Usuários podem ver suas unidades" ON unidades;
DROP POLICY IF EXISTS "Administradores podem gerenciar unidades" ON unidades;

DROP POLICY IF EXISTS "Usuários podem ver suas relações" ON usuario_unidades;
DROP POLICY IF EXISTS "Administradores podem gerenciar usuários da unidade" ON usuario_unidades;

DROP POLICY IF EXISTS "Usuários podem ver atas da sua unidade" ON atas;
DROP POLICY IF EXISTS "Usuários podem criar atas" ON atas;
DROP POLICY IF EXISTS "Usuários podem editar atas" ON atas;
DROP POLICY IF EXISTS "Usuários podem excluir atas" ON atas;

-- Políticas para tabela usuarios
CREATE POLICY "Usuários podem ver próprio perfil"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Administradores podem ver usuários da unidade"
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
          AND (uu2.tipo IN ('administrador', 'proprietario') 
               OR (uu2.permissoes->>'gerenciarUsuarios')::boolean = true)
      )
    )
    OR auth.uid() = id
  );

-- Políticas para tabela unidades
CREATE POLICY "Usuários podem ver suas unidades"
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

CREATE POLICY "Proprietários podem gerenciar suas unidades"
  ON unidades
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND uu.tipo = 'proprietario'
    )
  )
  WITH CHECK (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND uu.tipo = 'proprietario'
    )
  );

CREATE POLICY "Administradores podem editar unidades"
  ON unidades
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.tipo IN ('administrador', 'proprietario')
             OR (uu.permissoes->>'gerenciarSistema')::boolean = true)
    )
  )
  WITH CHECK (
    id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.tipo IN ('administrador', 'proprietario')
             OR (uu.permissoes->>'gerenciarSistema')::boolean = true)
    )
  );

-- Políticas para tabela usuario_unidades
CREATE POLICY "Usuários podem ver suas relações"
  ON usuario_unidades
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem ver relações da unidade"
  ON usuario_unidades
  FOR SELECT
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.tipo IN ('administrador', 'proprietario')
             OR (uu.permissoes->>'gerenciarUsuarios')::boolean = true)
    )
  );

CREATE POLICY "Administradores podem gerenciar usuários da unidade"
  ON usuario_unidades
  FOR ALL
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.tipo IN ('administrador', 'proprietario')
             OR (uu.permissoes->>'gerenciarUsuarios')::boolean = true)
    )
  )
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.tipo IN ('administrador', 'proprietario')
             OR (uu.permissoes->>'gerenciarUsuarios')::boolean = true)
    )
  );

-- Políticas aprimoradas para tabela atas
CREATE POLICY "Usuários podem ver atas baseado em permissões"
  ON atas
  FOR SELECT
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          -- Administradores e proprietários veem tudo
          uu.tipo IN ('administrador', 'proprietario')
          -- Usuários com permissão de ver todas as atas
          OR (uu.permissoes->>'verTodasAtas')::boolean = true
          -- Usuários com permissão baseada em chamado
          OR (
            (uu.permissoes->>'verAtasPorChamado')::boolean = true
            AND (
              -- Se não tem chamado específico, pode ver atas sacramentais
              uu.chamado IS NULL AND tipo = 'sacramental'
              -- Ou se tem chamado específico, pode ver atas relacionadas
              OR (
                uu.chamado = 'bispado' AND tipo IN ('bispado', 'conselho-ala', 'sacramental')
              )
              OR (
                uu.chamado = 'mocas' AND tipo IN ('presidencia-mocas', 'sacramental')
              )
              OR (
                uu.chamado = 'sociedade-socorro' AND tipo IN ('presidencia-sociedade-socorro', 'sacramental')
              )
              OR (
                uu.chamado = 'primaria' AND tipo IN ('presidencia-primaria', 'sacramental')
              )
              OR (
                uu.chamado = 'rapazes' AND tipo IN ('presidencia-rapazes', 'sacramental')
              )
              OR (
                uu.chamado = 'escola-dominical' AND tipo IN ('presidencia-escola-dominical', 'sacramental')
              )
              OR (
                uu.chamado = 'correlacao' AND tipo IN ('correlacao', 'conselho-ala', 'sacramental')
              )
            )
          )
        )
    )
  );

CREATE POLICY "Usuários podem criar atas com permissão"
  ON atas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (uu.permissoes->>'criarAta')::boolean = true
    )
  );

CREATE POLICY "Usuários podem editar atas com permissão"
  ON atas
  FOR UPDATE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

CREATE POLICY "Usuários podem excluir atas com permissão"
  ON atas
  FOR DELETE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'excluirAta')::boolean = true
        )
    )
  );

-- Políticas para tabelas relacionadas às atas (participantes, assuntos, etc.)
-- Todas seguem o mesmo padrão: acesso baseado na ata

-- Participantes
DROP POLICY IF EXISTS "Acesso baseado na ata" ON participantes;
CREATE POLICY "Usuários podem gerenciar participantes das suas atas"
  ON participantes
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Assuntos Discutidos
DROP POLICY IF EXISTS "Acesso baseado na ata" ON assuntos_discutidos;
CREATE POLICY "Usuários podem gerenciar assuntos das suas atas"
  ON assuntos_discutidos
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Decisões Tomadas
DROP POLICY IF EXISTS "Acesso baseado na ata" ON decisoes_tomadas;
CREATE POLICY "Usuários podem gerenciar decisões das suas atas"
  ON decisoes_tomadas
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Ações Designadas
DROP POLICY IF EXISTS "Acesso baseado na ata" ON acoes_designadas;
CREATE POLICY "Usuários podem gerenciar ações das suas atas"
  ON acoes_designadas
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Desobrigações
DROP POLICY IF EXISTS "Acesso baseado na ata" ON desobrigacoes;
CREATE POLICY "Usuários podem gerenciar desobrigações das suas atas"
  ON desobrigacoes
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Confirmações
DROP POLICY IF EXISTS "Acesso baseado na ata" ON confirmacoes;
CREATE POLICY "Usuários podem gerenciar confirmações das suas atas"
  ON confirmacoes
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Ordenações Sacerdócio
DROP POLICY IF EXISTS "Acesso baseado na ata" ON ordenacoes_sacerdocio;
CREATE POLICY "Usuários podem gerenciar ordenações das suas atas"
  ON ordenacoes_sacerdocio
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Bênção Crianças
DROP POLICY IF EXISTS "Acesso baseado na ata" ON bencao_criancas;
CREATE POLICY "Usuários podem gerenciar bênçãos das suas atas"
  ON bencao_criancas
  FOR ALL
  TO authenticated
  USING (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    ata_id IN (
      SELECT a.id
      FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

-- Políticas para hinos personalizados
DROP POLICY IF EXISTS "Usuários podem ver hinos da sua unidade" ON hinos_personalizados;
DROP POLICY IF EXISTS "Usuários podem criar hinos personalizados" ON hinos_personalizados;
DROP POLICY IF EXISTS "Usuários podem gerenciar hinos personalizados" ON hinos_personalizados;

CREATE POLICY "Usuários podem ver hinos da sua unidade"
  ON hinos_personalizados
  FOR SELECT
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar hinos personalizados"
  ON hinos_personalizados
  FOR INSERT
  TO authenticated
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'criarAta')::boolean = true
        )
    )
  );

CREATE POLICY "Usuários podem editar hinos personalizados"
  ON hinos_personalizados
  FOR UPDATE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  )
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'editarAta')::boolean = true
        )
    )
  );

CREATE POLICY "Usuários podem excluir hinos personalizados"
  ON hinos_personalizados
  FOR DELETE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          uu.tipo IN ('administrador', 'proprietario')
          OR (uu.permissoes->>'excluirAta')::boolean = true
        )
    )
  );

-- Habilitar RLS em usuario_unidades se não estiver habilitado
ALTER TABLE usuario_unidades ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhorar performance das consultas de políticas
CREATE INDEX IF NOT EXISTS idx_usuario_unidades_auth_lookup 
  ON usuario_unidades (usuario_id, unidade_id, tipo);

CREATE INDEX IF NOT EXISTS idx_usuario_unidades_permissoes 
  ON usuario_unidades USING gin (permissoes);

CREATE INDEX IF NOT EXISTS idx_atas_unidade_tipo 
  ON atas (unidade_id, tipo);

-- Comentários para documentar as políticas
COMMENT ON POLICY "Usuários podem ver atas baseado em permissões" ON atas IS 
'Permite acesso às atas baseado no tipo de usuário, permissões e chamado específico';

COMMENT ON POLICY "Usuários podem criar atas com permissão" ON atas IS 
'Permite criação de atas apenas para usuários com permissão criarAta';

COMMENT ON POLICY "Usuários podem editar atas com permissão" ON atas IS 
'Permite edição de atas para administradores ou usuários com permissão editarAta';

COMMENT ON POLICY "Usuários podem excluir atas com permissão" ON atas IS 
'Permite exclusão de atas para administradores ou usuários com permissão excluirAta';