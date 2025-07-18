import React, { useState, useEffect } from 'react';
import { Settings, Database, Users, FileText, Trash2, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAta } from '../context/AtaContext';
import { getUsuarioLogado, limparTodosDados } from '../utils/auth';
import { Usuario } from '../types';

const Admin: React.FC = () => {
  const { atas, limparTodasAtas } = useAta();
  const usuario = getUsuarioLogado();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    totalAtas: 0,
    totalUsuarios: 0,
    espacoUtilizado: '0 KB'
  });

  useEffect(() => {
    const usuariosUnidade = JSON.parse(localStorage.getItem('usuarios-unidade') || '[]') as Usuario[];
    setUsuarios(usuariosUnidade);
    
    // Calcular estatísticas
    const dadosLocalStorage = {
      atas: localStorage.getItem('atas-sacramentais') || '[]',
      usuarios: localStorage.getItem('usuarios-unidade') || '[]',
      hinos: localStorage.getItem('hinos-personalizados') || '[]'
    };
    
    const tamanhoTotal = Object.values(dadosLocalStorage).reduce((total, dados) => {
      return total + new Blob([dados]).size;
    }, 0);
    
    setEstatisticas({
      totalAtas: atas.length,
      totalUsuarios: usuariosUnidade.length,
      espacoUtilizado: formatarTamanho(tamanhoTotal)
    });
  }, [atas]);

  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportarDados = () => {
    const dados = {
      atas: JSON.parse(localStorage.getItem('atas-sacramentais') || '[]'),
      usuarios: JSON.parse(localStorage.getItem('usuarios-unidade') || '[]'),
      hinosPersonalizados: JSON.parse(localStorage.getItem('hinos-personalizados') || '[]'),
      exportadoEm: new Date().toISOString(),
      versao: '1.0'
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-atas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importarDados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string);
        
        if (dados.atas) {
          localStorage.setItem('atas-sacramentais', JSON.stringify(dados.atas));
        }
        if (dados.usuarios) {
          localStorage.setItem('usuarios-unidade', JSON.stringify(dados.usuarios));
        }
        if (dados.hinosPersonalizados) {
          localStorage.setItem('hinos-personalizados', JSON.stringify(dados.hinosPersonalizados));
        }
        
        alert('Dados importados com sucesso! A página será recarregada.');
        window.location.reload();
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
  };

  const limparTodosSistema = () => {
    if (window.confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema (atas, usuários, hinos personalizados). Esta ação não pode ser desfeita. Tem certeza?')) {
      if (window.confirm('Última confirmação: Todos os dados serão perdidos permanentemente. Continuar?')) {
        limparTodosDados();
        alert('Todos os dados foram removidos. A página será recarregada.');
        window.location.reload();
      }
    }
  };

  const resetarSenhaUsuario = (usuarioId: string, nomeUsuario: string) => {
    if (window.confirm(`Resetar a senha do usuário ${nomeUsuario} para "123456"?`)) {
      const usuariosAtualizados = usuarios.map(u => 
        u.id === usuarioId ? { ...u, senha: '123456' } : u
      );
      setUsuarios(usuariosAtualizados);
      localStorage.setItem('usuarios-unidade', JSON.stringify(usuariosAtualizados));
      alert(`Senha do usuário ${nomeUsuario} foi resetada para "123456"`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
          <Settings className="h-8 w-8 text-lds-blue" />
          <span>Painel de Administração</span>
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie o sistema e monitore o uso da aplicação
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-lds-blue p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{estatisticas.totalAtas}</h3>
              <p className="text-gray-600">Total de Atas</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-lds-light-blue p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{estatisticas.totalUsuarios}</h3>
              <p className="text-gray-600">Usuários Cadastrados</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 p-3 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{estatisticas.espacoUtilizado}</h3>
              <p className="text-gray-600">Espaço Utilizado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Informações do Sistema</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Unidade</h3>
            <p className="text-gray-600">{usuario?.nomeUnidade}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Administrador</h3>
            <p className="text-gray-600">{usuario?.nomeUsuario}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Versão</h3>
            <p className="text-gray-600">1.0.0</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Última Ata</h3>
            <p className="text-gray-600">
              {atas.length > 0 
                ? new Date(atas[0].criado_em).toLocaleDateString('pt-BR')
                : 'Nenhuma ata criada'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Dados */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Database className="h-5 w-5 text-lds-blue" />
          <span>Gerenciamento de Dados</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={exportarDados}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Backup</span>
          </button>

          <label className="btn-secondary flex items-center justify-center space-x-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Importar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={importarDados}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Dica:</strong> Faça backup regularmente dos seus dados. O backup inclui todas as atas, usuários e hinos personalizados.
          </p>
        </div>
      </div>

      {/* Gerenciamento de Usuários */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5 text-lds-blue" />
          <span>Gerenciamento de Usuários</span>
        </h2>

        {usuarios.length > 0 ? (
          <div className="space-y-3">
            {usuarios.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{user.nomeUsuario}</h3>
                  <p className="text-sm text-gray-600">{user.email} • {user.cargo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.tipo === 'administrador' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.tipo === 'administrador' ? 'Admin' : 'Usuário'}
                  </span>
                  {user.id !== usuario?.id && (
                    <button
                      onClick={() => resetarSenhaUsuario(user.id, user.nomeUsuario)}
                      className="text-sm text-lds-blue hover:text-lds-light-blue"
                    >
                      Resetar Senha
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhum usuário cadastrado.</p>
        )}
      </div>

      {/* Zona de Perigo */}
      <div className="card p-6 border-red-200">
        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Zona de Perigo</span>
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">Limpar Todas as Atas</h3>
            <p className="text-red-700 text-sm mb-3">
              Remove todas as atas do sistema. Os usuários e configurações serão mantidos.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja remover todas as atas? Esta ação não pode ser desfeita.')) {
                  limparTodasAtas();
                  alert('Todas as atas foram removidas.');
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Limpar Atas
            </button>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">Resetar Sistema Completo</h3>
            <p className="text-red-700 text-sm mb-3">
              Remove TODOS os dados do sistema: atas, usuários, hinos personalizados e configurações.
            </p>
            <button
              onClick={limparTodosSistema}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Resetar Tudo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;