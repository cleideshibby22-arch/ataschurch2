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
    if (!isSupabaseAvailable() || !supabase) {
      return this.buscarAtasLocal(unidadeId);
    }

    // Se o unidadeId não for um UUID válido, usar localStorage
    if (!this.isValidUUID(unidadeId)) {
      return this.buscarAtasLocal(unidadeId);
    }

    try {
      // Tenta buscar do Supabase primeiro
      const { data, error } = await supabase
        .from('atas')
        .select('*')
        .eq('unidade_id', unidadeId)
        .order('data', { ascending: false });

      if (error) {
        console.warn('Erro ao buscar atas do Supabase, usando localStorage:', error);
        return this.buscarAtasLocal(unidadeId);
      }

      return data || [];
    } catch (error) {
      console.warn('Supabase não disponível, usando localStorage:', error);
      return this.buscarAtasLocal(unidadeId);
    }
  }

  /**
   * Busca atas do localStorage.
   */
  static buscarAtasLocal(unidadeId: string): Ata[] {
    try {
      const atasString = localStorage.getItem(`atas_${unidadeId}`);
      return atasString ? JSON.parse(atasString) : [];
    } catch (error) {
      console.error('Erro ao buscar atas locais:', error);
      return [];
    }
  }

  /**
   * Cadastra uma nova ata no Supabase.
   */
  static async cadastrarAta(novaAta: Omit<Ata, 'id' | 'created_at'>): Promise<Ata> {
    if (!isSupabaseAvailable() || !supabase) {
      // Gera um ID temporário para localStorage
      const ataComId = {
        ...novaAta,
        created_at: new Date().toISOString(),
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } as Ata;
      
      const atasExistentes = this.buscarAtasLocal(novaAta.unidade_id!);
      atasExistentes.unshift(ataComId);
      this.salvarAtasLocal(novaAta.unidade_id!, atasExistentes);
      
      return ataComId;
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
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.warn('Supabase não disponível, salvando localmente');
      // Gera um ID temporário para localStorage
      const ataComId = {
        ...novaAta,
        created_at: new Date().toISOString(),
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      } as Ata;
      
      const atasExistentes = this.buscarAtasLocal(novaAta.unidade_id!);
      atasExistentes.unshift(ataComId);
      this.salvarAtasLocal(novaAta.unidade_id!, atasExistentes);
      
      return ataComId;
    }
  }

  /**
   * Atualiza uma ata existente.
   */
  static async atualizarAta(id: string, atualizacoes: Partial<Ata>): Promise<Ata> {
    if (!isSupabaseAvailable() || !supabase) {
      // Implementa atualização local
      if (atualizacoes.unidade_id) {
        const atasExistentes = this.buscarAtasLocal(atualizacoes.unidade_id);
        const index = atasExistentes.findIndex(ata => ata.id === id);
        
        if (index !== -1) {
          atasExistentes[index] = { ...atasExistentes[index], ...atualizacoes };
          this.salvarAtasLocal(atualizacoes.unidade_id, atasExistentes);
          return atasExistentes[index];
        }
      }
      throw new Error('Ata não encontrada para atualização local');
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
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.warn('Supabase não disponível, atualizando localmente');
      // Implementa atualização local
      if (atualizacoes.unidade_id) {
        const atasExistentes = this.buscarAtasLocal(atualizacoes.unidade_id);
        const index = atasExistentes.findIndex(ata => ata.id === id);
        
        if (index !== -1) {
          atasExistentes[index] = { ...atasExistentes[index], ...atualizacoes };
          this.salvarAtasLocal(atualizacoes.unidade_id, atasExistentes);
          return atasExistentes[index];
        }
      }
      throw new Error('Ata não encontrada para atualização local');
    }
  }

  /**
   * Remove uma ata por ID.
   */
  static async removerAta(id: string): Promise<void> {
    if (!isSupabaseAvailable() || !supabase) {
      // Implementa remoção local - precisa buscar em todas as unidades
      const keys = Object.keys(localStorage).filter(key => key.startsWith('atas_'));
      
      for (const key of keys) {
        const unidadeId = key.replace('atas_', '');
        const atas = this.buscarAtasLocal(unidadeId);
        const atasAtualizadas = atas.filter(ata => ata.id !== id);
        
        if (atas.length !== atasAtualizadas.length) {
          this.salvarAtasLocal(unidadeId, atasAtualizadas);
          return;
        }
      }
      
      throw new Error('Ata não encontrada para remoção local');
    }

    try {
      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover ata:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.warn('Supabase não disponível, removendo localmente');
      // Implementa remoção local - precisa buscar em todas as unidades
      const keys = Object.keys(localStorage).filter(key => key.startsWith('atas_'));
      
      for (const key of keys) {
        const unidadeId = key.replace('atas_', '');
        const atas = this.buscarAtasLocal(unidadeId);
        const atasAtualizadas = atas.filter(ata => ata.id !== id);
        
        if (atas.length !== atasAtualizadas.length) {
          this.salvarAtasLocal(unidadeId, atasAtualizadas);
          return;
        }
      }
      
      throw new Error('Ata não encontrada para remoção local');
    }
  }

  /**
   * Salva atas localmente (para offline).
   */
  static salvarAtasLocal(unidadeId: string, atas: Ata[]): void {
    try {
      localStorage.setItem(`atas_${unidadeId}`, JSON.stringify(atas));
    } catch (error) {
      console.error('Erro ao salvar atas localmente:', error);
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

  /**
   * (Opcional) Sincroniza as atas locais com o Supabase.
   */
  static async sincronizarAtasLocalComSupabase(unidadeId: string): Promise<void> {
    try {
      const atasLocais = this.buscarAtasLocal(unidadeId);
      const atasTemporarias = atasLocais.filter(ata => ata.id.startsWith('temp_'));
      
      for (const ata of atasTemporarias) {
        try {
          const { id, ...ataSemId } = ata;
          await this.cadastrarAta(ataSemId);
        } catch (e) {
          console.warn(`Falha ao sincronizar ata ${ata.id}:`, e);
        }
      }

      // Remove atas temporárias após sincronizar
      const atasSincronizadas = atasLocais.filter(ata => !ata.id.startsWith('temp_'));
      this.salvarAtasLocal(unidadeId, atasSincronizadas);
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }
}