import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Usuario } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<any>;
  logout: () => Promise<void>;
  setUsuarioLogado: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    inicializarAuth();
  }, []);

  const inicializarAuth = async () => {
    setCarregando(true);
    
    if (isSupabaseAvailable && supabase) {
      try {
        // Verificar se há sessão ativa no Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Se há sessão, buscar dados do usuário
          await carregarUsuarioDoSupabase(session.user.id);
        } else {
          // Se não há sessão, verificar localStorage como fallback
          const usuarioLocal = localStorage.getItem('usuario-logado');
          if (usuarioLocal) {
            try {
              const usuarioData = JSON.parse(usuarioLocal);
              setUsuario(usuarioData);
            } catch (error) {
              console.error('Erro ao carregar usuário do localStorage:', error);
              localStorage.removeItem('usuario-logado');
            }
          }
        }
        
        // Escutar mudanças de autenticação
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUsuario(null);
            localStorage.removeItem('usuario-logado');
          } else if (event === 'SIGNED_IN' && session?.user) {
            await carregarUsuarioDoSupabase(session.user.id);
          }
        });
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Fallback para localStorage
        const usuarioLocal = localStorage.getItem('usuario-logado');
        if (usuarioLocal) {
          try {
            const usuarioData = JSON.parse(usuarioLocal);
            setUsuario(usuarioData);
          } catch (error) {
            console.error('Erro ao carregar usuário do localStorage:', error);
            localStorage.removeItem('usuario-logado');
          }
        }
      }
    } else {
      // Se Supabase não estiver disponível, usar apenas localStorage
      const usuarioLocal = localStorage.getItem('usuario-logado');
      if (usuarioLocal) {
        try {
          const usuarioData = JSON.parse(usuarioLocal);
          setUsuario(usuarioData);
        } catch (error) {
          console.error('Erro ao carregar usuário do localStorage:', error);
          localStorage.removeItem('usuario-logado');
        }
      }
    }
    
    setCarregando(false);
  };

  const carregarUsuarioDoSupabase = async (userId: string) => {
    try {
      if (!isSupabaseAvailable || !supabase) return;

      // Buscar dados do usuário
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError || !usuario) {
        console.error('Erro ao buscar usuário:', usuarioError);
        return;
      }

      // Buscar unidades do usuário
      const { data: usuarioUnidades, error: unidadesError } = await supabase
        .from('usuario_unidades')
        .select(`
          *,
          unidades (*)
        `)
        .eq('usuario_id', userId);

      if (unidadesError) {
        console.error('Erro ao buscar unidades:', unidadesError);
        return;
      }

      // Se tem múltiplas unidades, usar a última usada ou a primeira
      const ultimaUnidadeUsada = localStorage.getItem('ultima-unidade-usada');
      let unidadeAtual = usuarioUnidades?.[0];
      
      if (ultimaUnidadeUsada && usuarioUnidades) {
        const unidadeEncontrada = usuarioUnidades.find(uu => uu.unidade_id === ultimaUnidadeUsada);
        if (unidadeEncontrada) {
          unidadeAtual = unidadeEncontrada;
        }
      }

      if (unidadeAtual) {
        const usuarioCompleto: Usuario = {
          id: usuario.id,
          senha: '', // Senha gerenciada pelo Supabase Auth
          unidadeId: unidadeAtual.unidade_id,
          tipoUnidade: unidadeAtual.unidades.tipo,
          nomeUnidade: unidadeAtual.unidades.nome,
          logoUnidade: unidadeAtual.unidades.logo || '',
          nomeUsuario: usuario.nome_usuario,
          email: usuario.email,
          cargo: unidadeAtual.cargo,
          telefone: usuario.telefone || '',
          fotoUsuario: usuario.foto_usuario || '',
          dataCadastro: usuario.data_cadastro,
          tipo: unidadeAtual.tipo,
          permissoes: unidadeAtual.permissoes
        };

        setUsuario(usuarioCompleto);
        localStorage.setItem('usuario-logado', JSON.stringify(usuarioCompleto));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do Supabase:', error);
    }
  };

  const login = async (email: string, senha: string) => {
    return AuthService.login(email, senha);
  };

  const logout = async () => {
    await AuthService.logout();
    setUsuario(null);
    localStorage.removeItem('usuario-logado');
    localStorage.removeItem('ultima-unidade-usada');
  };

  const setUsuarioLogado = (usuario: Usuario) => {
    setUsuario(usuario);
    localStorage.setItem('usuario-logado', JSON.stringify(usuario));
    if (usuario.unidadeId) {
      localStorage.setItem('ultima-unidade-usada', usuario.unidadeId);
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      carregando,
      login,
      logout,
      setUsuarioLogado
    }}>
      {children}
    </AuthContext.Provider>
  );
};