static async buscarAtas(unidadeId: string): Promise<Ata[]> {
  if (!isSupabaseAvailable || !supabase) {
    return this.buscarAtasLocal(unidadeId);
  }

  try {
    const { data: atas, error } = await supabase
      .from('atas')
      .select(`
        *,
        participantes (*),
        assuntos_discutidos (*),
        decisoes_tomadas (*),
        acoes_designadas (*),
        desobrigacoes (*),
        confirmacoes (*),
        ordenacoes_sacerdocio (*),
        bencao_criancas (*)
      `)
      .eq('unidade_id', unidadeId)
      .order('data', { ascending: false });

    if (error) {
      console.error('Erro detalhado do Supabase:', error);
      throw new Error(`Erro ao buscar atas: ${error.message}`);
    }

    return this.formatarAtas(atas || []);
  } catch (error) {
    console.error('Erro inesperado ao buscar atas:', error);
    throw new Error(`Erro inesperado ao buscar atas: ${(error as Error).message}`);
  }
}
