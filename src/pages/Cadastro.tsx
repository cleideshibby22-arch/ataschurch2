import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Mail, User, Building, Lock, Upload, Image } from 'lucide-react';
import { setUsuarioLogado } from '../utils/auth';
import { AuthService } from '../services/authService';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoUnidade: '',
    nomeUnidade: '',
    nomeUsuario: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cargo: '',
    telefone: ''
  });
  const [fotoUsuario, setFotoUsuario] = useState<string>('');
  const [logoUnidade, setLogoUnidade] = useState<string>('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [carregando, setCarregando] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'usuario' | 'unidade') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (tipo === 'usuario') {
          setFotoUsuario(result);
        } else {
          setLogoUnidade(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const novosErros: {[key: string]: string} = {};

    // Validar tipo de unidade
    if (!formData.tipoUnidade.trim()) {
      novosErros.tipoUnidade = 'Tipo de unidade é obrigatório';
    }

    // Validar nome da unidade
    if (!formData.nomeUnidade.trim()) {
      novosErros.nomeUnidade = 'Nome da unidade é obrigatório';
    }

    // Validar nome de usuário
    if (!formData.nomeUsuario.trim()) {
      novosErros.nomeUsuario = 'Nome de usuário é obrigatório';
    } else if (formData.nomeUsuario.length < 3) {
      novosErros.nomeUsuario = 'Nome de usuário deve ter pelo menos 3 caracteres';
    }

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
    } else if (formData.senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não coincidem';
    }

    // Validar cargo
    if (!formData.cargo.trim()) {
      novosErros.cargo = 'Cargo é obrigatório';
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
      // Verificar se não é o proprietário do sistema tentando se cadastrar
      if (formData.email === 'admin@sistema.com') {
        setErros({ geral: 'Este email é reservado para o proprietário do sistema. Use o login direto.' });
        setCarregando(false);
        return;
      }
      
      // Preparar dados para cadastro
      const dadosUsuario = {
        email: formData.email,
        senha: formData.senha,
        nomeUsuario: formData.nomeUsuario,
        telefone: formData.telefone,
        fotoUsuario: fotoUsuario,
        cargo: formData.cargo
      };

      const dadosUnidade = {
        nome: formData.nomeUnidade,
        tipo: formData.tipoUnidade,
        logo: logoUnidade
      };

      // Cadastrar através do AuthService
      const resultado = await AuthService.cadastrar(dadosUsuario, dadosUnidade);

      // Criar objeto do usuário logado
      const usuarioLogado = {
        id: resultado.usuario.id,
        senha: formData.senha,
        unidadeId: resultado.unidade.id,
        tipoUnidade: resultado.unidade.tipo,
        nomeUnidade: resultado.unidade.nome,
        logoUnidade: resultado.unidade.logo || '',
        nomeUsuario: resultado.usuario.nome_usuario,
        email: resultado.usuario.email,
        cargo: formData.cargo,
        telefone: resultado.usuario.telefone || '',
        fotoUsuario: resultado.usuario.foto_usuario || '',
        dataCadastro: resultado.usuario.data_cadastro,
        tipo: 'administrador' as const,
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
      
      setUsuarioLogado(usuarioLogado);
      // Redirecionar para a página inicial
      navigate('/');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErros({ geral: error instanceof Error ? error.message : 'Erro ao realizar cadastro. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lds-blue to-lds-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="h-8 w-8 text-lds-blue" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Criar Conta
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

            {/* Fotos */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Foto do Usuário */}
              <div>
                <label className="label">Foto do Usuário</label>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
                    {fotoUsuario ? (
                      <img src={fotoUsuario} alt="Foto do usuário" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Escolher Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFotoChange(e, 'usuario')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Logo da Unidade */}
              <div>
                <label className="label">Logo da Unidade</label>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                    {logoUnidade ? (
                      <img src={logoUnidade} alt="Logo da unidade" className="w-full h-full object-contain" />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Escolher Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFotoChange(e, 'unidade')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Informações da Unidade */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de Unidade</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="tipoUnidade"
                    name="tipoUnidade"
                    value={formData.tipoUnidade}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${erros.tipoUnidade ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Ala">Ala</option>
                    <option value="Ramo">Ramo</option>
                    <option value="Distrito">Distrito</option>
                    <option value="Estaca">Estaca</option>
                  </select>
                </div>
                {erros.tipoUnidade && (
                  <p className="mt-1 text-sm text-red-600">{erros.tipoUnidade}</p>
                )}
              </div>

              <div>
                <label className="label">Nome da Unidade</label>
                <input
                  type="text"
                  name="nomeUnidade"
                  value={formData.nomeUnidade}
                  onChange={handleInputChange}
                  className={`input-field ${erros.nomeUnidade ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ex: São Paulo Centro"
                  required
                />
                {erros.nomeUnidade && (
                  <p className="mt-1 text-sm text-red-600">{erros.nomeUnidade}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="label">Cargo na Unidade</label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className={`input-field ${erros.cargo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  required
                >
                  <option value="">Selecione o cargo</option>
                  <option value="Bispo">Bispo</option>
                  <option value="Presidente">Presidente</option>
                  <option value="1º Conselheiro">1º Conselheiro</option>
                  <option value="2º Conselheiro">2º Conselheiro</option>
                  <option value="Secretário">Secretário</option>
                  <option value="Secretário Executivo">Secretário Executivo</option>
                  <option value="Secretário Assistente">Secretário Assistente</option>
                  <option value="Outro">Outro</option>
                </select>
                {erros.cargo && (
                  <p className="mt-1 text-sm text-red-600">{erros.cargo}</p>
                )}
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nomeUsuario" className="label">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nomeUsuario"
                    name="nomeUsuario"
                    type="text"
                    value={formData.nomeUsuario}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${erros.nomeUsuario ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                {erros.nomeUsuario && (
                  <p className="mt-1 text-sm text-red-600">{erros.nomeUsuario}</p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="label">
                  Telefone
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

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

            {/* Senhas */}
            <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="Mínimo 6 caracteres"
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

              <div>
                <label htmlFor="confirmarSenha" className="label">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className={`input-field pl-10 pr-10 ${erros.confirmarSenha ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Digite a senha novamente"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  >
                    {mostrarConfirmarSenha ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {erros.confirmarSenha && (
                  <p className="mt-1 text-sm text-red-600">{erros.confirmarSenha}</p>
                )}
              </div>
            </div>

            {/* Botão de Cadastro */}
            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Criar Conta</span>
                  </>
                )}
              </button>
            </div>

            {/* Link para Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-lds-blue hover:text-lds-light-blue transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Informações de Segurança */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Informações de Segurança</h3>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• Seus dados são protegidos e criptografados</li>
            <li>• Use uma senha forte com pelo menos 6 caracteres</li>
            <li>• Mantenha suas credenciais em segurança</li>
            <li>• As fotos são armazenadas localmente no seu dispositivo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;