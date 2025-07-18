/*
  # Sistema de Permissões e Privilégios

  1. Atualizações nas Tabelas
    - Atualizar `usuario_unidades` para incluir mais tipos de usuário
    - Adicionar campo `chamado` para definir área de atuação
    - Expandir permissões para controle granular

  2. Novas Políticas de Segurança
    - Administradores podem gerenciar usuários da unidade
    - Usuários veem apenas atas relacionadas ao seu chamado
    - Proprietários têm acesso total

  3. Índices e Otimizações
    - Índices para consultas por chamado
    - Otimização de políticas RLS
*/

-- Atualizar enum de tipos de usuário
ALTER TABLE usuario_unidades DROP CONSTRAINT IF EXISTS usuario_unidades_tipo_check;
ALTER TABLE usuario_unidades ADD CONSTRAINT usuario_unidades_tipo_check 
  CHECK (tipo = ANY (ARRAY['proprietario'::text, 'administrador'::text, 'usuario'::text]));

-- Adicionar campo chamado para definir área de atuação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuario_unidades' AND column_name = 'chamado'
  ) THEN
    ALTER TABLE usuario_unidades ADD COLUMN chamado text;
  END IF;
END $$;

-- Atualizar permissões padrão para ser mais granular
ALTER TABLE usuario_unidades ALTER COLUMN permissoes SET DEFAULT '{
  "criarAta": true,
  "editarAta": false,
  "excluirAta": false,
  "gerenciarUsuarios": false,
  "gerenciarSistema": false,
  "verTodasAtas": false,
  "verAtasPorChamado": true
}'::jsonb;

-- Adicionar índice para chamado
CREATE INDEX IF NOT EXISTS idx_usuario_unidades_chamado ON usuario_unidades(chamado);

-- Atualizar política para administradores gerenciarem usuários
DROP POLICY IF EXISTS "Administradores podem gerenciar usuários da unidade" ON usuario_unidades;
CREATE POLICY "Administradores podem gerenciar usuários da unidade"
  ON usuario_unidades
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades admin_rel
      WHERE admin_rel.usuario_id = auth.uid()
        AND admin_rel.unidade_id = usuario_unidades.unidade_id
        AND admin_rel.tipo IN ('administrador', 'proprietario')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuario_unidades admin_rel
      WHERE admin_rel.usuario_id = auth.uid()
        AND admin_rel.unidade_id = usuario_unidades.unidade_id
        AND admin_rel.tipo IN ('administrador', 'proprietario')
    )
  );

-- Política para usuários verem suas próprias relações
DROP POLICY IF EXISTS "Usuários podem ver suas relações" ON usuario_unidades;
CREATE POLICY "Usuários podem ver suas relações"
  ON usuario_unidades
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- Atualizar política de atas para considerar chamados
DROP POLICY IF EXISTS "Usuários podem ver atas da sua unidade" ON atas;
CREATE POLICY "Usuários podem ver atas da sua unidade"
  ON atas
  FOR SELECT
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND (
          -- Administradores e proprietários veem todas as atas
          uu.tipo IN ('administrador', 'proprietario')
          OR
          -- Usuários com permissão para ver todas as atas
          ((uu.permissoes ->> 'verTodasAtas')::boolean = true)
          OR
          -- Usuários veem atas relacionadas ao seu chamado
          (
            ((uu.permissoes ->> 'verAtasPorChamado')::boolean = true)
            AND (
              uu.chamado IS NULL -- Se não tem chamado específico, vê todas
              OR atas.tipo = 'sacramental' -- Todos veem reuniões sacramentais
              OR (
                -- Mapear chamados para tipos de reunião
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
    )
  );

-- Política para criação de atas baseada em permissões
DROP POLICY IF EXISTS "Usuários podem criar atas" ON atas;
CREATE POLICY "Usuários podem criar atas"
  ON atas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND ((uu.permissoes ->> 'criarAta')::boolean = true)
    )
  );

-- Política para edição de atas
DROP POLICY IF EXISTS "Usuários podem editar atas" ON atas;
CREATE POLICY "Usuários podem editar atas"
  ON atas
  FOR UPDATE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND ((uu.permissoes ->> 'editarAta')::boolean = true)
    )
  );

-- Política para exclusão de atas
DROP POLICY IF EXISTS "Usuários podem excluir atas" ON atas;
CREATE POLICY "Usuários podem excluir atas"
  ON atas
  FOR DELETE
  TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id
      FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
        AND ((uu.permissoes ->> 'excluirAta')::boolean = true)
    )
  );