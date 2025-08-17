export interface Usuario {
  id: string;
  senha: string;
  nomeUsuario: string;
  email: string;
  cargo: string;
  telefone?: string;
  fotoUsuario?: string;
  unidadeId: string; // ID da unidade atual
  nomeUnidade: string;
  tipoUnidade: string;
  logoUnidade?: string;
  dataCadastro: string;
  tipo: 'administrador' | 'usuario';
  permissoes: {
    criarAta: boolean;
    editarAta: boolean;
    excluirAta: boolean;
    gerenciarUsuarios: boolean;
    gerenciarSistema: boolean;
    verTodasAtas: boolean;
    verAtasPorChamado: boolean;
  };
}

export interface Unidade {
  id: string;
  nome: string;
  tipo: string;
  logo?: string;
  dataCriacao: string;
  ativa: boolean;
  proprietarioId: string;
}

export interface UsuarioUnidade {
  usuarioId: string;
  unidadeId: string;
  cargo: string;
  tipo: 'proprietario' | 'administrador' | 'usuario';
  chamado?: string; // Área de atuação específica
  permissoes: {
    criarAta: boolean;
    editarAta: boolean;
    excluirAta: boolean;
    gerenciarUsuarios: boolean;
    gerenciarSistema: boolean;
    verTodasAtas: boolean;
    verAtasPorChamado: boolean;
  };
}

export interface Ata {
  id: string;
  tipo: TipoReuniao;
  data: string;
  estaca: string;
  ala: string;
  horario: string;
  presidida_por: string;
  dirigida_por: string;
  oracao_inicial?: string;
  oracao_final?: string;
  recepcionista?: string;
  frequencia?: string;
  regente?: string;
  pianista_organista?: string;
  
  // Programa da reunião (específico para sacramental)
  boas_vindas_reconhecimentos?: string;
  anuncios?: string;
  hino_abertura?: string;
  primeira_oracao?: string;
  
  // Ordenanças/Desobrigações/Apoios (específico para sacramental)
  ordenancas_desobrigacoes_apoios?: string;
  
  // Sacramento (específico para sacramental)
  hino_sacramental?: string;
  
  // Oradores (específico para sacramental)
  primeiro_orador?: string;
  segundo_orador?: string;
  
  // Interlúdio e encerramento (específico para sacramental)
  interludio_musical?: string;
  ultimo_orador?: string;
  ultimo_hino?: string;
  ultima_oracao?: string;
  
  // Apresentação final (específico para sacramental)
  apresentacao_final?: string;
  agradecimentos_despedidas?: string;
  
  // Desobrigações (específico para sacramental)
  desobrigacoes: Desobrigacao[];
  
  // Confirmações (específico para sacramental)
  confirmacoes: Confirmacao[];
  
  // Ordenações ao Sacerdócio (específico para sacramental)
  ordenacoes_sacerdocio: OrdenacaoSacerdocio[];
  
  // Bênção de Crianças (específico para sacramental)
  bencao_criancas: BencaoCrianca[];
  
  // Campos comuns para todos os tipos de reunião
  participantes: Participante[];
  assuntos_discutidos: AssuntoDiscutido[];
  decisoes_tomadas: DecisaoTomada[];
  acoes_designadas: AcaoDesignada[];
  proxima_reuniao?: string;
  observacoes: string;
  mensagem_pensamento?: string; // Apenas para reuniões que não são sacramentais
  
  created_at: string;
  criado_por: string; // ID do usuário que criou
}

export type TipoReuniao = 
  | 'sacramental'
  | 'bispado'
  | 'conselho-ala'
  | 'presidencia-mocas'
  | 'presidencia-sociedade-socorro'
  | 'presidencia-primaria'
  | 'presidencia-rapazes'
  | 'presidencia-escola-dominical'
  | 'correlacao';

export interface Participante {
  id: string;
  nome: string;
  cargo: string;
  presente: boolean;
}

export interface AssuntoDiscutido {
  id: string;
  titulo: string;
  descricao: string;
  responsavel?: string;
}

export interface DecisaoTomada {
  id: string;
  decisao: string;
  justificativa?: string;
  votacao?: 'unanime' | 'maioria' | 'dividida';
}

export interface AcaoDesignada {
  id: string;
  acao: string;
  responsavel: string;
  prazo?: string;
  status: 'pendente' | 'em-andamento' | 'concluida';
}

export interface Desobrigacao {
  id: string;
  nome: string;
  acao: 'A' | 'D'; // Apoio ou Desobrigação
  posicao: string;
}

export interface Confirmacao {
  id: string;
  nome: string;
  confirmado_por: string;
}

export interface OrdenacaoSacerdocio {
  id: string;
  nome: string;
  sacerdocio: 'Aarônico' | 'Melquisedeque';
  oficio: string;
  ordenado_por: string;
}

export interface BencaoCrianca {
  id: string;
  nome: string;
  data_nascimento: string;
  abencoado_por: string;
}

export interface FormData {
  tipo: TipoReuniao;
  data: string;
  estaca: string;
  ala: string;
  horario: string;
  presidida_por: string;
  dirigida_por: string;
  oracao_inicial?: string;
  oracao_final?: string;
  recepcionista?: string;
  frequencia?: string;
  regente?: string;
  pianista_organista?: string;
  
  boas_vindas_reconhecimentos?: string;
  anuncios?: string;
  hino_abertura?: string;
  primeira_oracao?: string;
  
  ordenancas_desobrigacoes_apoios?: string;
  
  hino_sacramental?: string;
  
  primeiro_orador?: string;
  segundo_orador?: string;
  
  interludio_musical?: string;
  ultimo_orador?: string;
  ultimo_hino?: string;
  ultima_oracao?: string;
  
  apresentacao_final?: string;
  agradecimentos_despedidas?: string;
  
  desobrigacoes: Desobrigacao[];
  confirmacoes: Confirmacao[];
  ordenacoes_sacerdocio: OrdenacaoSacerdocio[];
  bencao_criancas: BencaoCrianca[];
  
  participantes: Participante[];
  assuntos_discutidos: AssuntoDiscutido[];
  decisoes_tomadas: DecisaoTomada[];
  acoes_designadas: AcaoDesignada[];
  proxima_reuniao?: string;
  observacoes: string;
  mensagem_pensamento?: string;
}

export const TIPOS_REUNIAO = {
  'sacramental': 'Reunião Sacramental',
  'bispado': 'Reunião do Bispado',
  'conselho-ala': 'Reunião do Conselho da Ala',
  'presidencia-mocas': 'Reunião da Presidência das Moças',
  'presidencia-sociedade-socorro': 'Reunião da Presidência da Sociedade de Socorro',
  'presidencia-primaria': 'Reunião da Presidência da Primária',
  'presidencia-rapazes': 'Reunião da Presidência dos Rapazes',
  'presidencia-escola-dominical': 'Reunião da Presidência da Escola Dominical',
  'correlacao': 'Reunião de Correlação'
} as const;

export const CHAMADOS_DISPONIVEIS = {
  'bispado': 'Bispado',
  'mocas': 'Moças',
  'sociedade-socorro': 'Sociedade de Socorro',
  'primaria': 'Primária',
  'rapazes': 'Rapazes',
  'escola-dominical': 'Escola Dominical',
  'correlacao': 'Correlação',
  'geral': 'Acesso Geral'
} as const;

export type Chamado = keyof typeof CHAMADOS_DISPONIVEIS;

export const CARGOS_POR_TIPO = {
  bispado: [
    'Bispo',
    '1º Conselheiro do Bispado',
    '2º Conselheiro do Bispado',
    'Secretário Executivo'
  ],
  'conselho-ala': [
    'Bispo',
    '1º Conselheiro do Bispado',
    '2º Conselheiro do Bispado',
    'Secretário Executivo',
    'Presidente dos Élderes',
    'Presidente das Moças',
    'Presidente da Sociedade de Socorro',
    'Presidente da Primária',
    'Presidente dos Rapazes',
    'Presidente da Escola Dominical',
    'Líder Missionário da Ala',
    'Especialista em História da Família'
  ],
  'presidencia-mocas': [
    'Presidente das Moças',
    '1ª Conselheira das Moças',
    '2ª Conselheira das Moças',
    'Secretária das Moças'
  ],
  'presidencia-sociedade-socorro': [
    'Presidente da Sociedade de Socorro',
    '1ª Conselheira da Sociedade de Socorro',
    '2ª Conselheira da Sociedade de Socorro',
    'Secretária da Sociedade de Socorro'
  ],
  'presidencia-primaria': [
    'Presidente da Primária',
    '1ª Conselheira da Primária',
    '2ª Conselheira da Primária',
    'Secretária da Primária'
  ],
  'presidencia-rapazes': [
    'Presidente dos Rapazes',
    '1º Conselheiro dos Rapazes',
    '2º Conselheiro dos Rapazes',
    'Secretário dos Rapazes'
  ],
  'presidencia-escola-dominical': [
    'Presidente da Escola Dominical',
    '1º Conselheiro da Escola Dominical',
    '2º Conselheiro da Escola Dominical',
    'Secretário da Escola Dominical'
  ],
  correlacao: [
    'Bispo',
    '1º Conselheiro do Bispado',
    '2º Conselheiro do Bispado',
    'Presidente dos Élderes',
    'Presidente das Moças',
    'Presidente da Sociedade de Socorro',
    'Presidente da Primária',
    'Presidente dos Rapazes',
    'Presidente da Escola Dominical'
  ]
} as const;