import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, setUsuarioLogado } = useAuth();
  const [abaSelecionada, setAbaSelecionada] = useState<'perfil' | 'senha'>('perfil');
  
  const [formPerfil, setFormPerfil] = useState({
    nomeUsuario: usuario?.nomeUsuario || '',
    telefone: usuario?.telefone || '',
    fotoUsuario: usuario?.fotoUsuario || ''
  });

  const [formSenha, setFormSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState<string>('');

  const handleInputChangePerfil = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormPerfil(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputChangeSenha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormSenha(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormPerfil(prev => ({ ...prev, fotoUsuario: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormularioPerfil = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formPerfil.nomeUsuario.trim()) {
      novosErros.nomeUsuario = 'Nome é obrigatório';
    } else if (formPerfil.nomeUsuario.length < 3) {
      novosErros.nomeUsuario = 'Nome deve ter pelo menos 3 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const validarFormularioSenha = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formSenha.senhaAtual) {
      novosErros.senhaAtual = 'Senha atual é obrigatória';
    }

    if (!formSenha.novaSenha) {
      novosErros.novaSenha = 'Nova senha é obrigatória';
    } else if (formSenha.novaSenha.length < 6) {
      novosErros.novaSenha = 'Nova senha deve ter pelo menos 6 caracteres';
    }

    if (!formSenha.confirmarSenha) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não coincidem';
    }

    if (formSenha.senhaAtual === formSenha.novaSenha) {
      novosErros.novaSenha = 'A nova senha deve ser diferente da atual';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmitPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormularioPerfil() || !usuario) {
      return;
    }

    setCarregando(true);
    setErros({});
    setSucesso('');

    try {
      await AuthService.atualizarPerfil(usuario.id, {
        nome_usuario: formPerfil.nomeUsuario,
        telefone: formPerfil.telefone,
        foto_usuario: formPerfil.fotoUsuario
      });

      // Atualizar usuário no contexto
      const usuarioAtualizado = {
        ...usuario,
        nomeUsuario: formPerfil.nomeUsuario,
        telefone: formPerfil.telefone,
        fotoUsuario: formPerfil.fotoUsuario
      };
      
      setUsuarioLogado(usuarioAtualizado);
      setSucesso('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErros({ geral: error instanceof Error ? error.message : 'Erro ao atualizar perfil. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmitSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormularioSenha() || !usuario || !usuario.email) {
      return;
    }

    setCarregando(true);
    setErros({});
    setSucesso('');

    try {
      // Primeiro verificar a senha atual
      const verificacao = await AuthService.verificarSenhaAtual(usuario.email, formSenha.senhaAtual);
      
      if (!verificacao.valida) {
        setErros({ senhaAtual: 'Senha atual incorreta' });
        return;
      }

      // Alterar a senha
      await AuthService.alterarSenha(formSenha.novaSenha);
      
      setSucesso('Senha alterada com sucesso!');
      setFormSenha({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha. Tente novamente.';
      console.error('Erro detalhado ao alterar senha:', errorMessage);
      setErros({ geral: errorMessage });
    } finally {
      setCarregando(false);
    }
  };

  const toggleMostrarSenha = (campo: 'atual' | 'nova' | 'confirmar') => {
    setMostrarSenhas(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  if (!usuario) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      {/* Abas */}
      <div className="card mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setAbaSelecionada('perfil')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                abaSelecionada === 'perfil'
                  ? 'border-lds-blue text-lds-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informações Pessoais</span>
              </div>
            </button>
            <button
              onClick={() => setAbaSelecionada('senha')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                abaSelecionada === 'senha'
                  ? 'border-lds-blue text-lds-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Alterar Senha</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Mensagens de Sucesso/Erro */}
          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-6">
              {sucesso}
            </div>
          )}

          {erros.geral && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
              {erros.geral}
            </div>
          )}

          {/* Aba Perfil */}
          {abaSelecionada === 'perfil' && (
            <form onSubmit={handleSubmitPerfil} className="space-y-6">
              {/* Foto do Usuário */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-4 border-2 border-gray-300">
                  {formPerfil.fotoUsuario ? (
                    <img src={formPerfil.fotoUsuario} alt="Foto do usuário" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors mx-auto w-fit">
                  <Camera className="h-4 w-4" />
                  <span>Alterar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Informações Básicas */}
              <div className="grid gap-4">
                <div>
                  <label className="label">Nome Completo</label>
                  <input
                    type="text"
                    name="nomeUsuario"
                    value={formPerfil.nomeUsuario}
                    onChange={handleInputChangePerfil}
                    className={`input-field ${erros.nomeUsuario ? 'border-red-300' : ''}`}
                    placeholder="Seu nome completo"
                    required
                  />
                  {erros.nomeUsuario && (
                    <p className="mt-1 text-sm text-red-600">{erros.nomeUsuario}</p>
                  )}
                </div>

                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={usuario.email}
                      className="input-field pl-10 bg-gray-50 text-gray-500"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    O email não pode ser alterado. Entre em contato com o administrador se necessário.
                  </p>
                </div>

                <div>
                  <label className="label">Telefone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="telefone"
                      value={formPerfil.telefone}
                      onChange={handleInputChangePerfil}
                      className="input-field pl-10"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Cargo</label>
                  <input
                    type="text"
                    value={usuario.cargo}
                    className="input-field bg-gray-50 text-gray-500"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    O cargo é definido pelo administrador da unidade.
                  </p>
                </div>

                <div>
                  <label className="label">Unidade</label>
                  <input
                    type="text"
                    value={`${usuario.nomeUnidade} (${usuario.tipoUnidade})`}
                    className="input-field bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {carregando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Aba Senha */}
          {abaSelecionada === 'senha' && (
            <form onSubmit={handleSubmitSenha} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Alterar Senha</h3>
                <p className="text-blue-700 text-sm">
                  Para sua segurança, você precisa informar sua senha atual para definir uma nova senha.
                </p>
              </div>

              <div>
                <label className="label">Senha Atual</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarSenhas.atual ? 'text' : 'password'}
                    name="senhaAtual"
                    value={formSenha.senhaAtual}
                    onChange={handleInputChangeSenha}
                    className={`input-field pl-10 pr-10 ${erros.senhaAtual ? 'border-red-300' : ''}`}
                    placeholder="Digite sua senha atual"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleMostrarSenha('atual')}
                  >
                    {mostrarSenhas.atual ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {erros.senhaAtual && (
                  <p className="mt-1 text-sm text-red-600">{erros.senhaAtual}</p>
                )}
              </div>

              <div>
                <label className="label">Nova Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarSenhas.nova ? 'text' : 'password'}
                    name="novaSenha"
                    value={formSenha.novaSenha}
                    onChange={handleInputChangeSenha}
                    className={`input-field pl-10 pr-10 ${erros.novaSenha ? 'border-red-300' : ''}`}
                    placeholder="Digite sua nova senha"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleMostrarSenha('nova')}
                  >
                    {mostrarSenhas.nova ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {erros.novaSenha && (
                  <p className="mt-1 text-sm text-red-600">{erros.novaSenha}</p>
                )}
              </div>

              <div>
                <label className="label">Confirmar Nova Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarSenhas.confirmar ? 'text' : 'password'}
                    name="confirmarSenha"
                    value={formSenha.confirmarSenha}
                    onChange={handleInputChangeSenha}
                    className={`input-field pl-10 pr-10 ${erros.confirmarSenha ? 'border-red-300' : ''}`}
                    placeholder="Digite a nova senha novamente"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleMostrarSenha('confirmar')}
                  >
                    {mostrarSenhas.confirmar ? (
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

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Dicas de Segurança</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Use pelo menos 6 caracteres</li>
                  <li>• Combine letras maiúsculas e minúsculas</li>
                  <li>• Inclua números e símbolos</li>
                  <li>• Não use informações pessoais óbvias</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormSenha({
                      senhaAtual: '',
                      novaSenha: '',
                      confirmarSenha: ''
                    });
                    setErros({});
                    setSucesso('');
                  }}
                  className="btn-secondary"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {carregando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Alterando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Alterar Senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Informações da Conta */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações da Conta</h3>
        <div className="grid gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Data de Cadastro:</span>
            <span className="text-gray-900">
              {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de Usuário:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              usuario.tipo === 'administrador' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {usuario.tipo === 'administrador' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Unidade:</span>
            <span className="text-gray-900">{usuario.nomeUnidade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de Unidade:</span>
            <span className="text-gray-900">{usuario.tipoUnidade}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;