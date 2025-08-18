import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Mail, Phone, User, Building, Shield, Settings } from 'lucide-react';
import { AuthService } from '../services/authService';
import { CHAMADOS_DISPONIVEIS, Chamado } from '../types';
import { useAuth } from '../context/AuthContext';

interface UsuarioUnidade {
  id: string;
  usuario_id: string;
  unidade_id: string;
  cargo: string;
  tipo: 'proprietario' | 'administrador' | 'usuario';
  chamado?: string;
  permissoes: {
    criarAta: boolean;
    editarAta: boolean;
    excluirAta: boolean;
    gerenciarUsuarios: boolean;
    gerenciarSistema: boolean;
    verTodasAtas: boolean;
    verAtasPorChamado: boolean;
  };
  usuarios: {
    id: string;
    email: string;
    nome_usuario: string;
    telefone?: string;
    foto_usuario?: string;
    data_cadastro: string;
  };
}

const Usuarios: React.FC = () => {
  const { usuario } = useAuth();
  const [usuariosUnidade, setUsuariosUnidade] = useState<UsuarioUnidade[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPermissoes, setMostrarModalPermissoes] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioUnidade | null>(null);
  const [formData, setFormData] = useState({
    nomeUsuario: '',
    email: '',
    cargo: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'usuario' as 'administrador' | 'usuario',
    chamado: '' as Chamado | ''
  });
  const [permissoes, setPermissoes] = useState({
    criarAta: true,
    editarAta: false,
    excluirAta: false,
    gerenciarUsuarios: false,
    gerenciarSistema: false,
    verTodasAtas: false,
    verAtasPorChamado: true
  });
  const [fotoUsuario, setFotoUsuario] = useState<string>('');
  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      if (!usuario?.unidadeId) return;
      
      const usuarios = await AuthService.buscarUsuariosDaUnidade(usuario.unidadeId);
      setUsuariosUnidade(usuarios);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissaoChange = (permissao: string, valor: boolean) => {
    setPermissoes(prev => ({ ...prev, [permissao]: valor }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFotoUsuario(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formData.nomeUsuario.trim()) {
      novosErros.nomeUsuario = 'Nome é obrigatório';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.cargo.trim()) {
      novosErros.cargo = 'Cargo é obrigatório';
    }

    if (!usuarioEditando) {
      if (!formData.senha) {
        novosErros.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!formData.confirmarSenha) {
        novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
      } else if (formData.senha !== formData.confirmarSenha) {
        novosErros.confirmarSenha = 'Senhas não coincidem';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const abrirModal = (usuarioUnidade?: UsuarioUnidade) => {
    if (usuarioUnidade) {
      setUsuarioEditando(usuarioUnidade);
      setFormData({
        nomeUsuario: usuarioUnidade.usuarios.nome_usuario,
        email: usuarioUnidade.usuarios.email,
        cargo: usuarioUnidade.cargo,
        telefone: usuarioUnidade.usuarios.telefone || '',
        senha: '',
        confirmarSenha: '',
        tipo: usuarioUnidade.tipo === 'administrador' ? 'administrador' : 'usuario',
        chamado: (usuarioUnidade.chamado as Chamado) || ''
      });
      setPermissoes(usuarioUnidade.permissoes);
      setFotoUsuario(usuarioUnidade.usuarios.foto_usuario || '');
    } else {
      setUsuarioEditando(null);
      setFormData({
        nomeUsuario: '',
        email: '',
        cargo: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
        tipo: 'usuario',
        chamado: ''
      });
      setPermissoes({
        criarAta: true,
        editarAta: false,
        excluirAta: false,
        gerenciarUsuarios: false,
        gerenciarSistema: false,
        verTodasAtas: false,
        verAtasPorChamado: true
      });
      setFotoUsuario('');
    }
    setErros({});
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setMostrarModalPermissoes(false);
    setUsuarioEditando(null);
    setErros({});
  };

  const abrirModalPermissoes = (usuarioUnidade: UsuarioUnidade) => {
    setUsuarioEditando(usuarioUnidade);
    setPermissoes(usuarioUnidade.permissoes);
    setFormData(prev => ({ 
      ...prev, 
      chamado: (usuarioUnidade.chamado as Chamado) || '',
      tipo: usuarioUnidade.tipo === 'administrador' ? 'administrador' : 'usuario'
    }));
    setMostrarModalPermissoes(true);
  };

  const salvarPermissoes = async () => {
    if (!usuarioEditando || !usuario?.unidadeId) return;

    setCarregando(true);
    try {
      await AuthService.atualizarPermissoes(
        usuarioEditando.usuario_id,
        usuario.unidadeId,
        permissoes,
        formData.chamado || undefined
      );

      await carregarUsuarios();
      fecharModal();
      alert('Permissões atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      setErros({ geral: 'Erro ao atualizar permissões. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario() || !usuario?.unidadeId) {
      return;
    }

    setCarregando(true);

    try {
      if (usuarioEditando) {
        // Editar usuário existente - apenas atualizar dados básicos
        // Para permissões, usar o modal específico
        alert('Para editar permissões, use o botão "Gerenciar Permissões"');
      } else {
        // Criar novo usuário
        const dadosUsuario = {
          email: formData.email,
          senha: formData.senha,
          nomeUsuario: formData.nomeUsuario,
          telefone: formData.telefone,
          fotoUsuario: fotoUsuario,
          cargo: formData.cargo
        };

        await AuthService.cadastrarUsuarioNaUnidade(
          dadosUsuario,
          usuario.unidadeId,
          formData.tipo,
          permissoes,
          formData.chamado || undefined
        );

        await carregarUsuarios();
        fecharModal();
        alert('Usuário cadastrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErros({ geral: error instanceof Error ? error.message : 'Erro ao salvar usuário. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const excluirUsuario = async (usuarioUnidade: UsuarioUnidade) => {
    if (!usuario?.unidadeId) return;

    if (window.confirm(`Tem certeza que deseja remover ${usuarioUnidade.usuarios.nome_usuario} desta unidade?`)) {
      try {
        await AuthService.removerUsuarioDaUnidade(usuarioUnidade.usuario_id, usuario.unidadeId);
        await carregarUsuarios();
        alert('Usuário removido da unidade com sucesso!');
      } catch (error) {
        console.error('Erro ao remover usuário:', error);
        alert('Erro ao remover usuário. Tente novamente.');
      }
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'proprietario': return 'bg-red-100 text-red-800';
      case 'administrador': return 'bg-blue-100 text-blue-800';
      case 'usuario': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'proprietario': return 'Proprietário';
      case 'administrador': return 'Administrador';
      case 'usuario': return 'Usuário';
      default: return tipo;
    }
  };

  // Verificar se o usuário atual pode gerenciar outros usuários
  const podeGerenciarUsuarios = usuario?.permissoes?.gerenciarUsuarios || usuario?.tipo === 'administrador';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários da sua unidade e suas permissões</p>
        </div>
        {podeGerenciarUsuarios && (
          <button
            onClick={() => abrirModal()}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Novo Usuário</span>
          </button>
        )}
      </div>

      {usuariosUnidade.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando usuários à sua unidade.</p>
          {podeGerenciarUsuarios && (
            <button
              onClick={() => abrirModal()}
              className="btn-primary"
            >
              Adicionar Primeiro Usuário
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {usuariosUnidade.map((usuarioUnidade) => (
            <div key={usuarioUnidade.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {usuarioUnidade.usuarios.foto_usuario ? (
                      <img 
                        src={usuarioUnidade.usuarios.foto_usuario} 
                        alt={usuarioUnidade.usuarios.nome_usuario} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{usuarioUnidade.usuarios.nome_usuario}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoBadgeColor(usuarioUnidade.tipo)}`}>
                        {getTipoLabel(usuarioUnidade.tipo)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{usuarioUnidade.cargo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{usuarioUnidade.usuarios.email}</span>
                      </div>
                      {usuarioUnidade.usuarios.telefone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{usuarioUnidade.usuarios.telefone}</span>
                        </div>
                      )}
                    </div>
                    {usuarioUnidade.chamado && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Chamado: {CHAMADOS_DISPONIVEIS[usuarioUnidade.chamado as Chamado]}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cadastrado em {new Date(usuarioUnidade.usuarios.data_cadastro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                {podeGerenciarUsuarios && usuarioUnidade.usuario_id !== usuario?.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => abrirModalPermissoes(usuarioUnidade)}
                      className="p-2 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-colors"
                      title="Gerenciar permissões"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => abrirModal(usuarioUnidade)}
                      className="p-2 text-lds-blue hover:bg-lds-blue hover:text-white rounded-lg transition-colors"
                      title="Editar usuário"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => excluirUsuario(usuarioUnidade)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                      title="Remover usuário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Usuário */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {erros.geral && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {erros.geral}
                  </div>
                )}

                {/* Foto do Usuário */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-3">
                    {fotoUsuario ? (
                      <img src={fotoUsuario} alt="Foto do usuário" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm transition-colors">
                    Escolher Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nome Completo</label>
                    <input
                      type="text"
                      name="nomeUsuario"
                      value={formData.nomeUsuario}
                      onChange={handleInputChange}
                      className={`input-field ${erros.nomeUsuario ? 'border-red-300' : ''}`}
                      placeholder="Nome completo"
                      required
                    />
                    {erros.nomeUsuario && (
                      <p className="mt-1 text-sm text-red-600">{erros.nomeUsuario}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input-field ${erros.email ? 'border-red-300' : ''}`}
                      placeholder="email@exemplo.com"
                      required
                    />
                    {erros.email && (
                      <p className="mt-1 text-sm text-red-600">{erros.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Cargo</label>
                    <select
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      className={`input-field ${erros.cargo ? 'border-red-300' : ''}`}
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
                      <option value="Presidente das Moças">Presidente das Moças</option>
                      <option value="Presidente da Sociedade de Socorro">Presidente da Sociedade de Socorro</option>
                      <option value="Presidente da Primária">Presidente da Primária</option>
                      <option value="Presidente dos Rapazes">Presidente dos Rapazes</option>
                      <option value="Presidente da Escola Dominical">Presidente da Escola Dominical</option>
                      <option value="Outro">Outro</option>
                    </select>
                    {erros.cargo && (
                      <p className="mt-1 text-sm text-red-600">{erros.cargo}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="label">Tipo de Usuário</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="usuario">Usuário</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Chamado/Área</label>
                    <select
                      name="chamado"
                      value={formData.chamado}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Acesso Geral</option>
                      {Object.entries(CHAMADOS_DISPONIVEIS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!usuarioEditando && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Senha</label>
                      <input
                        type="password"
                        name="senha"
                        value={formData.senha}
                        onChange={handleInputChange}
                        className={`input-field ${erros.senha ? 'border-red-300' : ''}`}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      {erros.senha && (
                        <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Confirmar Senha</label>
                      <input
                        type="password"
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleInputChange}
                        className={`input-field ${erros.confirmarSenha ? 'border-red-300' : ''}`}
                        placeholder="Digite a senha novamente"
                        required
                      />
                      {erros.confirmarSenha && (
                        <p className="mt-1 text-sm text-red-600">{erros.confirmarSenha}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Permissões Básicas */}
                {!usuarioEditando && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Permissões</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(permissoes).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handlePermissaoChange(key, e.target.checked)}
                            className="h-4 w-4 text-lds-blue focus:ring-lds-light-blue border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {key === 'criarAta' && 'Criar Atas'}
                            {key === 'editarAta' && 'Editar Atas'}
                            {key === 'excluirAta' && 'Excluir Atas'}
                            {key === 'gerenciarUsuarios' && 'Gerenciar Usuários'}
                            {key === 'gerenciarSistema' && 'Gerenciar Sistema'}
                            {key === 'verTodasAtas' && 'Ver Todas as Atas'}
                            {key === 'verAtasPorChamado' && 'Ver Atas por Chamado'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={carregando}
                    className="btn-primary disabled:opacity-50"
                  >
                    {carregando ? 'Salvando...' : (usuarioEditando ? 'Salvar' : 'Criar Usuário')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Permissões */}
      {mostrarModalPermissoes && usuarioEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Gerenciar Permissões</span>
              </h3>
              
              {erros.geral && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                  {erros.geral}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{usuarioEditando.usuarios.nome_usuario}</h4>
                  <p className="text-sm text-gray-600">{usuarioEditando.usuarios.email}</p>
                </div>

                <div>
                  <label className="label">Tipo de Usuário</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="label">Chamado/Área de Atuação</label>
                  <select
                    name="chamado"
                    value={formData.chamado}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Acesso Geral</option>
                    {Object.entries(CHAMADOS_DISPONIVEIS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Define quais atas o usuário pode visualizar
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Permissões</h4>
                  <div className="space-y-2">
                    {Object.entries(permissoes).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePermissaoChange(key, e.target.checked)}
                          className="h-4 w-4 text-lds-blue focus:ring-lds-light-blue border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {key === 'criarAta' && 'Criar Atas'}
                          {key === 'editarAta' && 'Editar Atas'}
                          {key === 'excluirAta' && 'Excluir Atas'}
                          {key === 'gerenciarUsuarios' && 'Gerenciar Usuários'}
                          {key === 'gerenciarSistema' && 'Gerenciar Sistema'}
                          {key === 'verTodasAtas' && 'Ver Todas as Atas'}
                          {key === 'verAtasPorChamado' && 'Ver Atas por Chamado'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarPermissoes}
                  disabled={carregando}
                  className="btn-primary disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Salvar Permissões'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;