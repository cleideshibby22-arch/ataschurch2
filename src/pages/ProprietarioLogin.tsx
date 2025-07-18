import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const ProprietarioLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [carregando, setCarregando] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const novosErros: {[key: string]: string} = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);

    try {
      // Simular login (aqui você integraria com sua API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificar se é o proprietário do sistema
      if (formData.email === 'admin@sistema.com' && formData.senha === 'admin1234') {
        // Salvar dados do proprietário
        const proprietarioSistema = {
          id: 'system-owner',
          senha: 'admin1234',
          unidadeId: 'system',
          tipoUnidade: 'Sistema',
          nomeUnidade: 'Administração do Sistema',
          logoUnidade: '',
          nomeUsuario: 'Proprietário do Sistema',
          email: 'admin@sistema.com',
          cargo: 'Proprietário do Sistema',
          telefone: '',
          fotoUsuario: '',
          dataCadastro: new Date().toISOString(),
          tipo: 'administrador',
          permissoes: {
            criarAta: true,
            editarAta: true,
            excluirAta: true,
            gerenciarUsuarios: true,
            gerenciarSistema: true
          }
        };
        
        localStorage.setItem('usuario-logado', JSON.stringify(proprietarioSistema));
        navigate('/proprietario');
        return;
      }
      
      // Se não for o proprietário
      setErros({ geral: 'Credenciais inválidas. Apenas o proprietário do sistema pode acessar esta área.' });
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErros({ geral: 'Erro ao realizar login. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Acesso do Proprietário
          </h2>
          <p className="mt-2 text-sm text-red-100">
            Área Restrita - Administração do Sistema
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {erros.geral && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {erros.geral}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email do Proprietário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${erros.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="admin@sistema.com"
                  required
                />
              </div>
              {erros.email && (
                <p className="mt-1 text-sm text-red-600">{erros.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="label">
                Senha do Proprietário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${erros.senha ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Sua senha de proprietário"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {erros.senha && (
                <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
              )}
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Acessar Painel</span>
                  </>
                )}
              </button>
            </div>

            {/* Link para Login Normal */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não é o proprietário?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Fazer login como usuário
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Informações de Segurança */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">⚠️ Área Restrita</h3>
          <ul className="text-red-100 text-sm space-y-1">
            <li>• Acesso exclusivo para o proprietário do sistema</li>
            <li>• Todas as ações são registradas e monitoradas</li>
            <li>• Use apenas credenciais autorizadas</li>
            <li>• Em caso de problemas, contate o suporte técnico</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProprietarioLogin;