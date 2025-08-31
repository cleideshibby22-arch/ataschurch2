import { supabase } from '../lib/supabase';

class AuthService {
  // Cadastro de usuário
  static async cadastrar(email: string, senha: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error: any) {
      console.error('Erro ao cadastrar usuário:', error.message);
      throw new Error(error.message || 'Erro ao cadastrar usuário.');
    }
  }

  // Login de usuário
  static async login(email: string, senha: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error: any) {
      console.error('Erro ao autenticar usuário:', error.message);
      throw new Error(error.message || 'Erro ao autenticar usuário.');
    }
  }

  // Logout de usuário
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sair:', error.message);
      throw new Error(error.message || 'Erro ao sair da conta.');
    }
  }

  // Obter usuário atual
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error.message);
      return null;
    }
  }
}

export default AuthService;
