import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Usuario, UnidadeComDetalhesUsuario } from '../types';
import { setUsuarioLogado } from '../utils/auth';
import { AuthService } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<Unidade[]>([]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<string>('');
  const [mostrarSelecaoUnidade, setMostrarSelecaoUnidade] = useState(false);
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

  const fazerLoginComUnidade = (unidadeId: string) => {
    try {
      const unidadeSelecionadaObj = unidadesDisponiveis.find(u => u.id === unidadeId);
      const usuarioUnidade = unidadesDisponiveis.find(u => u.id === unidadeId);
      
      if (!unidadeSelecionadaObj || !usuarioUnidade) {
        setErros({ geral: 'Erro ao selecionar unidade.' });
        return;
      }

      // Criar objeto do usuário logado com informações da unidade
      const usuarioLogado: Usuario = {
        id: usuarioUnidade.usuario_id,
        senha: formData.senha,
        unidadeId: unidadeId,
        tipoUnidade: unidadeSelecionadaObj.tipo,
        nomeUnidade: unidadeSelecionadaObj.nome,
        logoUnidade: unidadeSelecionadaObj.logo || '',
        nomeUsuario: usuarioUnidade.nome_usuario,
        email: formData.email,
        cargo: usuarioUnidade.cargo,
        telefone: usuarioUnidade.telefone || '',
        fotoUsuario: usuarioUnidade.foto_usuario || '',
        dataCadastro: usuarioUnidade.data_cadastro,
        tipo: usuarioUnidade.tipo,
        permissoes: usuarioUnidade.permissoes
      };

      setUsuarioLogado(usuarioLogado);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErros({ geral: 'Erro ao realizar login. Tente novamente.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);

    try {
      // Verificar se é o proprietário do sistema
      if (formData.email === 'admin@sistema.com' && formData.senha === 'admin1234') {
        const proprietarioSistema: Usuario = {
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
            gerenciarSistema: true,
            verTodasAtas: true,
            verAtasPorChamado: true
          }
        };
        
        setUsuarioLogado(proprietarioSistema);
        navigate('/');
        return;
      }
      
      // Fazer login através do AuthService
      const resultado = await AuthService.login(formData.email, formData.senha);
      
      if (resultado.unidades.length === 1) {
        // Se só tem uma unidade, fazer login direto
        const unidade = resultado.unidades[0];
        const usuarioLogado: Usuario = {
          id: resultado.usuario.id,
          senha: formData.senha,
          unidadeId: unidade.unidade_id,
          tipoUnidade: unidade.unidades.tipo,
          nomeUnidade: unidade.unidades.nome,
          logoUnidade: unidade.unidades.logo || '',
          nomeUsuario: resultado.usuario.nome_usuario,
          email: resultado.usuario.email,
          cargo: unidade.cargo,
          telefone: resultado.usuario.telefone || '',
          fotoUsuario: resultado.usuario.foto_usuario || '',
          dataCadastro: resultado.usuario.data_cadastro,
          tipo: unidade.tipo,
          permissoes: unidade.permissoes
        };
        
        setUsuarioLogado(usuarioLogado);
        navigate('/');
      } else {
        // Se tem múltiplas unidades, mostrar seleção
        const unidadesFormatadas = resultado.unidades.map((uu: any) => ({
          ...uu.unidades,
          usuario_id: resultado.usuario.id,
          nome_usuario: resultado.usuario.nome_usuario,
          data_cadastro: resultado.usuario.data_cadastro,
          telefone: resultado.usuario.telefone,
          foto_usuario: resultado.usuario.foto_usuario,
          cargo: uu.cargo,
          tipo: uu.tipo,
          permissoes: uu.permissoes
        }));
        
        setUnidadesDisponiveis(unidadesFormatadas);
        setMostrarSelecaoUnidade(true);
      }
      
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErros({ geral: error instanceof Error ? error.message : 'Erro ao realizar login. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };
  
  const handleSelecionarUnidade = () => {
    if (!unidadeSelecionada) {
      setErros({ geral: 'Selecione uma unidade para continuar.' });
      return;
    }
    
    setCarregando(true);
    fazerLoginComUnidade(unidadeSelecionada);
  };
  
  const voltarParaLogin = () => {
    setMostrarSelecaoUnidade(false);
    setUnidadesDisponiveis([]);
    setUnidadeSelecionada('');
    setErros({});
  };

  if (mostrarSelecaoUnidade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lds-blue to-lds-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <LogIn className="h-8 w-8 text-lds-blue" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Selecionar Unidade
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Você tem acesso a múltiplas unidades. Selecione uma para continuar.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            {erros.geral && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {erros.geral}
              </div>
            )}

            <div className="space-y-4">
              <label className="label">Selecione a Unidade</label>
              <div className="space-y-2">
                {unidadesDisponiveis.map((unidade) => (
                  <label key={unidade.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="unidade"
                      value={unidade.id}
                      checked={unidadeSelecionada === unidade.id}
                      onChange={(e) => setUnidadeSelecionada(e.target.value)}
                      className="h-4 w-4 text-lds-blue focus:ring-lds-light-blue border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{unidade.nome}</div>
                      <div className="text-sm text-gray-600">{unidade.tipo}</div>
                      <div className="text-xs text-gray-500">
                        Criada em: {new Date(unidade.dataCriacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {unidade.logo && (
                      <img src={unidade.logo} alt="Logo" className="h-8 w-8 rounded object-contain" />
                    )}
                  </label>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Dica:</strong> Você tem acesso a múltiplas unidades. Selecione a unidade onde deseja trabalhar nesta sessão.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={voltarParaLogin}
                className="flex-1 btn-secondary"
              >
                Voltar
              </button>
              <button
                onClick={handleSelecionarUnidade}
                disabled={carregando}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lds-blue to-lds-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-lds-blue" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Fazer Login
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Atas das Reuniões da Igreja
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
                Email
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
                  placeholder="seu@email.com"
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
                Senha
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
                  placeholder="Sua senha"
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

            {/* Lembrar de mim e Esqueci a senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="lembrar"
                  name="lembrar"
                  type="checkbox"
                  className="h-4 w-4 text-lds-blue focus:ring-lds-light-blue border-gray-300 rounded"
                />
                <label htmlFor="lembrar" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/esqueci-senha"
                  className="font-medium text-lds-blue hover:text-lds-light-blue transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>
            </div>

            {/* Botão de Login */}
            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </div>

            {/* Link para Cadastro */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link
                  to="/cadastro"
                  className="font-medium text-lds-blue hover:text-lds-light-blue transition-colors"
                >
                  Criar conta
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                É o proprietário do sistema?{' '}
                <Link
                  to="/proprietario-login"
                  className="font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Acesso do Proprietário
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Informações de Ajuda */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Precisa de Ajuda?</h3>
          <p className="text-blue-100 text-sm">
            Entre em contato com o administrador do sistema ou consulte o manual de usuário.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;