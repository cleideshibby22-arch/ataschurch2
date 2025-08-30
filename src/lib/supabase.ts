import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isSupabaseAvailable = !!supabaseUrl && !!supabaseKey;

// Verificar se as variáveis de ambiente estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Flag para verificar se o Supabase está disponível
export const isSupabaseAvailable = isSupabaseConfigured;

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      unidades: {
        Row: {
          id: string;
          nome: string;
          tipo: string;
          logo: string | null;
          ativa: boolean;
          proprietario_id: string | null;
          data_criacao: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          tipo: string;
          logo?: string | null;
          ativa?: boolean;
          proprietario_id?: string | null;
          data_criacao?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          tipo?: string;
          logo?: string | null;
          ativa?: boolean;
          proprietario_id?: string | null;
          data_criacao?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          email: string;
          senha: string;
          nome_usuario: string;
          telefone: string | null;
          foto_usuario: string | null;
          data_cadastro: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          senha: string;
          nome_usuario: string;
          telefone?: string | null;
          foto_usuario?: string | null;
          data_cadastro?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          senha?: string;
          nome_usuario?: string;
          telefone?: string | null;
          foto_usuario?: string | null;
          data_cadastro?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuario_unidades: {
        Row: {
          id: string;
          usuario_id: string;
          unidade_id: string;
          cargo: string;
          tipo: string;
          permissoes: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          unidade_id: string;
          cargo: string;
          tipo?: string;
          permissoes?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          unidade_id?: string;
          cargo?: string;
          tipo?: string;
          permissoes?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      atas: {
        Row: {
          id: string;
          unidade_id: string;
          tipo: string;
          data: string;
          estaca: string;
          ala: string;
          horario: string;
          presidida_por: string;
          dirigida_por: string;
          oracao_inicial: string | null;
          oracao_final: string | null;
          recepcionista: string | null;
          frequencia: string | null;
          regente: string | null;
          pianista_organista: string | null;
          boas_vindas_reconhecimentos: string | null;
          anuncios: string | null;
          hino_abertura: string | null;
          primeira_oracao: string | null;
          ordenancas_desobrigacoes_apoios: string | null;
          hino_sacramental: string | null;
          primeiro_orador: string | null;
          segundo_orador: string | null;
          interludio_musical: string | null;
          ultimo_orador: string | null;
          ultimo_hino: string | null;
          ultima_oracao: string | null;
          apresentacao_final: string | null;
          agradecimentos_despedidas: string | null;
          proxima_reuniao: string | null;
          mensagem_pensamento: string | null;
          observacoes: string;
          criado_por: string | null;
          participantes: any;
          assuntos_discutidos: any;
          decisoes_tomadas: any;
          acoes_designadas: any;
          desobrigacoes: any;
          confirmacoes: any;
          ordenacoes_sacerdocio: any;
          bencao_criancas: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unidade_id: string;
          tipo: string;
          data: string;
          estaca: string;
          ala: string;
          horario: string;
          presidida_por: string;
          dirigida_por: string;
          oracao_inicial?: string | null;
          oracao_final?: string | null;
          recepcionista?: string | null;
          frequencia?: string | null;
          regente?: string | null;
          pianista_organista?: string | null;
          boas_vindas_reconhecimentos?: string | null;
          anuncios?: string | null;
          hino_abertura?: string | null;
          primeira_oracao?: string | null;
          ordenancas_desobrigacoes_apoios?: string | null;
          hino_sacramental?: string | null;
          primeiro_orador?: string | null;
          segundo_orador?: string | null;
          interludio_musical?: string | null;
          ultimo_orador?: string | null;
          ultimo_hino?: string | null;
          ultima_oracao?: string | null;
          apresentacao_final?: string | null;
          agradecimentos_despedidas?: string | null;
          proxima_reuniao?: string | null;
          mensagem_pensamento?: string | null;
          observacoes?: string;
          criado_por?: string | null;
          participantes?: any;
          assuntos_discutidos?: any;
          decisoes_tomadas?: any;
          acoes_designadas?: any;
          desobrigacoes?: any;
          confirmacoes?: any;
          ordenacoes_sacerdocio?: any;
          bencao_criancas?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unidade_id?: string;
          tipo?: string;
          data?: string;
          estaca?: string;
          ala?: string;
          horario?: string;
          presidida_por?: string;
          dirigida_por?: string;
          oracao_inicial?: string | null;
          oracao_final?: string | null;
          recepcionista?: string | null;
          frequencia?: string | null;
          regente?: string | null;
          pianista_organista?: string | null;
          boas_vindas_reconhecimentos?: string | null;
          anuncios?: string | null;
          hino_abertura?: string | null;
          primeira_oracao?: string | null;
          ordenancas_desobrigacoes_apoios?: string | null;
          hino_sacramental?: string | null;
          primeiro_orador?: string | null;
          segundo_orador?: string | null;
          interludio_musical?: string | null;
          ultimo_orador?: string | null;
          ultimo_hino?: string | null;
          ultima_oracao?: string | null;
          apresentacao_final?: string | null;
          agradecimentos_despedidas?: string | null;
          proxima_reuniao?: string | null;
          mensagem_pensamento?: string | null;
          observacoes?: string;
          criado_por?: string | null;
          participantes?: any;
          assuntos_discutidos?: any;
          decisoes_tomadas?: any;
          acoes_designadas?: any;
          desobrigacoes?: any;
          confirmacoes?: any;
          ordenacoes_sacerdocio?: any;
          bencao_criancas?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
