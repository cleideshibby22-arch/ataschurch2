import React, { useState, useEffect } from 'react';
import { Shield, Database, Users, Building, BarChart3, Settings, Download, Upload, AlertTriangle, CheckCircle, Globe, Server, Activity, Plus, Edit, Trash2, Image, UserPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUsuarioLogado, criarUnidade, logout, excluirUnidadeCompleta, excluirUsuarioGlobal, obterEstatisticasUnidade } from '../utils/auth';
import { Usuario, Unidade } from '../types';

const ProprietarioPanel: React.FC = () => {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [mostrarModalUnidade, setMostrarModalUnidade] = useState(false);
  const [unidadeEditando, setUnidadeEditando] = useState<Unidade | null>(null);
  const [formUnidade, setFormUnidade] = useState({
    nome: '',
    tipo: '',
    logo: ''
  });
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [formUsuario, setFormUsuario] = useState({
    nomeUsuario: '',
    email: '',
    senha: '',
    cargo: '',
    telefone: '',
    fotoUsuario: '',
    unidadeSelecionada: ''
  });
  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalUnidades: 0,
    totalUsuarios: 0,
    unidadesAtivas: 0,
    espacoTotal: '0 KB'
  });
  const [mostrarModalExclusao, setMostrarModalExclusao] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<{tipo: 'unidade' | 'usuario', id: string, nome: string} | null>(null);

  // Verificar se é o proprietário do sistema
  useEffect(() => {
    if (!usuario || usuario.email !== 'admin@sistema.com') {
      navigate('/proprietario-login');
      return;
    }
    carregarEstatisticasGerais();
    carregarUnidades();
  }, [usuario, navigate]);

  const carregarUnidades = () => {
    const unidadesSalvas = JSON.parse(localStorage.getItem('unidades') || '[]') as Unidade[];
    setUnidades(unidadesSalvas);
  };

  const carregarEstatisticasGerais = () => {
    try {
      const todasUnidades = JSON.parse(localStorage.getItem('unidades') || '[]') as Unidade[];
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]') as Usuario[];

      const totalUsuarios = usuarios.length;
      const unidadesAtivas = todasUnidades.filter(u => u.ativa !== false).length;

      // Calcular espaço total usado
      const dadosCompletos = {
        usuarios: localStorage.getItem('usuarios') || '[]',
        unidades: localStorage.getItem('unidades') || '[]',
        usuarioUnidades: localStorage.getItem('usuario-unidades') || '[]'
      };
      
      const tamanhoTotal = Object.values(dadosCompletos).reduce((total, dados) => {
        return total + new Blob([dados]).size;
      }, 0);

      setEstatisticasGerais({
        totalUnidades: todasUnidades.length,
        totalUsuarios,
        unidadesAtivas,
        espacoTotal: formatarTamanho(tamanhoTotal)
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormUnidade(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormUnidade(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormulario = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formUnidade.nome.trim()) {
      novosErros.nome = 'Nome da unidade é obrigatório';
    }

    if (!formUnidade.tipo.trim()) {
      novosErros.tipo = 'Tipo da unidade é obrigatório';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const abrirModalUnidade = (unidade?: Unidade) => {
    if (unidade) {
      setUnidadeEditando(unidade);
      setFormUnidade({
        nome: unidade.nome,
        tipo: unidade.tipo,
        logo: unidade.logo || ''
      });
    } else {
      setUnidadeEditando(null);
      setFormUnidade({
        nome: '',
        tipo: '',
        logo: ''
      });
    }
    setErros({});
    setMostrarModalUnidade(true);
  };

  const fecharModal = () => {
    setMostrarModalUnidade(false);
    setUnidadeEditando(null);
    setErros({});
  };

  const abrirModalUsuario = () => {
    setFormUsuario({
      nomeUsuario: '',
      email: '',
      senha: '',
      cargo: '',
      telefone: '',
      fotoUsuario: '',
      unidadeSelecionada: ''
    });
    setErros({});
    setMostrarModalUsuario(true);
  };

  const fecharModalUsuario = () => {
    setMostrarModalUsuario(false);
    setErros({});
  };

  const handleInputChangeUsuario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormUsuario(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormUsuario(prev => ({ ...prev, fotoUsuario: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validarFormularioUsuario = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formUsuario.nomeUsuario.trim()) {
      novosErros.nomeUsuario = 'Nome é obrigatório';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formUsuario.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formUsuario.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formUsuario.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (formUsuario.senha.length < 6) {
      novosErros.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formUsuario.cargo.trim()) {
      novosErros.cargo = 'Cargo é obrigatório';
    }

    if (!formUsuario.unidadeSelecionada) {
      novosErros.unidadeSelecionada = 'Selecione uma unidade';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmitUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormularioUsuario()) {
      return;
    }

    try {
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]') as Usuario[];
      const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
      const unidadeSelecionada = unidades.find(u => u.id === formUsuario.unidadeSelecionada);
      
      if (!unidadeSelecionada) {
        setErros({ geral: 'Unidade não encontrada' });
        return;
      }

      // Verificar se já existe usuário com este email
      const usuarioExistente = usuarios.find(u => u.email === formUsuario.email);
      
      if (usuarioExistente) {
        // Verificar se já está nesta unidade
        const jaTemAcesso = usuarioUnidades.find((uu: any) => 
          uu.usuarioId === usuarioExistente.id && uu.unidadeId === formUsuario.unidadeSelecionada
        );
        
        if (jaTemAcesso) {
          setErros({ geral: 'Usuário já tem acesso a esta unidade' });
          return;
        }
        
        // Adicionar usuário existente à nova unidade
        const novaRelacao = {
          usuarioId: usuarioExistente.id,
          unidadeId: formUsuario.unidadeSelecionada,
          cargo: formUsuario.cargo,
          tipo: 'usuario' as const,
          permissoes: {
            criarAta: true,
            editarAta: false,
            excluirAta: false,
            gerenciarUsuarios: false,
            gerenciarSistema: false
          }
        };
        
        usuarioUnidades.push(novaRelacao);
        localStorage.setItem('usuario-unidades', JSON.stringify(usuarioUnidades));
      } else {
        // Criar novo usuário
        const novoUsuario: Usuario = {
          id: Date.now().toString(),
          senha: formUsuario.senha,
          unidadeId: formUsuario.unidadeSelecionada,
          tipoUnidade: unidadeSelecionada.tipo,
          nomeUnidade: unidadeSelecionada.nome,
          logoUnidade: unidadeSelecionada.logo || '',
          nomeUsuario: formUsuario.nomeUsuario,
          email: formUsuario.email,
          cargo: formUsuario.cargo,
          telefone: formUsuario.telefone,
          fotoUsuario: formUsuario.fotoUsuario,
          dataCadastro: new Date().toISOString(),
          tipo: 'usuario',
          permissoes: {
            criarAta: true,
            editarAta: false,
            excluirAta: false,
            gerenciarUsuarios: false,
            gerenciarSistema: false
          }
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Adicionar relação usuário-unidade
        const novaRelacao = {
          usuarioId: novoUsuario.id,
          unidadeId: formUsuario.unidadeSelecionada,
          cargo: formUsuario.cargo,
          tipo: 'usuario' as const,
          permissoes: {
            criarAta: true,
            editarAta: false,
            excluirAta: false,
            gerenciarUsuarios: false,
            gerenciarSistema: false
          }
        };
        
        usuarioUnidades.push(novaRelacao);
        localStorage.setItem('usuario-unidades', JSON.stringify(usuarioUnidades));
      }

      fecharModalUsuario();
      carregarEstatisticasGerais();
      alert('Usuário adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setErros({ geral: 'Erro ao criar usuário. Tente novamente.' });
    }
  };
  const confirmarExclusao = (tipo: 'unidade' | 'usuario', id: string, nome: string) => {
    setItemParaExcluir({ tipo, id, nome });
    setMostrarModalExclusao(true);
  };

  const executarExclusao = () => {
    if (!itemParaExcluir) return;

    try {
      if (itemParaExcluir.tipo === 'unidade') {
        excluirUnidade(itemParaExcluir.id);
      } else {
        excluirUsuario(itemParaExcluir.id);
      }
      setMostrarModalExclusao(false);
      setItemParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir. Tente novamente.');
    }
  };

  const excluirUnidade = (unidadeId: string) => {
    const resultado = excluirUnidadeCompleta(unidadeId);
    if (resultado.sucesso) {
      carregarUnidades();
      carregarEstatisticasGerais();
      alert('Unidade e todos os dados relacionados foram removidos com sucesso.');
    } else {
      alert(resultado.erro || 'Erro ao excluir unidade.');
    }
  };

  const excluirUsuario = (usuarioId: string) => {
    const resultado = excluirUsuarioGlobal(usuarioId);
    if (resultado.sucesso) {
      carregarEstatisticasGerais();
      alert('Usuário removido com sucesso de todas as unidades.');
    } else {
      alert(resultado.erro || 'Erro ao excluir usuário.');
    }
  };

  const obterUsuariosGlobais = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioUnidades = JSON.parse(localStorage.getItem('usuario-unidades') || '[]');
    
    return usuarios.map((usuario: any) => {
      const relacoes = usuarioUnidades.filter((uu: any) => uu.usuarioId === usuario.id);
      const unidadesDoUsuario = relacoes.map((rel: any) => {
        const unidade = unidades.find(u => u.id === rel.unidadeId);
        return unidade ? `${unidade.nome} (${rel.cargo})` : 'Unidade não encontrada';
      });
      
      return {
        ...usuario,
        unidades: unidadesDoUsuario,
        totalUnidades: relacoes.length
      };
    });
  };

  const handleSubmitUnidade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    if (unidadeEditando) {
      // Editar unidade existente
      const unidadesAtualizadas = unidades.map(u => 
        u.id === unidadeEditando.id 
          ? { ...u, nome: formUnidade.nome, tipo: formUnidade.tipo, logo: formUnidade.logo }
          : u
      );
      setUnidades(unidadesAtualizadas);
      localStorage.setItem('unidades', JSON.stringify(unidadesAtualizadas));
    } else {
      // Criar nova unidade
      const novaUnidade = criarUnidade({
        nome: formUnidade.nome,
        tipo: formUnidade.tipo,
        logo: formUnidade.logo,
        ativa: true,
        proprietarioId: usuario?.id || 'system-owner'
      });
      
      setUnidades(prev => [...prev, novaUnidade]);
    }

    fecharModal();
    carregarEstatisticasGerais();
  };

  const toggleUnidadeAtiva = (unidadeId: string) => {
    const unidadesAtualizadas = unidades.map(u => 
      u.id === unidadeId ? { ...u, ativa: !u.ativa } : u
    );
    setUnidades(unidadesAtualizadas);
    localStorage.setItem('unidades', JSON.stringify(unidadesAtualizadas));
    carregarEstatisticasGerais();
  };

  const exportarDadosGlobais = () => {
    const dadosGlobais = {
      sistema: {
        versao: '1.0.0',
        exportadoEm: new Date().toISOString(),
        proprietario: 'Sistema de Atas da Igreja'
      },
      unidades: unidades,
      usuarios: JSON.parse(localStorage.getItem('usuarios') || '[]'),
      usuarioUnidades: JSON.parse(localStorage.getItem('usuario-unidades') || '[]'),
      estatisticas: estatisticasGerais
    };

    const blob = new Blob([JSON.stringify(dadosGlobais, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sistema-completo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario || usuario.email !== 'admin@sistema.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Proprietário */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-bold">Painel do Proprietário</h1>
                <p className="text-xs text-red-200">Gerenciamento de Unidades</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="text-right">
                  <div className="font-medium">{usuario.nomeUsuario}</div>
                  <div className="text-xs text-red-200">Proprietário do Sistema</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-200 hover:text-white hover:bg-red-700 transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Cabeçalho */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-10 w-10 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Unidades</h1>
            </div>
            <p className="text-lg text-gray-600">
              Administração Global das Unidades da Igreja
            </p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <Shield className="h-4 w-4 mr-1" />
              Acesso Restrito - Proprietário do Sistema
            </div>
          </div>

          {/* Estatísticas Globais */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalUnidades}</h3>
                  <p className="text-gray-600">Unidades Cadastradas</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{estatisticasGerais.unidadesAtivas}</h3>
                  <p className="text-gray-600">Unidades Ativas</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{estatisticasGerais.totalUsuarios}</h3>
                  <p className="text-gray-600">Usuários Cadastrados</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{estatisticasGerais.espacoTotal}</h3>
                  <p className="text-gray-600">Espaço Utilizado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Status do Sistema</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Sistema Online</h3>
                </div>
                <p className="text-green-700 text-sm">Todos os serviços funcionando normalmente</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Conectividade</h3>
                </div>
                <p className="text-blue-700 text-sm">Conexões estáveis em todas as regiões</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Banco de Dados</h3>
                </div>
                <p className="text-purple-700 text-sm">Backup automático ativo</p>
              </div>
            </div>
          </div>

          {/* Unidades Cadastradas */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span>Unidades do Sistema</span>
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={abrirModalUsuario}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Novo Usuário</span>
                </button>
                <button
                  onClick={() => abrirModalUnidade()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Unidade</span>
                </button>
              </div>
            </div>
            
            {unidades.length > 0 ? (
              <div className="space-y-4">
                {unidades.map((unidade) => (
                  <div key={unidade.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {unidade.logo && (
                          <img 
                            src={unidade.logo} 
                            alt="Logo da unidade" 
                            className="h-10 w-10 rounded object-contain bg-white p-1 border"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{unidade.nome}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{unidade.tipo}</span>
                            <span>Criada em: {new Date(unidade.dataCriacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleUnidadeAtiva(unidade.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            unidade.ativa 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {unidade.ativa ? 'Ativa' : 'Inativa'}
                        </button>
                        <button
                          onClick={() => abrirModalUnidade(unidade)}
                          className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          title="Editar unidade"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmarExclusao('unidade', unidade.id, unidade.nome)}
                          className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                          title="Excluir unidade"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma unidade cadastrada</h3>
                <p className="text-gray-600 mb-4">Comece criando a primeira unidade do sistema.</p>
                <button
                  onClick={() => abrirModalUnidade()}
                  className="btn-primary"
                >
                  Criar Primeira Unidade
                </button>
              </div>
            )}
          </div>

          {/* Usuários Globais */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Usuários do Sistema</span>
              </h2>
            </div>
            
            {obterUsuariosGlobais().length > 0 ? (
              <div className="space-y-4">
                {obterUsuariosGlobais().map((usuario: any) => (
                  <div key={usuario.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {usuario.foto_usuario && (
                          <img 
                            src={usuario.foto_usuario} 
                            alt="Foto do usuário" 
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{usuario.nome_usuario}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{usuario.email}</span>
                            <span>{usuario.totalUnidades} unidade{usuario.totalUnidades !== 1 ? 's' : ''}</span>
                          </div>
                          {usuario.unidades.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Unidades: {usuario.unidades.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {usuario.totalUnidades} unidade{usuario.totalUnidades !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => confirmarExclusao('usuario', usuario.id, usuario.nome_usuario)}
                          className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário cadastrado</h3>
                <p className="text-gray-600">Os usuários aparecerão aqui conforme forem cadastrados.</p>
              </div>
            )}
          </div>

          {/* Ferramentas de Administração */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Ferramentas de Administração</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={exportarDadosGlobais}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar Dados Globais</span>
              </button>

              <button
                onClick={() => alert('Funcionalidade em desenvolvimento')}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Gerar Relatório de Uso</span>
              </button>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
            <p>Sistema de Atas da Igreja - Painel do Proprietário</p>
            <p className="mt-1">© 2024 - Todos os direitos reservados</p>
          </div>
        </div>
      </main>

      {/* Modal de Nova Unidade */}
      {mostrarModalUnidade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {unidadeEditando ? 'Editar Unidade' : 'Nova Unidade'}
              </h3>
              
              <form onSubmit={handleSubmitUnidade} className="space-y-4">
                {erros.geral && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {erros.geral}
                  </div>
                )}

                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mx-auto mb-3">
                    {formUnidade.logo ? (
                      <img src={formUnidade.logo} alt="Logo da unidade" className="w-full h-full object-contain" />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm transition-colors">
                    Escolher Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="label">Tipo de Unidade</label>
                  <select
                    name="tipo"
                    value={formUnidade.tipo}
                    onChange={handleInputChange}
                    className={`input-field ${erros.tipo ? 'border-red-300' : ''}`}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Ala">Ala</option>
                    <option value="Ramo">Ramo</option>
                    <option value="Distrito">Distrito</option>
                    <option value="Estaca">Estaca</option>
                  </select>
                  {erros.tipo && (
                    <p className="mt-1 text-sm text-red-600">{erros.tipo}</p>
                  )}
                </div>

                <div>
                  <label className="label">Nome da Unidade</label>
                  <input
                    type="text"
                    name="nome"
                    value={formUnidade.nome}
                    onChange={handleInputChange}
                    className={`input-field ${erros.nome ? 'border-red-300' : ''}`}
                    placeholder="Ex: São Paulo Centro"
                    required
                  />
                  {erros.nome && (
                    <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
                  )}
                </div>

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
                    className="btn-primary"
                  >
                    {unidadeEditando ? 'Salvar' : 'Criar Unidade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {mostrarModalExclusao && itemParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">
                  <strong>ATENÇÃO:</strong> Você está prestes a excluir {itemParaExcluir.tipo === 'unidade' ? 'a unidade' : 'o usuário'}{' '}
                  <strong>"{itemParaExcluir.nome}"</strong>.
                </p>
                {itemParaExcluir.tipo === 'unidade' && (
                  <>
                    <p className="text-red-700 mt-2 text-sm">
                      Todos os dados relacionados serão removidos: usuários, atas, hinos personalizados, etc.
                    </p>
                    {(() => {
                      const stats = obterEstatisticasUnidade(itemParaExcluir.id);
                      return (
                        <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                          <p className="text-red-800 font-medium text-sm">Dados que serão removidos:</p>
                          <ul className="text-red-700 text-xs mt-1 space-y-1">
                            <li>• {stats.usuarios} usuário(s)</li>
                            <li>• {stats.atas} ata(s)</li>
                            <li>• {stats.hinos} hino(s) personalizado(s)</li>
                          </ul>
                        </div>
                      );
                    })()}
                  </>
                )}
                {itemParaExcluir.tipo === 'usuario' && (
                  <>
                    <p className="text-red-700 mt-2 text-sm">
                      O usuário será removido de todas as unidades e perderá acesso ao sistema.
                    </p>
                    {(() => {
                      const usuarioCompleto = obterUsuariosGlobais().find(u => u.id === itemParaExcluir.id);
                      return usuarioCompleto && (
                        <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                          <p className="text-red-800 font-medium text-sm">Acesso que será removido:</p>
                          <ul className="text-red-700 text-xs mt-1 space-y-1">
                            {usuarioCompleto.unidades.map((unidade: string, index: number) => (
                              <li key={index}>• {unidade}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setMostrarModalExclusao(false);
                    setItemParaExcluir(null);
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={executarExclusao}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir Definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Novo Usuário */}
      {mostrarModalUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Novo Usuário Global</h3>
              
              <form onSubmit={handleSubmitUsuario} className="space-y-4">
                {erros.geral && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {erros.geral}
                  </div>
                )}

                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mx-auto mb-3">
                    {formUsuario.fotoUsuario ? (
                      <img src={formUsuario.fotoUsuario} alt="Foto do usuário" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm transition-colors">
                    Escolher Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoUsuarioChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="label">Unidade</label>
                  <select
                    name="unidadeSelecionada"
                    value={formUsuario.unidadeSelecionada}
                    onChange={handleInputChangeUsuario}
                    className={`input-field ${erros.unidadeSelecionada ? 'border-red-300' : ''}`}
                    required
                  >
                    <option value="">Selecione a unidade</option>
                    {unidades.filter(u => u.ativa).map(unidade => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </select>
                  {erros.unidadeSelecionada && (
                    <p className="mt-1 text-sm text-red-600">{erros.unidadeSelecionada}</p>
                  )}
                </div>

                <div>
                  <label className="label">Nome Completo</label>
                  <input
                    type="text"
                    name="nomeUsuario"
                    value={formUsuario.nomeUsuario}
                    onChange={handleInputChangeUsuario}
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
                    value={formUsuario.email}
                    onChange={handleInputChangeUsuario}
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
                    value={formUsuario.cargo}
                    onChange={handleInputChangeUsuario}
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
                    value={formUsuario.telefone}
                    onChange={handleInputChangeUsuario}
                    className="input-field"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="label">Senha</label>
                  <input
                    type="password"
                    name="senha"
                    value={formUsuario.senha}
                    onChange={handleInputChangeUsuario}
                    className={`input-field ${erros.senha ? 'border-red-300' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  {erros.senha && (
                    <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={fecharModalUsuario}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Criar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProprietarioPanel;