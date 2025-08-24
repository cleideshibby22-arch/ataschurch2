import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Home, Plus, List, LogOut, User, Users, Settings, Shield } from 'lucide-react';
import { getUnidadeAtual, isAdministrador, temPermissao, podeGerenciarUsuarios } from '../utils/auth';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const unidadeAtual = getUnidadeAtual();
  
  // Verificar se o usuário está logado
  const isAdmin = isAdministrador(usuario);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Se não estiver logado, redirecionar para login
  React.useEffect(() => {
    // Aguardar um pouco para verificar se o usuário será carregado do Supabase
    const timer = setTimeout(() => {
      if (!usuario) {
        navigate('/login');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [usuario, navigate]);

  if (!usuario) {
    return null; // Ou um componente de loading
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-lds-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Logo da Unidade ou Ícone Padrão */}
              {unidadeAtual?.logo ? (
                <img 
                  src={unidadeAtual.logo} 
                  alt="Logo da unidade" 
                  className="h-8 w-8 rounded object-contain bg-white p-1"
                />
              ) : (
                <FileText className="h-8 w-8" />
              )}
              <div>
                <h1 className="text-lg font-bold">{unidadeAtual?.nome || 'Sistema'}</h1>
                <p className="text-xs text-blue-200">Atas das Reuniões da Igreja</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-lds-light-blue text-white' 
                    : 'text-gray-200 hover:text-white hover:bg-lds-light-blue'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Início</span>
              </Link>
              
              {temPermissao(usuario, 'criarAta') && (
                <Link
                  to="/nova-ata"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/nova-ata') 
                      ? 'bg-lds-light-blue text-white' 
                      : 'text-gray-200 hover:text-white hover:bg-lds-light-blue'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Ata</span>
                </Link>
              )}
              
              <Link
                to="/atas"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/atas') 
                    ? 'bg-lds-light-blue text-white' 
                    : 'text-gray-200 hover:text-white hover:bg-lds-light-blue'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Atas</span>
              </Link>
              
              {podeGerenciarUsuarios(usuario) && (
                <Link
                  to="/usuarios"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/usuarios') 
                      ? 'bg-lds-light-blue text-white' 
                      : 'text-gray-200 hover:text-white hover:bg-lds-light-blue'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Usuários</span>
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'bg-lds-light-blue text-white' 
                      : 'text-gray-200 hover:text-white hover:bg-lds-light-blue'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Menu do usuário */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                {/* Foto do usuário ou ícone padrão */}
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors"
                >
                  {usuario.fotoUsuario ? (
                    <img 
                      src={usuario.fotoUsuario} 
                      alt="Foto do usuário" 
                      className="h-6 w-6 rounded-full object-cover border border-blue-300"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <div className="text-right">
                    <div className="font-medium">{usuario.nomeUsuario}</div>
                    <div className="text-xs text-blue-200">
                      {usuario.cargo || 'Usuário'}
                    </div>
                  </div>
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-lds-light-blue transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs mt-1">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/') ? 'text-lds-blue' : 'text-gray-500'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Início</span>
          </Link>
          
          {temPermissao(usuario, 'criarAta') && (
            <Link
              to="/nova-ata"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive('/nova-ata') ? 'text-lds-blue' : 'text-gray-500'
              }`}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs mt-1">Nova</span>
            </Link>
          )}
          
          <Link
            to="/atas"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/atas') ? 'text-lds-blue' : 'text-gray-500'
            }`}
          >
            <List className="h-5 w-5" />
            <span className="text-xs mt-1">Atas</span>
          </Link>
          
          {podeGerenciarUsuarios(usuario) && (
            <Link
              to="/usuarios"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive('/usuarios') ? 'text-lds-blue' : 'text-gray-500'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Usuários</span>
            </Link>
          )}
          
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex flex-col items-center py-2 px-3 ${
                isActive('/admin') ? 'text-lds-blue' : 'text-gray-500'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs mt-1">Admin</span>
            </Link>
          )}
          
          <Link
            to="/perfil"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive('/perfil') ? 'text-lds-blue' : 'text-gray-500'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-3 text-gray-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;