export class AtaService {
  // ... buscarAtas, buscarAtasLocal, formatarAtas (já existentes)

  /**
   * Cadastra uma nova ata no Supabase.
   */
  static async cadastrarAta(novaAta: Omit<Ata, 'id'>): Promise<Ata> {
    const { data, error } = await supabase
      .from('atas')
      .insert([novaAta])
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar ata:', error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Atualiza uma ata existente.
   */
  static async atualizarAta(id: string, atualizacoes: Partial<Ata>): Promise<Ata> {
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
  }

  /**
   * Remove uma ata por ID.
   */
  static async removerAta(id: string): Promise<void> {
    const { error } = await supabase
      .from('atas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover ata:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Salva atas localmente (para offline).
   */
  static salvarAtasLocal(unidadeId: string, atas: Ata[]): void {
    localStorage.setItem(`atas_${unidadeId}`, JSON.stringify(atas));
  }

  /**
   * (Opcional) Sincroniza as atas locais com o Supabase.
   */
  static async sincronizarAtasLocalComSupabase(unidadeId: string): Promise<void> {
    const atasLocais = this.buscarAtasLocal(unidadeId);
    for (const ata of atasLocais) {
      try {
        await this.cadastrarAta(ata); // cuidado com duplicação
      } catch (e) {
        console.warn(`Falha ao sincronizar ata ${ata.id}:`, e);
      }
    }

    // Limpa o localStorage após sincronizar (se quiser)
    localStorage.removeItem(`atas_${unidadeId}`);
  }
}
