import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Hino } from '../data/hinos';

export class HinoService {
  // Buscar hinos personalizados da unidade
  static async buscarHinosPersonalizados(unidadeId: string): Promise<Hino[]> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.buscarHinosPersonalizadosLocal(unidadeId);
    }

    try {
      const { data: hinos, error } = await supabase
        .from('hinos_personalizados')
        .select('*')
        .eq('unidade_id', unidadeId)
        .order('numero');

      if (error) {
        throw new Error('Erro ao buscar hinos personalizados');
      }

      return (hinos || []).map(hino => ({
        numero: hino.numero,
        titulo: hino.titulo,
        categoria: hino.categoria,
        fonte: 'personalizado' as const
      }));
    } catch (error) {
      console.error('Erro ao buscar hinos personalizados:', error);
      return [];
    }
  }

  // Buscar hinos personalizados local
  private static async buscarHinosPersonalizadosLocal(unidadeId: string): Promise<Hino[]> {
    const hinos = JSON.parse(localStorage.getItem('hinos-personalizados') || '[]');
    return hinos
      .filter((hino: any) => hino.unidadeId === unidadeId)
      .map((hino: any) => ({
        numero: hino.numero,
        titulo: hino.titulo,
        categoria: hino.categoria,
        fonte: 'personalizado' as const
      }));
  }

  // Adicionar hino personalizado
  static async adicionarHino(unidadeId: string, usuarioId: string, hino: Omit<Hino, 'fonte'>): Promise<void> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.adicionarHinoLocal(unidadeId, usuarioId, hino);
    }

    try {
      const { error } = await supabase
        .from('hinos_personalizados')
        .insert({
          unidade_id: unidadeId,
          numero: hino.numero,
          titulo: hino.titulo,
          categoria: hino.categoria,
          criado_por: usuarioId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Já existe um hino com este número nesta unidade');
        }
        throw new Error('Erro ao adicionar hino personalizado');
      }
    } catch (error) {
      console.error('Erro ao adicionar hino:', error);
      throw error;
    }
  }

  // Adicionar hino local
  private static async adicionarHinoLocal(unidadeId: string, usuarioId: string, hino: Omit<Hino, 'fonte'>): Promise<void> {
    const hinos = JSON.parse(localStorage.getItem('hinos-personalizados') || '[]');
    
    // Verificar se já existe
    if (hinos.find((h: any) => h.unidadeId === unidadeId && h.numero === hino.numero)) {
      throw new Error('Já existe um hino com este número nesta unidade');
    }
    
    const novoHino = {
      id: Date.now().toString(),
      unidadeId,
      numero: hino.numero,
      titulo: hino.titulo,
      categoria: hino.categoria,
      criadoPor: usuarioId,
      criadoEm: new Date().toISOString()
    };
    
    hinos.push(novoHino);
    localStorage.setItem('hinos-personalizados', JSON.stringify(hinos));
  }

  // Remover hino personalizado
  static async removerHino(unidadeId: string, numero: number): Promise<void> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.removerHinoLocal(unidadeId, numero);
    }

    try {
      const { error } = await supabase
        .from('hinos_personalizados')
        .delete()
        .eq('unidade_id', unidadeId)
        .eq('numero', numero);

      if (error) {
        throw new Error('Erro ao remover hino personalizado');
      }
    } catch (error) {
      console.error('Erro ao remover hino:', error);
      throw error;
    }
  }

  // Remover hino local
  private static async removerHinoLocal(unidadeId: string, numero: number): Promise<void> {
    const hinos = JSON.parse(localStorage.getItem('hinos-personalizados') || '[]');
    const novosHinos = hinos.filter((hino: any) => 
      !(hino.unidadeId === unidadeId && hino.numero === numero)
    );
    localStorage.setItem('hinos-personalizados', JSON.stringify(novosHinos));
  }
}