import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/authService';

interface Usuario {
  id: string;
  email: string;
  nome_usuario: string;
  telefone?: string | null;
  foto_usuario?: string | null;
}

interface AuthContextProps {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  cadastrar: (dadosUsuario: any, dadosUnidade: any) => Promise<void>;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const usuarioAtual = await AuthService.obterUsuarioAtual();
        setUsuario(usuarioAtual);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, senha: string) => {
    setCarregando(true);
    try {
      await AuthService.login(email, senha);
      const usuarioAtual = await AuthService.obterUsuarioAtual();
      setUsuario(usuarioAtual);
    } finally {
      setCarregando(false);
    }
  };

  const logout = async () => {
    setCarregando(true);
    try {
      await AuthService.logout();
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  };

  const cadastrar = async (dadosUsuario: any, dadosUnidade: any) => {
    setCarregando(true);
    try {
      const { usuario: novoUsuario } = await AuthService.cadastrar(dadosUsuario, dadosUnidade);
      setUsuario(novoUsuario);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cadastrar, carregando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
