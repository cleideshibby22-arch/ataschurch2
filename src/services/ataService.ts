import { supabase } from '../lib/supabase';
import { Ata } from '../types';

// Helper function to check if Supabase is available
const isSupabaseAvailable = () => {
  return supabase !== null && supabase !== undefined;
};

export class AtaService {
  /**
   * Verifica se um ID é um UUID válido
   */
  static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Busca atas do Supabase ou localStorage.
   */
  static async buscarAtas(unidadeId: string): Promise<Ata[]> {
    // Verificar se Supabase está disponível e se o unidadeId é válido
    if (!isSupabaseAvailable() || !supabase) {
      return [];
    }
    
    if (!unidadeId || !this.isValidUUID(unidadeId)) {
      return [];
    }

    try {
      // Tenta buscar do Supabase primeiro
      const { data, error } = await supabase
        .from('atas')
        .select('*')
        .eq('unidade_id', unidadeId)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar atas do Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar atas:', error);
      return [];
    }
  }

  /**
   * Cadastra uma nova ata no Supabase.
   */
  static async cadastrarAta(novaAta: Omit<Ata, 'id' | 'created_at'>): Promise<Ata> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      const { data, error } = await supabase
        .from('atas')
        .insert([{
          ...novaAta,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao cadastrar ata:', error);
        throw new Error(`Erro ao cadastrar ata: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao cadastrar ata:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma ata existente.
   */
  static async atualizarAta(id: string, atualizacoes: Partial<Ata>): Promise<Ata> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      const { data, error } = await supabase
        .from('atas')
        .update(atualizacoes)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ata:', error);
        throw new Error(`Erro ao atualizar ata: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar ata:', error);
      throw error;
    }
  }

  /**
   * Remove uma ata por ID.
   */
  static async removerAta(id: string): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover ata:', error);
        throw new Error(`Erro ao remover ata: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao remover ata:', error);
      throw error;
    }
  }

  /**
   * Formata atas para exibição (se necessário).
   */
  static formatarAtas(atas: Ata[]): Ata[] {
    return atas.map(ata => ({
      ...ata,
      data: new Date(ata.data).toISOString().split('T')[0] // Garante formato de data
    }));
  }
}