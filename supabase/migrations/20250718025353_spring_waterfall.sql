/*
  # Schema completo para o sistema de atas da igreja

  1. Tabelas principais
    - `unidades` - Armazena informações das unidades (alas, ramos, etc.)
    - `usuarios` - Dados dos usuários do sistema
    - `usuario_unidades` - Relacionamento entre usuários e unidades
    - `atas` - Atas das reuniões
    - `participantes` - Participantes das reuniões
    - `assuntos_discutidos` - Assuntos discutidos nas reuniões
    - `decisoes_tomadas` - Decisões tomadas nas reuniões
    - `acoes_designadas` - Ações designadas nas reuniões
    - `desobrigacoes` - Desobrigações e apoios (reuniões sacramentais)
    - `confirmacoes` - Confirmações (reuniões sacramentais)
    - `ordenacoes_sacerdocio` - Ordenações ao sacerdócio
    - `bencao_criancas` - Bênçãos de crianças
    - `hinos_personalizados` - Hinos personalizados criados pelos usuários

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas na unidade do usuário
    - Controle de permissões por tipo de usuário
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de unidades
CREATE TABLE IF NOT EXISTS unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('Ala', 'Ramo', 'Distrito', 'Estaca')),
  logo text,
  ativa boolean DEFAULT true,
  proprietario_id uuid,
  data_criacao timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  senha text NOT NULL,
  nome_usuario text NOT NULL,
  telefone text,
  foto_usuario text,
  data_cadastro timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento usuário-unidade
CREATE TABLE IF NOT EXISTS usuario_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  cargo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('administrador', 'usuario')) DEFAULT 'usuario',
  permissoes jsonb DEFAULT '{
    "criarAta": true,
    "editarAta": false,
    "excluirAta": false,
    "gerenciarUsuarios": false,
    "gerenciarSistema": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, unidade_id)
);

-- Tabela de atas
CREATE TABLE IF NOT EXISTS atas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('sacramental', 'bispado', 'conselho-ala', 'presidencia-mocas', 'presidencia-sociedade-socorro', 'presidencia-primaria', 'presidencia-rapazes', 'presidencia-escola-dominical', 'correlacao')),
  data date NOT NULL,
  estaca text NOT NULL,
  ala text NOT NULL,
  horario time NOT NULL,
  presidida_por text NOT NULL,
  dirigida_por text NOT NULL,
  
  -- Campos opcionais comuns
  oracao_inicial text,
  oracao_final text,
  recepcionista text,
  frequencia text,
  regente text,
  pianista_organista text,
  
  -- Campos específicos para reunião sacramental
  boas_vindas_reconhecimentos text,
  anuncios text,
  hino_abertura text,
  primeira_oracao text,
  ordenancas_desobrigacoes_apoios text,
  hino_sacramental text,
  primeiro_orador text,
  segundo_orador text,
  interludio_musical text,
  ultimo_orador text,
  ultimo_hino text,
  ultima_oracao text,
  apresentacao_final text,
  agradecimentos_despedidas text,
  
  -- Campos para outras reuniões
  proxima_reuniao date,
  mensagem_pensamento text,
  
  -- Campos comuns
  observacoes text DEFAULT '',
  criado_por uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de participantes
CREATE TABLE IF NOT EXISTS participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cargo text NOT NULL,
  presente boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de assuntos discutidos
CREATE TABLE IF NOT EXISTS assuntos_discutidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  responsavel text,
  created_at timestamptz DEFAULT now()
);

-- Tabela de decisões tomadas
CREATE TABLE IF NOT EXISTS decisoes_tomadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  decisao text NOT NULL,
  justificativa text,
  votacao text CHECK (votacao IN ('unanime', 'maioria', 'dividida')) DEFAULT 'unanime',
  created_at timestamptz DEFAULT now()
);

-- Tabela de ações designadas
CREATE TABLE IF NOT EXISTS acoes_designadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  acao text NOT NULL,
  responsavel text NOT NULL,
  prazo date,
  status text CHECK (status IN ('pendente', 'em-andamento', 'concluida')) DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

-- Tabela de desobrigações (específica para reuniões sacramentais)
CREATE TABLE IF NOT EXISTS desobrigacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  acao text CHECK (acao IN ('A', 'D')) NOT NULL, -- A = Apoio, D = Desobrigação
  posicao text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de confirmações
CREATE TABLE IF NOT EXISTS confirmacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  confirmado_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de ordenações ao sacerdócio
CREATE TABLE IF NOT EXISTS ordenacoes_sacerdocio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  sacerdocio text CHECK (sacerdocio IN ('Aarônico', 'Melquisedeque')) NOT NULL,
  oficio text NOT NULL,
  ordenado_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de bênção de crianças
CREATE TABLE IF NOT EXISTS bencao_criancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ata_id uuid REFERENCES atas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  data_nascimento date,
  abencoado_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de hinos personalizados
CREATE TABLE IF NOT EXISTS hinos_personalizados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES unidades(id) ON DELETE CASCADE,
  numero integer NOT NULL,
  titulo text NOT NULL,
  categoria text NOT NULL DEFAULT 'Personalizado',
  criado_por uuid REFERENCES usuarios(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(unidade_id, numero)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos_discutidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisoes_tomadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes_designadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE desobrigacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenacoes_sacerdocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE bencao_criancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE hinos_personalizados ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para unidades
CREATE POLICY "Usuários podem ver suas unidades" ON unidades
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT unidade_id FROM usuario_unidades 
      WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "Administradores podem gerenciar unidades" ON unidades
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades 
      WHERE usuario_id = auth.uid() 
      AND unidade_id = unidades.id 
      AND tipo = 'administrador'
    )
  );

-- Políticas de segurança para usuários
CREATE POLICY "Usuários podem ver próprio perfil" ON usuarios
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprio perfil" ON usuarios
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Políticas de segurança para usuario_unidades
CREATE POLICY "Usuários podem ver suas relações" ON usuario_unidades
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Administradores podem gerenciar usuários da unidade" ON usuario_unidades
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuario_unidades admin_rel
      WHERE admin_rel.usuario_id = auth.uid()
      AND admin_rel.unidade_id = usuario_unidades.unidade_id
      AND admin_rel.tipo = 'administrador'
    )
  );

-- Políticas de segurança para atas
CREATE POLICY "Usuários podem ver atas da sua unidade" ON atas
  FOR SELECT TO authenticated
  USING (
    unidade_id IN (
      SELECT unidade_id FROM usuario_unidades 
      WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar atas" ON atas
  FOR INSERT TO authenticated
  WITH CHECK (
    unidade_id IN (
      SELECT uu.unidade_id FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND (uu.permissoes->>'criarAta')::boolean = true
    )
  );

CREATE POLICY "Usuários podem editar atas" ON atas
  FOR UPDATE TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND (uu.permissoes->>'editarAta')::boolean = true
    )
  );

CREATE POLICY "Usuários podem excluir atas" ON atas
  FOR DELETE TO authenticated
  USING (
    unidade_id IN (
      SELECT uu.unidade_id FROM usuario_unidades uu
      WHERE uu.usuario_id = auth.uid()
      AND (uu.permissoes->>'excluirAta')::boolean = true
    )
  );

-- Políticas para tabelas relacionadas às atas (aplicam as mesmas regras da ata pai)
CREATE POLICY "Acesso baseado na ata" ON participantes
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON assuntos_discutidos
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON decisoes_tomadas
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON acoes_designadas
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON desobrigacoes
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON confirmacoes
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON ordenacoes_sacerdocio
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Acesso baseado na ata" ON bencao_criancas
  FOR ALL TO authenticated
  USING (
    ata_id IN (
      SELECT a.id FROM atas a
      JOIN usuario_unidades uu ON a.unidade_id = uu.unidade_id
      WHERE uu.usuario_id = auth.uid()
    )
  );

-- Políticas para hinos personalizados
CREATE POLICY "Usuários podem ver hinos da sua unidade" ON hinos_personalizados
  FOR SELECT TO authenticated
  USING (
    unidade_id IN (
      SELECT unidade_id FROM usuario_unidades 
      WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar hinos personalizados" ON hinos_personalizados
  FOR INSERT TO authenticated
  WITH CHECK (
    unidade_id IN (
      SELECT unidade_id FROM usuario_unidades 
      WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem gerenciar hinos personalizados" ON hinos_personalizados
  FOR ALL TO authenticated
  USING (
    unidade_id IN (
      SELECT unidade_id FROM usuario_unidades 
      WHERE usuario_id = auth.uid()
    )
  );

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atas_unidade_id ON atas(unidade_id);
CREATE INDEX IF NOT EXISTS idx_atas_data ON atas(data DESC);
CREATE INDEX IF NOT EXISTS idx_atas_tipo ON atas(tipo);
CREATE INDEX IF NOT EXISTS idx_usuario_unidades_usuario_id ON usuario_unidades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_unidades_unidade_id ON usuario_unidades(unidade_id);
CREATE INDEX IF NOT EXISTS idx_participantes_ata_id ON participantes(ata_id);
CREATE INDEX IF NOT EXISTS idx_assuntos_ata_id ON assuntos_discutidos(ata_id);
CREATE INDEX IF NOT EXISTS idx_decisoes_ata_id ON decisoes_tomadas(ata_id);
CREATE INDEX IF NOT EXISTS idx_acoes_ata_id ON acoes_designadas(ata_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON unidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuario_unidades_updated_at BEFORE UPDATE ON usuario_unidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_atas_updated_at BEFORE UPDATE ON atas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();