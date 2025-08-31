import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Database } from '../lib/supabase';

export class AuthService {
  // Login
  static async login(email: string, senha: string) {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema de autenticação não disponível.');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (authError || !authData.user) throw new Error('Credenciais inválidas');

    const { data: usuario, error: userError } = await supabase
      .from<Database['public']['Tables']['usuarios']>('usuarios')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (userError || !usuario) throw new Error('Usuário não encontrado');

    return usuario;
  }

  // Cadastro
  static async cadastrar(dadosUsuario: any, dadosUnidade: any) {
    if (!isSupabaseAvailable || !supabase) {
      throw new Error('Sistema de autenticação não disponível.');
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dadosUsuario.email,
      password: dadosUsuario.senha,
      options: { data: { nome_usuario: dadosUsuario.nomeUsuario } }
    });

    if (authError) throw new Error(authError.message);

    const user = authData.user;
    if (!user) throw new Error('Erro ao criar usuário');

    // Criar usuário na tabela 'usuarios'
    const { data: usuario, error: usuarioError } = await supabase
      .from<Database['public']['Tables']['usuarios']>('usuarios')
      .insert({
        id: user.id,
        email: dadosUsuario.email,
        senha: 'supabase_auth',
        nome_usuario: dadosUsuario.nomeUsuario,
        telefone: dadosUsuario.telefone || null,
        foto_usuario: dadosUsuario.fotoUsuario || null
      })
      .select()
      .single();

    if (usuarioError) throw new Error(usuarioError.message);

    // Criar unidade
    const { data: unidade, error: unidadeError } = await supabase
      .from<Database['public']['Tables']['unidades']>('unidades')
      .insert({
        nome: dadosUnidade.nome,
        tipo: dadosUnidade.tipo,
        logo: dadosUnidade.logo || null,
        ativa: true,
        proprietario_id: user.id
      })
      .select()
      .single();

    if (unidadeError) throw new Error(unidadeError.message);

    return { usuario, unidade };
  }

  // Logout
  static async logout() {
    if (isSupabaseAvailable && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('usuario-logado');
  }

  // Obter usuário atual
  static async obterUsuarioAtual() {
    if (!isSupabaseAvailable || !supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: usuario } = await supabase
      .from<Database['public']['Tables']['usuarios']>('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    return usuario;
  }
}
