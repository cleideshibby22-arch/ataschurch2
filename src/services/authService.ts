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
      return data;
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      throw err;
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
      return data;
    } catch (err) {
      console.error('Erro ao logar:', err);
      throw err;
    }
  }

  // Logout de usuário
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao sair:', err);
      throw err;
    }
  }

  // Pegar usuário logado
  static async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      throw err;
    }
  }
}

// Exporta como default
export default AuthService;
