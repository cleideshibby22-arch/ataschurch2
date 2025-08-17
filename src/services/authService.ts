import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Usuario, Unidade } from '../types';

export class AuthService {
  // Fazer login
  static async login(email: string, senha: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.loginLocal(email, senha);
    }

    try {
      // Buscar usuário no banco
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single();

      if (userError || !usuario) {
        throw new Error('Credenciais inválidas');
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
      if (error instanceof Error && error.message === 'Credenciais inválidas') {
        throw error;
      }
      throw new Error('Erro ao realizar login. Tente novamente.');
    }
  }

  // Login usando sistema local (localStorage)
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

  // Cadastrar novo usuário e unidade
  static async cadastrar(dadosUsuario: any, dadosUnidade: any) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.cadastrarLocal(dadosUsuario, dadosUnidade);
    }

    try {
      // Verificar se email já existe
      const { data: usuarioExistente, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', dadosUsuario.email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Erro ao verificar email existente');
      }

      if (usuarioExistente) {
        throw new Error('Email já cadastrado');
      }

      // Criar unidade
      const { data: unidade, error: unidadeError } = await supabase
        .from('unidades')
        .insert({
          nome: dadosUnidade.nome,
          tipo: dadosUnidade.tipo,
          logo: dadosUnidade.logo,
          ativa: true
        })
        .select()
        .single();

      if (unidadeError || !unidade) {
        throw new Error('Erro ao criar unidade');
      }

      // Criar usuário
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          nome_usuario: dadosUsuario.nomeUsuario,
          telefone: dadosUsuario.telefone,
          foto_usuario: dadosUsuario.fotoUsuario
        })
        .select()
        .single();

      if (usuarioError || !usuario) {
        throw new Error('Erro ao criar usuário');
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
        throw new Error('Erro ao criar relacionamento usuário-unidade');
      }

      return { usuario, unidade };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  // Cadastro usando sistema local
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

  // Recuperar senha
  static async recuperarSenha(email: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.recuperarSenhaLocal(email);
    }

    try {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();

      if (!usuario) {
        throw new Error('Email não encontrado');
      }

      // Em um sistema real, aqui seria enviado um email
      // Por enquanto, retornamos um código simulado
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      
      return { sucesso: true, codigo };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      throw error;
    }
  }

  // Recuperação de senha local
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

  // Alterar senha
  static async alterarSenha(email: string, novaSenha: string) {
    // Se Supabase não estiver disponível, usar sistema local
    if (!isSupabaseAvailable || !supabase) {
      return this.alterarSenhaLocal(email, novaSenha);
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ senha: novaSenha })
        .eq('email', email);

      if (error) {
        throw new Error('Erro ao alterar senha');
      }

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  // Alteração de senha local
  private static async alterarSenhaLocal(email: string, novaSenha: string) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioIndex = usuarios.findIndex((u: any) => u.email === email);

    if (usuarioIndex === -1) {
      throw new Error('Usuário não encontrado');
    }

    usuarios[usuarioIndex].senha = novaSenha;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    return { sucesso: true };
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
      // Verificar se email já existe
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', dadosUsuario.email)
        .single();

      let usuarioId: string;

      if (usuarioExistente) {
        // Usuário já existe, apenas adicionar à unidade
        usuarioId = usuarioExistente.id;
      } else {
        // Criar novo usuário
        const { data: novoUsuario, error: usuarioError } = await supabase
          .from('usuarios')
          .insert({
            email: dadosUsuario.email,
            senha: dadosUsuario.senha,
            nome_usuario: dadosUsuario.nomeUsuario,
            telefone: dadosUsuario.telefone,
            foto_usuario: dadosUsuario.fotoUsuario
          })
          .select()
          .single();

        if (usuarioError || !novoUsuario) {
          throw new Error('Erro ao criar usuário');
        }

        usuarioId = novoUsuario.id;
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

  // Cadastro de usuário na unidade local
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

  // Buscar usuários da unidade local
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

  // Atualizar permissões local
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

  // Remover usuário da unidade local
  private static async removerUsuarioDaUnidadeLocal(usuarioId: string, unidadeId: string) {
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
    
    const novasRelacoes = usuarioUnidades.filter((uu: any) => 
      !(uu.usuarioId === usuarioId && uu.unidadeId === unidadeId)
    );
    
    localStorage.setItem('usuario-unidades', JSON.stringify(novasRelacoes));
  }
}