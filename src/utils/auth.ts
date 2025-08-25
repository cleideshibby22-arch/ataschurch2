import { Usuario, Unidade, UsuarioUnidade } from '../types';
import { AuthService } from '../services/authService';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

export const getUsuarioLogado = (): Usuario | null => {
  try {
    // Primeiro tentar localStorage
    const localData = localStorage.getItem('usuario-logado');
    if (localData) {
      return JSON.parse(localData) as Usuario;
    }
    
    // Fallback para sessionStorage
    const sessionData = sessionStorage.getItem('usuario-logado');
    if (sessionData) {
      const userData = JSON.parse(sessionData) as Usuario;
      // Salvar no localStorage para próximas sessões
      localStorage.setItem('usuario-logado', sessionData);
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter usuário logado:', error);
    return null;
  }
};

// Função para sincronizar dados com servidor simulado
const syncWithServer = async (data: any, action: 'save' | 'load') => {
  try {
    if (action === 'save') {
      // Em produção, isso seria uma chamada para API
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } else {
      // Em produção, isso carregaria dados do servidor
      const response = await fetch('/api/sync');
      return response.ok ? await response.json() : null;
    }
  } catch (error) {
    // Fallback para localStorage se não houver servidor
    return null;
  }
};

// Função para carregar dados de múltiplas fontes
const loadFromMultipleSources = (key: string) => {
  try {
    // Primeiro tenta localStorage
    const localData = localStorage.getItem(key);
    if (localData) {
      return JSON.parse(localData);
    }
    
    // Se não encontrar, tenta sessionStorage
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) {
      const data = JSON.parse(sessionData);
      // Salva no localStorage para próximas sessões
      localStorage.setItem(key, sessionData);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return null;
  }
};

// Função para salvar em múltiplas fontes
export const saveToMultipleSources = (key: string, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    sessionStorage.setItem(key, jsonData);
    
    // Tenta sincronizar com servidor (simulado)
    syncWithServer({ key, data }, 'save').catch(() => {
      // Ignora erro de sincronização
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
};


export const getUnidadeAtual = (): Unidade | null => {
  try {
    const usuario = getUsuarioLogado();
    if (!usuario) return null;
    
    // Em um sistema com Supabase, as informações da unidade viriam do backend
    // Por enquanto, retornamos dados básicos baseados no usuário
    return {
      id: usuario.unidadeId,
      nome: usuario.nomeUnidade,
      tipo: usuario.tipoUnidade,
      logo: usuario.logoUnidade,
      ativa: true,
      proprietarioId: usuario.id,
      dataCriacao: usuario.dataCadastro
    };
  } catch (error) {
    console.error('Erro ao obter unidade atual:', error);
    return null;
  }
};

export const getUnidadesDoUsuario = (email: string): Unidade[] => {
  try {
    const usuarios = (loadFromMultipleSources('usuarios') || []) as Usuario[];
    const usuarioUnidades = (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[];
    const unidades = (loadFromMultipleSources('unidades') || []) as Unidade[];
    
    const usuario = usuarios.find((u: Usuario) => u.email === email);
    if (!usuario) return [];
    
    const unidadesDoUsuario = usuarioUnidades
      .filter((uu: UsuarioUnidade) => uu.usuarioId === usuario.id)
      .map((uu: UsuarioUnidade) => unidades.find((u: Unidade) => u.id === uu.unidadeId))
      .filter(Boolean)
      .filter((u: Unidade | undefined) => u && u.ativa !== false) as Unidade[];
    
    return unidadesDoUsuario;
  } catch (error) {
    console.error('Erro ao obter unidades do usuário:', error);
    return [];
  }
};

export const criarUnidade = (dadosUnidade: Omit<Unidade, 'id' | 'dataCriacao'>): Unidade => {
  const novaUnidade: Unidade = {
    ...dadosUnidade,
    id: Date.now().toString(),
    dataCriacao: new Date().toISOString()
  };
  
  const unidades = (loadFromMultipleSources('unidades') || []) as Unidade[];
  unidades.push(novaUnidade);
  saveToMultipleSources('unidades', unidades);
  
  return novaUnidade;
};

export const adicionarUsuarioNaUnidade = (usuarioId: string, unidadeId: string, dados: Omit<UsuarioUnidade, 'usuarioId' | 'unidadeId'>): void => {
  const usuarioUnidades = (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[];
  
  const novaRelacao: UsuarioUnidade = {
    usuarioId,
    unidadeId,
    ...dados
  };
  
  usuarioUnidades.push(novaRelacao);
  saveToMultipleSources('usuario-unidades', usuarioUnidades);
};

export const setUsuarioLogado = (usuario: Usuario): void => {
  // Esta função agora é gerenciada pelo AuthContext
  console.warn('setUsuarioLogado foi movido para AuthContext. Use useAuth().setUsuarioLogado');
};

export const logout = (): void => {
  // Esta função agora é gerenciada pelo AuthContext
  console.warn('logout foi movido para AuthContext. Use useAuth().logout');
};

export const isAdministrador = (usuario: Usuario | null): boolean => {
  return usuario?.tipo === 'administrador' || false;
};

export const isProprietarioSistema = (usuario: Usuario | null): boolean => {
  return usuario?.email === 'admin@sistema.com' || false;
};

export const temPermissao = (usuario: Usuario | null, permissao: keyof Usuario['permissoes']): boolean => {
  return usuario?.permissoes[permissao] || false;
};

export const podeGerenciarUsuarios = (usuario: Usuario | null): boolean => {
  return usuario?.tipo === 'administrador' || 
         usuario?.permissoes?.gerenciarUsuarios || 
         isProprietarioSistema(usuario);
};

export const podeVerTodasAtas = (usuario: Usuario | null): boolean => {
  return usuario?.tipo === 'administrador' || 
         usuario?.permissoes?.verTodasAtas || 
         isProprietarioSistema(usuario);
};

export const getChamadoDoUsuario = (usuario: Usuario | null): string | null => {
  // Em um sistema real, isso viria do relacionamento usuario_unidades
  // Por enquanto, retornamos null para acesso geral
  return null;
};

export const limparTodosDados = (): void => {
  localStorage.removeItem('usuario-logado');
  sessionStorage.removeItem('usuario-logado');
  
  const keys = ['usuarios', 'unidades', 'usuario-unidades', 'atas-sacramentais', 'hinos-personalizados'];
  keys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const enviarCodigoRecuperacao = async (email: string): Promise<{ sucesso: boolean; codigo?: string; erro?: string }> => {
  try {
    return await AuthService.recuperarSenha(email);
  } catch (error) {
    console.error('Erro ao enviar código de recuperação:', error);
    return { sucesso: false, erro: error instanceof Error ? error.message : 'Erro interno do sistema' };
  }
};

export const verificarCodigoRecuperacao = (email: string, codigo: string): { valido: boolean; erro?: string } => {
  try {
    const dadosCodigo = loadFromMultipleSources('codigo-recuperacao');
    
    if (!dadosCodigo) {
      return { valido: false, erro: 'Nenhum código de recuperação encontrado' };
    }
    
    // Verificar se o código expirou
    if (Date.now() > dadosCodigo.expiresAt) {
      localStorage.removeItem('codigo-recuperacao');
      sessionStorage.removeItem('codigo-recuperacao');
      return { valido: false, erro: 'Código expirado. Solicite um novo código.' };
    }
    
    // Verificar email e código
    if (dadosCodigo.email !== email || dadosCodigo.codigo !== codigo) {
      return { valido: false, erro: 'Código inválido' };
    }
    
    return { valido: true };
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return { valido: false, erro: 'Erro interno do sistema' };
  }
};

export const alterarSenhaComCodigo = (email: string, codigo: string, novaSenha: string): { sucesso: boolean; erro?: string } => {
  try {
    // Por enquanto, mantemos a lógica simples
    // Em produção, isso seria feito através do AuthService
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return { sucesso: false, erro: 'Erro interno do sistema' };
  }
};

// Função para importar dados de outro navegador
export const importarDadosDeOutroNavegador = (dadosExportados: string): { sucesso: boolean; erro?: string } => {
  try {
    const dados = JSON.parse(dadosExportados);
    
    // Validar estrutura dos dados
    if (!dados.usuarios || !dados.unidades || !dados.usuarioUnidades) {
      return { sucesso: false, erro: 'Dados inválidos ou corrompidos' };
    }
    
    // Importar dados
    saveToMultipleSources('usuarios', dados.usuarios);
    saveToMultipleSources('unidades', dados.unidades);
    saveToMultipleSources('usuario-unidades', dados.usuarioUnidades);
    
    if (dados.atas) {
      saveToMultipleSources('atas-sacramentais', dados.atas);
    }
    
    if (dados.hinos) {
      saveToMultipleSources('hinos-personalizados', dados.hinos);
    }
    
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return { sucesso: false, erro: 'Erro ao processar dados importados' };
  }
};

// Função para exportar dados para outro navegador
export const exportarDadosParaOutroNavegador = () => {
  try {
    const dados = {
      usuarios: (loadFromMultipleSources('usuarios') || []) as Usuario[],
      unidades: (loadFromMultipleSources('unidades') || []) as Unidade[],
      usuarioUnidades: (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[],
      atas: loadFromMultipleSources('atas-sacramentais') || [],
      hinos: loadFromMultipleSources('hinos-personalizados') || [],
      exportadoEm: new Date().toISOString(),
      versao: '1.0'
    };
    
    return JSON.stringify(dados);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return null;
  }
};

// Função para excluir unidade (apenas para proprietário do sistema)
export const excluirUnidadeCompleta = (unidadeId: string): { sucesso: boolean; erro?: string } => {
  try {
    // Verificar se há usuários na unidade
    const usuarioUnidades = (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[];
    const usuariosNaUnidade = usuarioUnidades.filter(uu => uu.unidadeId === unidadeId);
    
    // Remover todas as relações usuário-unidade
    const novasRelacoes = usuarioUnidades.filter(uu => uu.unidadeId !== unidadeId);
    saveToMultipleSources('usuario-unidades', novasRelacoes);

    // Remover atas da unidade
    const atas = loadFromMultipleSources('atas-sacramentais') || [];
    const novasAtas = atas.filter((ata: any) => ata.unidadeId !== unidadeId);
    saveToMultipleSources('atas-sacramentais', novasAtas);

    // Remover hinos personalizados da unidade
    const hinos = loadFromMultipleSources('hinos-personalizados') || [];
    const novosHinos = hinos.filter((hino: any) => hino.unidadeId !== unidadeId);
    saveToMultipleSources('hinos-personalizados', novosHinos);

    // Remover a unidade
    const unidades = (loadFromMultipleSources('unidades') || []) as Unidade[];
    const novasUnidades = unidades.filter(u => u.id !== unidadeId);
    saveToMultipleSources('unidades', novasUnidades);

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao excluir unidade:', error);
    return { sucesso: false, erro: 'Erro interno do sistema' };
  }
};

// Função para excluir usuário globalmente (apenas para proprietário do sistema)
export const excluirUsuarioGlobal = (usuarioId: string): { sucesso: boolean; erro?: string } => {
  try {
    // Remover todas as relações usuário-unidade
    const usuarioUnidades = (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[];
    const novasRelacoes = usuarioUnidades.filter(uu => uu.usuarioId !== usuarioId);
    saveToMultipleSources('usuario-unidades', novasRelacoes);

    // Remover o usuário
    const usuarios = (loadFromMultipleSources('usuarios') || []) as Usuario[];
    const novosUsuarios = usuarios.filter(u => u.id !== usuarioId);
    saveToMultipleSources('usuarios', novosUsuarios);

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return { sucesso: false, erro: 'Erro interno do sistema' };
  }
};

// Função para obter estatísticas detalhadas de uma unidade
export const obterEstatisticasUnidade = (unidadeId: string) => {
  try {
    const usuarioUnidades = (loadFromMultipleSources('usuario-unidades') || []) as UsuarioUnidade[];
    const atas = loadFromMultipleSources('atas-sacramentais') || [];
    const hinos = loadFromMultipleSources('hinos-personalizados') || [];
    
    const usuariosNaUnidade = usuarioUnidades.filter(uu => uu.unidadeId === unidadeId).length;
    const atasNaUnidade = atas.filter((ata: any) => ata.unidadeId === unidadeId).length;
    const hinosNaUnidade = hinos.filter((hino: any) => hino.unidadeId === unidadeId).length;
    
    return {
      usuarios: usuariosNaUnidade,
      atas: atasNaUnidade,
      hinos: hinosNaUnidade
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas da unidade:', error);
    return { usuarios: 0, atas: 0, hinos: 0 };
  }
};