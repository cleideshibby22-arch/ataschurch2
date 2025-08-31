import { supabase } from "../lib/supabase";

export class AuthService {
  // Cadastro de usuário
  static async signUp(email: string, password: string) {
    if (!supabase) throw new Error("Supabase não está configurado.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Login de usuário
  static async signIn(email: string, password: string) {
    if (!supabase) throw new Error("Supabase não está configurado.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Logout de usuário
  static async signOut() {
    if (!supabase) throw new Error("Supabase não está configurado.");

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Obter usuário atual
  static async getUser() {
    if (!supabase) throw new Error("Supabase não está configurado.");

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user;
  }
}
