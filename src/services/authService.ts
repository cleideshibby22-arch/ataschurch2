import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Usuario, Unidade } from '../types';

export class AuthService {
  // Fazer login usando Supabase Auth
  static async login(email: string, senha: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.loginLocal(email, senha);
    }

    try {
      // Usar Supabase Auth para autenticação
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        console.warn('Erro de autenticação no Supabase:', authError);
        return this.loginLocal(email, senha);
      }

      if (!authData.user) {
        throw new Error('Credenciais inválidas');
      }

      // Buscar dados do usuário na tabela usuarios
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (userError || !usuario) {
        console.warn('Erro ao buscar dados do usuário:', userError);
        return this.loginLocal(email, senha);
      }

      // Buscar unidades do usuário
      const { data: usuarioUnidades, error: unidadesError } = await supabase
        .from('usuario_unidades')
        .select(`
          *,
          unidades (*)
        `)
        .eq('usuario_id', usuario.id);

      if (unidadesError) {
        console.warn('Erro ao carregar unidades do Supabase, tentando login local:', unidadesError);
        return this.loginLocal(email, senha);
      }

      return {
        usuario,
        unidades: usuarioUnidades || []
      };
    } catch (error) {
      console.error('Erro no login:', error);
      // Para outros erros, tentar fallback local
      console.warn('Erro no login do Supabase, tentando login local...');
      return this.loginLocal(email, senha);
    }
  }

  // Login usando sistema local (localStorage) - fallback
  private static async loginLocal(email: string, senha: string) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
    const unidades = JSON.parse(localStorage.getItem('unidades') || '[]');

    const usuario = usuarios.find((u: any) => u.email === email && u.senha === senha);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    const unidadesDoUsuario = usuarioUnidades
      .filter((uu: any) => uu.usuarioId === usuario.id)
      .map((uu: any) => {
        const unidade = unidades.find((u: any) => u.id === uu.unidadeId);
        return {
          ...uu,
          unidades: unidade
        };
      });

    return {
      usuario,
      unidades: unidadesDoUsuario
    };
  }

  // Cadastrar novo usuário usando Supabase Auth
  static async cadastrar(dadosUsuario: any, dadosUnidade: any) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.cadastrarLocal(dadosUsuario, dadosUnidade);
    }

    try {
      // Primeiro, criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
        options: {
          emailRedirectTo: undefined // Desabilitar confirmação por email
        }
      });

      if (authError) {
        console.warn('Erro ao criar usuário no Supabase Auth:', authError);
        return this.cadastrarLocal(dadosUsuario, dadosUnidade);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      const usuarioId = authData.user.id;

      // Criar usuário na tabela usuarios (sem senha)
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          id: usuarioId,
          email: dadosUsuario.email,
          nome_usuario: dadosUsuario.nomeUsuario,
          telefone: dadosUsuario.telefone,
          foto_usuario: dadosUsuario.fotoUsuario
        })
        .select()
        .single();

      if (usuarioError || !usuario) {
        console.warn('Erro ao criar perfil do usuário no Supabase:', usuarioError);
        return this.cadastrarLocal(dadosUsuario, dadosUnidade);
      }

      // Criar unidade
      const { data: unidade, error: unidadeError } = await supabase
        .from('unidades')
        .insert({
          nome: dadosUnidade.nome,
          tipo: dadosUnidade.tipo,
          logo: dadosUnidade.logo,
          ativa: true,
          proprietario_id: usuarioId
        })
        .select()
        .single();

      if (unidadeError || !unidade) {
        console.warn('Erro ao criar unidade no Supabase, usando cadastro local:', unidadeError);
        return this.cadastrarLocal(dadosUsuario, dadosUnidade);
      }

      // Criar relacionamento usuário-unidade
      const { error: relacaoError } = await supabase
        .from('usuario_unidades')
        .insert({
          usuario_id: usuario.id,
          unidade_id: unidade.id,
          cargo: dadosUsuario.cargo,
          tipo: 'administrador',
          permissoes: {
            criarAta: true,
            editarAta: true,
            excluirAta: true,
            gerenciarUsuarios: true,
            gerenciarSistema: true,
            verTodasAtas: true,
            verAtasPorChamado: true
          }
        });

      if (relacaoError) {
        console.warn('Erro ao criar relacionamento no Supabase, usando cadastro local:', relacaoError);
        return this.cadastrarLocal(dadosUsuario, dadosUnidade);
      }

      return { usuario, unidade };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      // Para outros erros, usar cadastro local
      console.warn('Erro no cadastro do Supabase, usando cadastro local...');
      return this.cadastrarLocal(dadosUsuario, dadosUnidade);
    }
  }

  // Cadastro usando sistema local - fallback
  private static async cadastrarLocal(dadosUsuario: any, dadosUnidade: any) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const unidades = JSON.parse(localStorage.getItem('unidades') || '[]');
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');

    // Verificar se email já existe
    if (usuarios.find((u: any) => u.email === dadosUsuario.email)) {
      throw new Error('Email já cadastrado');
    }

    // Criar unidade
    const novaUnidade = {
      id: Date.now().toString(),
      nome: dadosUnidade.nome,
      tipo: dadosUnidade.tipo,
      logo: dadosUnidade.logo,
      ativa: true,
      dataCriacao: new Date().toISOString()
    };

    // Criar usuário
    const novoUsuario = {
      id: (Date.now() + 1).toString(),
      email: dadosUsuario.email,
      senha: dadosUsuario.senha,
      nome_usuario: dadosUsuario.nomeUsuario,
      telefone: dadosUsuario.telefone,
      foto_usuario: dadosUsuario.fotoUsuario,
      data_cadastro: new Date().toISOString()
    };

    // Criar relacionamento
    const novaRelacao = {
      usuarioId: novoUsuario.id,
      unidadeId: novaUnidade.id,
      cargo: dadosUsuario.cargo,
      tipo: 'administrador',
      permissoes: {
        criarAta: true,
        editarAta: true,
        excluirAta: true,
        gerenciarUsuarios: true,
        gerenciarSistema: true,
        verTodasAtas: true,
        verAtasPorChamado: true
      }
    };

    // Salvar dados
    unidades.push(novaUnidade);
    usuarios.push(novoUsuario);
    usuarioUnidades.push(novaRelacao);

    localStorage.setItem('unidades', JSON.stringify(unidades));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuario-unidades', JSON.stringify(usuarioUnidades));

    return { usuario: novoUsuario, unidade: novaUnidade };
  }

  // Logout usando Supabase Auth
  static async logout() {
    if (isSupabaseAvailable && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Erro ao fazer logout do Supabase:', error);
      }
    }
    
    // Limpar dados locais
    localStorage.removeItem('usuario-logado');
  }

  // Verificar se usuário está logado
  static async verificarSessao() {
    if (!isSupabaseAvailable || !supabase) {
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return null;
    }
  }

  // Recuperar senha usando Supabase Auth
  static async recuperarSenha(email: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.recuperarSenhaLocal(email);
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        if (error.message.includes('not found')) {
          throw new Error('Email não encontrado');
        }
        throw new Error('Erro ao enviar email de recuperação');
      }

      return { sucesso: true };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      // Tentar fallback local em caso de erro
      console.warn('Erro na recuperação do Supabase, tentando local...');
      return this.recuperarSenhaLocal(email);
    }
  }

  // Recuperação de senha local - fallback
  private static async recuperarSenhaLocal(email: string) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find((u: any) => u.email === email);

    if (!usuario) {
      throw new Error('Email não encontrado');
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar código temporariamente
    localStorage.setItem('codigo-recuperacao', JSON.stringify({
      email,
      codigo,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos
    }));
    
    return { sucesso: true, codigo };
  }

  // Alterar senha usando Supabase Auth
  static async alterarSenha(novaSenha: string) {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Alteração de senha requer conexão com o servidor');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) {
        throw new Error('Erro ao alterar senha');
      }

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  // Cadastrar usuário em unidade existente
  static async cadastrarUsuarioNaUnidade(
    dadosUsuario: any,
    unidadeId: string,
    tipo: 'administrador' | 'usuario',
    permissoes: any,
    chamado?: string
  ) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.cadastrarUsuarioNaUnidadeLocal(dadosUsuario, unidadeId, tipo, permissoes, chamado);
    }

    try {
      let usuarioId: string;

      // Tentar criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
        options: {
          emailRedirectTo: undefined // Desabilitar confirmação por email
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          // Usuário já existe no Auth, buscar na tabela usuarios
          const { data: usuarioExistente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', dadosUsuario.email)
            .single();

          if (usuarioExistente) {
            usuarioId = usuarioExistente.id;
          } else {
            throw new Error('Usuário existe no sistema de autenticação mas não na base de dados');
          }
        } else {
          throw new Error('Erro ao criar usuário');
        }
      } else if (authData.user) {
        usuarioId = authData.user.id;

        // Criar usuário na tabela usuarios (sem senha)
        const { error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            id: usuarioId,
            email: dadosUsuario.email,
            nome_usuario: dadosUsuario.nomeUsuario,
            telefone: dadosUsuario.telefone,
            foto_usuario: dadosUsuario.fotoUsuario
          });

        if (usuarioError && !usuarioError.message.includes('duplicate key')) {
          throw new Error('Erro ao criar perfil do usuário');
        }
      } else {
        throw new Error('Erro ao criar usuário');
      }

      // Verificar se já existe relacionamento
      const { data: relacaoExistente, error: relacaoCheckError } = await supabase
        .from('usuario_unidades')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('unidade_id', unidadeId)
        .maybeSingle();

      if (relacaoCheckError && relacaoCheckError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar relacionamento existente');
      }

      if (relacaoExistente) {
        throw new Error('Usuário já tem acesso a esta unidade');
      }

      // Criar relacionamento usuário-unidade
      const { error: relacaoError } = await supabase
        .from('usuario_unidades')
        .insert({
          usuario_id: usuarioId,
          unidade_id: unidadeId,
          cargo: dadosUsuario.cargo,
          tipo: tipo,
          permissoes: permissoes,
          chamado: chamado
        });

      if (relacaoError) {
        throw new Error('Erro ao criar relacionamento usuário-unidade');
      }

      return { usuarioId };
    } catch (error) {
      console.error('Erro ao cadastrar usuário na unidade:', error);
      throw error;
    }
  }

  // Cadastro de usuário na unidade local - fallback
  private static async cadastrarUsuarioNaUnidadeLocal(
    dadosUsuario: any,
    unidadeId: string,
    tipo: 'administrador' | 'usuario',
    permissoes: any,
    chamado?: string
  ) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');

    let usuarioId: string;
    const usuarioExistente = usuarios.find((u: any) => u.email === dadosUsuario.email);

    if (usuarioExistente) {
      usuarioId = usuarioExistente.id;
      
      // Verificar se já tem acesso
      const jaTemAcesso = usuarioUnidades.find((uu: any) => 
        uu.usuarioId === usuarioId && uu.unidadeId === unidadeId
      );
      
      if (jaTemAcesso) {
        throw new Error('Usuário já tem acesso a esta unidade');
      }
    } else {
      // Criar novo usuário
      const novoUsuario = {
        id: Date.now().toString(),
        email: dadosUsuario.email,
        senha: dadosUsuario.senha,
        nome_usuario: dadosUsuario.nomeUsuario,
        telefone: dadosUsuario.telefone,
        foto_usuario: dadosUsuario.fotoUsuario,
        data_cadastro: new Date().toISOString()
      };
      
      usuarios.push(novoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      usuarioId = novoUsuario.id;
    }

    // Criar relacionamento
    const novaRelacao = {
      usuarioId,
      unidadeId,
      cargo: dadosUsuario.cargo,
      tipo,
      permissoes,
      chamado
    };

    usuarioUnidades.push(novaRelacao);
    localStorage.setItem('usuario-unidades', JSON.stringify(usuarioUnidades));

    return { usuarioId };
  }

  // Buscar usuários da unidade
  static async buscarUsuariosDaUnidade(unidadeId: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.buscarUsuariosDaUnidadeLocal(unidadeId);
    }

    try {
      const { data: usuarioUnidades, error } = await supabase
        .from('usuario_unidades')
        .select(`
          *,
          usuarios (*)
        `)
        .eq('unidade_id', unidadeId);

      if (error) {
        throw new Error('Erro ao buscar usuários da unidade');
      }

      return usuarioUnidades || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  // Buscar usuários da unidade local - fallback
  private static async buscarUsuariosDaUnidadeLocal(unidadeId: string) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');

    return usuarioUnidades
      .filter((uu: any) => uu.unidadeId === unidadeId)
      .map((uu: any) => {
        const usuario = usuarios.find((u: any) => u.id === uu.usuarioId);
        return {
          ...uu,
          usuarios: usuario
        };
      });
  }

  // Atualizar permissões do usuário
  static async atualizarPermissoes(usuarioId: string, unidadeId: string, novasPermissoes: any, novoChamado?: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.atualizarPermissoesLocal(usuarioId, unidadeId, novasPermissoes, novoChamado);
    }

    try {
      const { error } = await supabase
        .from('usuario_unidades')
        .update({
          permissoes: novasPermissoes,
          chamado: novoChamado
        })
        .eq('usuario_id', usuarioId)
        .eq('unidade_id', unidadeId);

      if (error) {
        throw new Error('Erro ao atualizar permissões');
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  // Atualizar permissões local - fallback
  private static async atualizarPermissoesLocal(usuarioId: string, unidadeId: string, novasPermissoes: any, novoChamado?: string) {
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
    
    const index = usuarioUnidades.findIndex((uu: any) => 
      uu.usuarioId === usuarioId && uu.unidadeId === unidadeId
    );
    
    if (index !== -1) {
      usuarioUnidades[index].permissoes = novasPermissoes;
      if (novoChamado !== undefined) {
        usuarioUnidades[index].chamado = novoChamado;
      }
      localStorage.setItem('usuario-unidades', JSON.stringify(usuarioUnidades));
    }
  }

  // Remover usuário da unidade
  static async removerUsuarioDaUnidade(usuarioId: string, unidadeId: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.removerUsuarioDaUnidadeLocal(usuarioId, unidadeId);
    }

    try {
      const { error } = await supabase
        .from('usuario_unidades')
        .delete()
        .eq('usuario_id', usuarioId)
        .eq('unidade_id', unidadeId);

      if (error) {
        throw new Error('Erro ao remover usuário da unidade');
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      throw error;
    }
  }

  // Remover usuário da unidade local - fallback
  private static async removerUsuarioDaUnidadeLocal(usuarioId: string, unidadeId: string) {
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
    
    const novasRelacoes = usuarioUnidades.filter((uu: any) => 
      !(uu.usuarioId === usuarioId && uu.unidadeId === unidadeId)
    );
    
    localStorage.setItem('usuario-unidades', JSON.stringify(novasRelacoes));
  }

  // Obter usuário atual da sessão
  static async obterUsuarioAtual() {
    if (!isSupabaseAvailable || !supabase) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Buscar dados completos do usuário
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return usuario;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
}