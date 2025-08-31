// src/services/authService.ts
import { supabase } from "../lib/supabase";

class AuthService {
  // ===============================
  // 🔎 VERIFICAÇÃO SUPABASE
  // ===============================
  private static ensureSupabase() {
    if (!supabase) {
      throw new Error("⚠️ Supabase não configurado. Verifique suas variáveis de ambiente.");
    }
  }

  // ===============================
  // 🔑 CADASTRO DE USUÁRIO
  // ===============================
  static async signUp(dadosUsuario: {
    email: string;
    senha: string;
    nomeUsuario: string;
    telefone?: string;
    fotoUsuario?: string;
  }) {
    this.ensureSupabase();

    try {
      // 1. Cria usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Usuário não foi criado no Supabase.");

      const user = data.user;

      // 2. Insere dados extras na tabela `usuarios`
      const { data: novoUsuario, error: usuarioError } = await supabase
        .from("usuarios")
        .insert({
          id: user.id,
          email: dadosUsuario.email,
          senha: "supabase_auth", // não armazenar senha real
          nome_usuario: dadosUsuario.nomeUsuario,
          telefone: dadosUsuario.telefone || null,
          foto_usuario: dadosUsuario.fotoUsuario || null,
        })
        .select()
        .single();

      if (usuarioError) throw usuarioError;

      return { user: novoUsuario };
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      throw new Error(err.message || "Falha ao cadastrar usuário.");
    }
  }

  // ===============================
  // 🔑 LOGIN
  // ===============================
  static async signIn(email: string, senha: string) {
    this.ensureSupabase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Erro no login:", err);
      throw new Error(err.message || "Falha no login.");
    }
  }

  // ===============================
  // 🔑 LOGOUT
  // ===============================
  static async signOut() {
    this.ensureSupabase();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      console.error("Erro ao sair:", err);
      throw new Error(err.message || "Falha ao encerrar sessão.");
    }
  }

  // ===============================
  // 📩 RECUPERAÇÃO DE SENHA
  // ===============================
  static async resetPassword(email: string) {
    this.ensureSupabase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error("Erro ao solicitar redefinição de senha:", err);
      throw new Error(err.message || "Falha ao solicitar redefinição de senha.");
    }
  }

  // ===============================
  // 👥 VINCULAR USUÁRIO A UNIDADE
  // ===============================
  static async cadastrarUsuarioNaUnidade(
    usuarioId: string,
    unidadeId: string,
    dadosUsuario: { cargo?: string },
    tipo: string,
    permissoes: any,
    chamado?: string
  ) {
    this.ensureSupabase();

    try {
      const { error } = await supabase.from("usuario_unidades").insert({
        usuario_id: usuarioId,
        unidade_id: unidadeId,
        cargo: dadosUsuario.cargo || null,
        tipo,
        permissoes,
        chamado: chamado || null,
      });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error("Erro ao vincular usuário à unidade:", err);
      throw new Error(err.message || "Falha ao cadastrar usuário na unidade.");
    }
  }

  // ===============================
  // 👥 BUSCAR DADOS DO USUÁRIO
  // ===============================
  static async getUserData(userId: string) {
    this.ensureSupabase();

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Erro ao buscar dados do usuário:", err);
      throw new Error(err.message || "Falha ao buscar dados do usuário.");
    }
  }
}

export default AuthService;
