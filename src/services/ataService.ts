import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Ata, FormData } from '../types';

export class AtaService {
  // Buscar todas as atas da unidade do usuário
  static async buscarAtas(unidadeId: string): Promise<Ata[]> {
    // Se Supabase não estiver disponível, usar sistema local
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
        throw new Error('Erro ao buscar atas');
      }

      return this.formatarAtas(atas || []);
    } catch (error) {
      console.error('Erro ao buscar atas:', error);
      throw error;
    }
  }

  // Buscar atas local
  private static async buscarAtasLocal(unidadeId: string): Promise<Ata[]> {
    const atas = JSON.parse(localStorage.getItem('atas-sacramentais') || '[]');
    return atas
      .filter((ata: any) => ata.unidadeId === unidadeId)
      .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  // Buscar uma ata específica
  static async buscarAta(id: string): Promise<Ata | null> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.buscarAtaLocal(id);
    }

    try {
      const { data: ata, error } = await supabase
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
        .eq('id', id)
        .single();

      if (error || !ata) {
        return null;
      }

      return this.formatarAta(ata);
    } catch (error) {
      console.error('Erro ao buscar ata:', error);
      return null;
    }
  }

  // Buscar ata local
  private static async buscarAtaLocal(id: string): Promise<Ata | null> {
    const atas = JSON.parse(localStorage.getItem('atas-sacramentais') || '[]');
    return atas.find((ata: any) => ata.id === id) || null;
  }

  // Criar nova ata
  static async criarAta(dadosAta: FormData, unidadeId: string, usuarioId: string): Promise<string> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.criarAtaLocal(dadosAta, unidadeId, usuarioId);
    }

    try {
      // Inserir ata principal
      const { data: ata, error: ataError } = await supabase
        .from('atas')
        .insert({
          unidade_id: unidadeId,
          tipo: dadosAta.tipo,
          data: dadosAta.data,
          estaca: dadosAta.estaca,
          ala: dadosAta.ala,
          horario: dadosAta.horario,
          presidida_por: dadosAta.presidida_por,
          dirigida_por: dadosAta.dirigida_por,
          oracao_inicial: dadosAta.oracao_inicial,
          oracao_final: dadosAta.oracao_final,
          recepcionista: dadosAta.recepcionista,
          frequencia: dadosAta.frequencia,
          regente: dadosAta.regente,
          pianista_organista: dadosAta.pianista_organista,
          boas_vindas_reconhecimentos: dadosAta.boas_vindas_reconhecimentos,
          anuncios: dadosAta.anuncios,
          hino_abertura: dadosAta.hino_abertura,
          primeira_oracao: dadosAta.primeira_oracao,
          ordenancas_desobrigacoes_apoios: dadosAta.ordenancas_desobrigacoes_apoios,
          hino_sacramental: dadosAta.hino_sacramental,
          primeiro_orador: dadosAta.primeiro_orador,
          segundo_orador: dadosAta.segundo_orador,
          interludio_musical: dadosAta.interludio_musical,
          ultimo_orador: dadosAta.ultimo_orador,
          ultimo_hino: dadosAta.ultimo_hino,
          ultima_oracao: dadosAta.ultima_oracao,
          apresentacao_final: dadosAta.apresentacao_final,
          agradecimentos_despedidas: dadosAta.agradecimentos_despedidas,
          proxima_reuniao: dadosAta.proxima_reuniao,
          mensagem_pensamento: dadosAta.mensagem_pensamento,
          observacoes: dadosAta.observacoes,
          criado_por: usuarioId
        })
        .select()
        .single();

      if (ataError || !ata) {
        throw new Error('Erro ao criar ata');
      }

      // Inserir dados relacionados
      await this.inserirDadosRelacionados(ata.id, dadosAta);

      return ata.id;
    } catch (error) {
      console.error('Erro ao criar ata:', error);
      throw error;
    }
  }

  // Criar ata local
  private static async criarAtaLocal(dadosAta: FormData, unidadeId: string, usuarioId: string): Promise<string> {
    const atas = JSON.parse(localStorage.getItem('atas-sacramentais') || '[]');
    
    const novaAta = {
      id: Date.now().toString(),
      unidadeId,
      ...dadosAta,
      criado_em: new Date().toISOString(),
      criado_por: usuarioId
    };
    
    atas.unshift(novaAta);
    localStorage.setItem('atas-sacramentais', JSON.stringify(atas));
    
    return novaAta.id;
  }

  // Atualizar ata existente
  static async atualizarAta(id: string, dadosAta: FormData): Promise<void> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.atualizarAtaLocal(id, dadosAta);
    }

    try {
      // Atualizar ata principal
      const { error: ataError } = await supabase
        .from('atas')
        .update({
          tipo: dadosAta.tipo,
          data: dadosAta.data,
          estaca: dadosAta.estaca,
          ala: dadosAta.ala,
          horario: dadosAta.horario,
          presidida_por: dadosAta.presidida_por,
          dirigida_por: dadosAta.dirigida_por,
          oracao_inicial: dadosAta.oracao_inicial,
          oracao_final: dadosAta.oracao_final,
          recepcionista: dadosAta.recepcionista,
          frequencia: dadosAta.frequencia,
          regente: dadosAta.regente,
          pianista_organista: dadosAta.pianista_organista,
          boas_vindas_reconhecimentos: dadosAta.boas_vindas_reconhecimentos,
          anuncios: dadosAta.anuncios,
          hino_abertura: dadosAta.hino_abertura,
          primeira_oracao: dadosAta.primeira_oracao,
          ordenancas_desobrigacoes_apoios: dadosAta.ordenancas_desobrigacoes_apoios,
          hino_sacramental: dadosAta.hino_sacramental,
          primeiro_orador: dadosAta.primeiro_orador,
          segundo_orador: dadosAta.segundo_orador,
          interludio_musical: dadosAta.interludio_musical,
          ultimo_orador: dadosAta.ultimo_orador,
          ultimo_hino: dadosAta.ultimo_hino,
          ultima_oracao: dadosAta.ultima_oracao,
          apresentacao_final: dadosAta.apresentacao_final,
          agradecimentos_despedidas: dadosAta.agradecimentos_despedidas,
          proxima_reuniao: dadosAta.proxima_reuniao,
          mensagem_pensamento: dadosAta.mensagem_pensamento,
          observacoes: dadosAta.observacoes
        })
        .eq('id', id);

      if (ataError) {
        throw new Error('Erro ao atualizar ata');
      }

      // Remover dados relacionados existentes
      await this.removerDadosRelacionados(id);

      // Inserir novos dados relacionados
      await this.inserirDadosRelacionados(id, dadosAta);
    } catch (error) {
      console.error('Erro ao atualizar ata:', error);
      throw error;
    }
  }

  // Atualizar ata local
  private static async atualizarAtaLocal(id: string, dadosAta: FormData): Promise<void> {
    const atas = JSON.parse(localStorage.getItem('atas-sacramentais') || '[]');
    
    const index = atas.findIndex((ata: any) => ata.id === id);
    if (index !== -1) {
      atas[index] = { ...atas[index], ...dadosAta };
      localStorage.setItem('atas-sacramentais', JSON.stringify(atas));
    }
  }

  // Excluir ata
  static async excluirAta(id: string): Promise<void> {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.excluirAtaLocal(id);
    }

    try {
      const { error } = await supabase
        .from('atas')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Erro ao excluir ata');
      }
    } catch (error) {
      console.error('Erro ao excluir ata:', error);
      throw error;
    }
  }

  // Excluir ata local
  private static async excluirAtaLocal(id: string): Promise<void> {
    const atas = JSON.parse(localStorage.getItem('atas-sacramentais') || '[]');
    const novasAtas = atas.filter((ata: any) => ata.id !== id);
    localStorage.setItem('atas-sacramentais', JSON.stringify(novasAtas));
  }

  // Métodos auxiliares privados
  private static async inserirDadosRelacionados(ataId: string, dadosAta: FormData) {
    // Inserir participantes
    if (dadosAta.participantes.length > 0) {
      const participantes = dadosAta.participantes.map(p => ({
        ata_id: ataId,
        nome: p.nome,
        cargo: p.cargo,
        presente: p.presente
      }));

      await supabase.from('participantes').insert(participantes);
    }

    // Inserir assuntos discutidos
    if (dadosAta.assuntos_discutidos.length > 0) {
      const assuntos = dadosAta.assuntos_discutidos.map(a => ({
        ata_id: ataId,
        titulo: a.titulo,
        descricao: a.descricao,
        responsavel: a.responsavel
      }));

      await supabase.from('assuntos_discutidos').insert(assuntos);
    }

    // Inserir decisões tomadas
    if (dadosAta.decisoes_tomadas.length > 0) {
      const decisoes = dadosAta.decisoes_tomadas.map(d => ({
        ata_id: ataId,
        decisao: d.decisao,
        justificativa: d.justificativa,
        votacao: d.votacao
      }));

      await supabase.from('decisoes_tomadas').insert(decisoes);
    }

    // Inserir ações designadas
    if (dadosAta.acoes_designadas.length > 0) {
      const acoes = dadosAta.acoes_designadas.map(a => ({
        ata_id: ataId,
        acao: a.acao,
        responsavel: a.responsavel,
        prazo: a.prazo,
        status: a.status
      }));

      await supabase.from('acoes_designadas').insert(acoes);
    }

    // Inserir desobrigações
    if (dadosAta.desobrigacoes.length > 0) {
      const desobrigacoes = dadosAta.desobrigacoes.map(d => ({
        ata_id: ataId,
        nome: d.nome,
        acao: d.acao,
        posicao: d.posicao
      }));

      await supabase.from('desobrigacoes').insert(desobrigacoes);
    }

    // Inserir confirmações
    if (dadosAta.confirmacoes.length > 0) {
      const confirmacoes = dadosAta.confirmacoes.map(c => ({
        ata_id: ataId,
        nome: c.nome,
        confirmado_por: c.confirmado_por
      }));

      await supabase.from('confirmacoes').insert(confirmacoes);
    }

    // Inserir ordenações ao sacerdócio
    if (dadosAta.ordenacoes_sacerdocio.length > 0) {
      const ordenacoes = dadosAta.ordenacoes_sacerdocio.map(o => ({
        ata_id: ataId,
        nome: o.nome,
        sacerdocio: o.sacerdocio,
        oficio: o.oficio,
        ordenado_por: o.ordenado_por
      }));

      await supabase.from('ordenacoes_sacerdocio').insert(ordenacoes);
    }

    // Inserir bênção de crianças
    if (dadosAta.bencao_criancas.length > 0) {
      const bencaos = dadosAta.bencao_criancas.map(b => ({
        ata_id: ataId,
        nome: b.nome,
        data_nascimento: b.data_nascimento,
        abencoado_por: b.abencoado_por
      }));

      await supabase.from('bencao_criancas').insert(bencaos);
    }
  }

  private static async removerDadosRelacionados(ataId: string) {
    const tabelas = [
      'participantes',
      'assuntos_discutidos',
      'decisoes_tomadas',
      'acoes_designadas',
      'desobrigacoes',
      'confirmacoes',
      'ordenacoes_sacerdocio',
      'bencao_criancas'
    ];

    for (const tabela of tabelas) {
      await supabase.from(tabela).delete().eq('ata_id', ataId);
    }
  }

  private static formatarAtas(atas: any[]): Ata[] {
    return atas.map(ata => this.formatarAta(ata));
  }

  private static formatarAta(ata: any): Ata {
    return {
      id: ata.id,
      tipo: ata.tipo,
      data: ata.data,
      estaca: ata.estaca,
      ala: ata.ala,
      horario: ata.horario,
      presidida_por: ata.presidida_por,
      dirigida_por: ata.dirigida_por,
      oracao_inicial: ata.oracao_inicial,
      oracao_final: ata.oracao_final,
      recepcionista: ata.recepcionista,
      frequencia: ata.frequencia,
      regente: ata.regente,
      pianista_organista: ata.pianista_organista,
      boas_vindas_reconhecimentos: ata.boas_vindas_reconhecimentos,
      anuncios: ata.anuncios,
      hino_abertura: ata.hino_abertura,
      primeira_oracao: ata.primeira_oracao,
      ordenancas_desobrigacoes_apoios: ata.ordenancas_desobrigacoes_apoios,
      hino_sacramental: ata.hino_sacramental,
      primeiro_orador: ata.primeiro_orador,
      segundo_orador: ata.segundo_orador,
      interludio_musical: ata.interludio_musical,
      ultimo_orador: ata.ultimo_orador,
      ultimo_hino: ata.ultimo_hino,
      ultima_oracao: ata.ultima_oracao,
      apresentacao_final: ata.apresentacao_final,
      agradecimentos_despedidas: ata.agradecimentos_despedidas,
      proxima_reuniao: ata.proxima_reuniao,
      mensagem_pensamento: ata.mensagem_pensamento,
      observacoes: ata.observacoes || '',
      participantes: ata.participantes || [],
      assuntos_discutidos: ata.assuntos_discutidos || [],
      decisoes_tomadas: ata.decisoes_tomadas || [],
      acoes_designadas: ata.acoes_designadas || [],
      desobrigacoes: ata.desobrigacoes || [],
      confirmacoes: ata.confirmacoes || [],
      ordenacoes_sacerdocio: ata.ordenacoes_sacerdocio || [],
      bencao_criancas: ata.bencao_criancas || [],
      criado_em: ata.created_at,
      criado_por: ata.criado_por
    };
  }
}