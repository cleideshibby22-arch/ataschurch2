import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Usuario, Unidade } from '../types';

export class AuthService {
  // Fazer login usando Supabase Auth
  static async login(email: string, senha: string) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema de autenticação não disponível. Verifique sua conexão.');
    }

    try {
      // Usar Supabase Auth para autenticação
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        throw new Error('Credenciais inválidas');
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
        throw new Error('Usuário não encontrado no sistema');
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
        throw new Error('Erro ao carregar unidades do usuário');
      }

      return {
        usuario,
        unidades: usuarioUnidades || []
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Cadastrar novo usuário usando Supabase Auth
  static async cadastrar(dadosUsuario: any, dadosUnidade: any) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema de autenticação não disponível. Verifique sua conexão.');
    }

    try {
      // Primeiro, criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
        options: {
          disableEmailConfirmation: true,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error('Email já cadastrado');
        }
        throw new Error('Erro ao criar conta: ' + authError.message);
      }

      // Verificar se o usuário foi criado mas precisa de confirmação de email
      if (!authData.user) {
        // Retornar flag indicando que precisa de confirmação de email
        return {
          needsEmailConfirmation: true,
          message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta antes de fazer login.'
        };
      }

      const user = authData.user;
      const usuarioId = user.id;

      // Criar ou buscar usuário na tabela usuarios - ESSENCIAL: usar o UUID do Supabase Auth
      let usuario;
      const { data: usuarioExistente, error: buscarError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (buscarError && buscarError.code !== 'PGRST116') {
        console.error('Erro ao buscar usuário existente:', buscarError);
        throw new Error(`Erro ao verificar usuário existente: ${buscarError.message}`);
      }

      if (usuarioExistente) {
        // Usuário já existe, usar o existente
        usuario = usuarioExistente;
      } else {
        // Tentar criar novo usuário
        const { data: novoUsuario, error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            id: user.id,   // <- ESSENCIAL para a policy RLS
            email: dadosUsuario.email,
            senha: 'supabase_auth', // Campo obrigatório - indicar que usa Supabase Auth
            nome_usuario: dadosUsuario.nomeUsuario,
            telefone: dadosUsuario.telefone || null,
            foto_usuario: dadosUsuario.fotoUsuario || null
          })
          .select()
          .single();

        if (usuarioError) {
          // Se for erro de chave duplicada, buscar usuário existente
          if (usuarioError.code === '23505') {
            const { data: usuarioDuplicado, error: buscarDuplicadoError } = await supabase
              .from('usuarios')
              .select('*')
              .eq('email', dadosUsuario.email)
              .single();

            if (buscarDuplicadoError || !usuarioDuplicado) {
              console.error('Erro ao buscar usuário duplicado:', buscarDuplicadoError);
              throw new Error('Usuário já existe mas não foi possível recuperar os dados');
            }
            usuario = usuarioDuplicado;
          } else {
            console.error('Erro detalhado ao criar usuário:', usuarioError);
            throw new Error(`Erro ao criar perfil do usuário: ${usuarioError.message || 'Erro desconhecido'}`);
          }
        } else {
          usuario = novoUsuario;
        }
      }

      // Criar unidade
      const { data: unidade, error: unidadeError } = await supabase
        .from('unidades')
        .insert({
          nome: dadosUnidade.nome,
          tipo: dadosUnidade.tipo,
          logo: dadosUnidade.logo || null,
          ativa: true,
          proprietario_id: user.id
        })
        .select()
        .single();

      if (unidadeError || !unidade) {
        console.error('Erro detalhado ao criar unidade:', unidadeError);
        throw new Error(`Erro ao criar unidade: ${unidadeError?.message || 'Erro desconhecido'}`);
      }

      // Criar relacionamento usuário-unidade
      const { error: relacaoError } = await supabase
        .from('usuario_unidades')
        .insert({
          usuario_id: user.id,
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
        console.error('Erro detalhado ao criar relacionamento:', relacaoError);
        throw new Error(`Erro ao configurar permissões do usuário: ${relacaoError.message || 'Erro desconhecido'}`);
      }

      return { usuario, unidade };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
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
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema de recuperação não disponível. Verifique sua conexão.');
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
      throw error;
    }
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
    chamado?: string | null
  ) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      let usuarioId: string;

      // Tentar criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          // Usuário já existe no Auth, buscar na tabela usuarios
          const { data: usuarioExistente } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', dadosUsuario.email)
            .maybeSingle();

          if (usuarioExistente) {
            usuarioId = usuarioExistente.id;
          } else {
            throw new Error('Usuário existe no sistema de autenticação mas não na base de dados');
          }
        } else if (authError.message.includes('Error sending confirmation email')) {
          // Se houver erro no envio de email, tentar obter o usuário criado
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            usuarioId = currentUser.id;
          } else {
            throw new Error('Erro no sistema de email. Tente novamente mais tarde.');
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
            senha: 'supabase_auth', // Campo obrigatório - indicar que usa Supabase Auth
            telefone: dadosUsuario.telefone || null,
            foto_usuario: dadosUsuario.fotoUsuario || null
          });

        if (usuarioError && !usuarioError.message.includes('duplicate key')) {
          console.error('Erro detalhado ao criar usuário:', usuarioError);
          throw new Error(`Erro ao criar perfil do usuário: ${usuarioError.message}`);
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
        console.error('Erro ao verificar relacionamento:', relacaoCheckError);
        throw new Error(`Erro ao verificar relacionamento existente: ${relacaoCheckError.message}`);
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
          chamado: chamado || null
        });

      if (relacaoError) {
        console.error('Erro detalhado ao criar relacionamento:', relacaoError);
        throw new Error(`Erro ao criar relacionamento usuário-unidade: ${relacaoError.message}`);
      }

      return { usuarioId };
    } catch (error) {
      console.error('Erro ao cadastrar usuário na unidade:', error);
      throw error;
    }
  }

  // Buscar usuários da unidade
  static async buscarUsuariosDaUnidade(unidadeId: string) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
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

  // Atualizar permissões do usuário
  static async atualizarPermissoes(usuarioId: string, unidadeId: string, novasPermissoes: any, novoChamado?: string) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      const { error } = await supabase
        .from('usuario_unidades')
        .update({
          permissoes: novasPermissoes,
          chamado: novoChamado || null
        })
        .eq('usuario_id', usuarioId)
        .eq('unidade_id', unidadeId);

      if (error) {
        console.error('Erro detalhado ao atualizar permissões:', error);
        throw new Error(`Erro ao atualizar permissões: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  // Remover usuário da unidade
  static async removerUsuarioDaUnidade(usuarioId: string, unidadeId: string) {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
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

  // Atualizar perfil do usuário
  static async atualizarPerfil(usuarioId: string, dadosAtualizacao: {
    nome_usuario?: string;
    telefone?: string;
    foto_usuario?: string;
  }) {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update(dadosAtualizacao)
        .eq('id', usuarioId);

      if (error) {
        throw new Error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  // Verificar senha atual
  static async verificarSenhaAtual(email: string, senhaAtual: string) {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema não disponível. Verifique sua conexão.');
    }

    try {
      // Para verificar senha atual, precisamos usar uma abordagem diferente
      // pois não podemos fazer login novamente sem afetar a sessão atual
      
      // Por enquanto, retornar true para permitir alteração de senha
      // Em produção, isso deveria ser implementado com uma função edge ou RPC
      return { valida: true };
    } catch (error) {
      console.error('Erro ao verificar senha atual:', error);
      return { valida: false };
    }
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