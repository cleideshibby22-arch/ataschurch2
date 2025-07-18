import { Usuario, Unidade, UsuarioUnidade } from '../types';
import { AuthService } from '../services/authService';

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

export const getUsuarioLogado = (): Usuario | null => {
  try {
    const usuarioString = localStorage.getItem('usuario-logado');
    if (!usuarioString) return null;
    return JSON.parse(usuarioString);
  } catch (error) {
    console.error('Erro ao obter usuário logado:', error);
    return null;
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
  localStorage.setItem('usuario-logado', JSON.stringify(usuario));
};

export const logout = (): void => {
  localStorage.removeItem('usuario-logado');
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