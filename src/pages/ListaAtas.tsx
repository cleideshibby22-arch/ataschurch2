import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useAta } from '../context/AtaContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TIPOS_REUNIAO, TipoReuniao } from '../types';
import { temPermissao } from '../utils/auth';

const ListaAtas: React.FC = () => {
  const { atas, excluirAta, carregando } = useAta();
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [alaFiltro, setAlaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoReuniao | ''>('');

  const atasFiltradas = atas.filter(ata => {
    const matchBusca = ata.ala.toLowerCase().includes(busca.toLowerCase()) ||
                      ata.estaca.toLowerCase().includes(busca.toLowerCase());
    const matchAla = alaFiltro === '' || ata.ala === alaFiltro;
    const matchTipo = tipoFiltro === '' || ata.tipo === tipoFiltro;
    return matchBusca && matchAla && matchTipo;
  });

  const alasUnicas = Array.from(new Set(atas.map(ata => ata.ala))).sort();
  const tiposUnicos = Array.from(new Set(atas.map(ata => ata.tipo))).sort();

  const handleExcluir = (id: string, nomeAla: string, tipo: TipoReuniao) => {
    const tipoNome = TIPOS_REUNIAO[tipo];
    if (window.confirm(`Tem certeza que deseja excluir a ata de ${tipoNome} da ${nomeAla}?`)) {
      try {
        excluirAta(id);
      } catch (error) {
        console.error('Erro ao excluir ata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir ata. Tente novamente.';
        alert(errorMessage);
      }
    }
  };

  const getAtaDescription = (ata: any) => {
    if (ata.tipo === 'sacramental') {
      return `Presidida: ${ata.presidida_por} • Dirigida: ${ata.dirigida_por}${ata.frequencia ? ` • Frequência: ${ata.frequencia}` : ''}`;
    } else {
      const participantesPresentes = ata.participantes?.filter((p: any) => p.presente).length || 0;
      const totalParticipantes = ata.participantes?.length || 0;
      return `Presidida: ${ata.presidida_por} • Dirigida: ${ata.dirigida_por} • Participantes: ${participantesPresentes}/${totalParticipantes}`;
    }
  };

  const getAtaContent = (ata: any) => {
    if (ata.tipo === 'sacramental') {
      const oradores = [ata.primeiro_orador, ata.segundo_orador, ata.ultimo_orador].filter(Boolean);
      return oradores.length > 0 ? `Oradores: ${oradores.join(', ')}` : '';
    } else {
      const assuntos = ata.assuntos_discutidos?.length || 0;
      const acoes = ata.acoes_designadas?.length || 0;
      return `${assuntos} assunto${assuntos !== 1 ? 's' : ''} • ${acoes} ação${acoes !== 1 ? 'ões' : ''} designada${acoes !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Atas de Reuniões</h1>
        <p className="text-gray-600">Visualize e gerencie todas as atas registradas</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por ala ou estaca..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoReuniao | '')}
              className="input-field"
            >
              <option value="">Todos os tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{TIPOS_REUNIAO[tipo]}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <select
              value={alaFiltro}
              onChange={(e) => setAlaFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as alas</option>
              {alasUnicas.map(ala => (
                <option key={ala} value={ala}>{ala}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {atasFiltradas.length === 0 ? (
        carregando ? (
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lds-blue mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando atas...</h3>
            <p className="text-gray-600">Aguarde enquanto buscamos as atas.</p>
          </div>
        ) : (
        <div className="card p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {atas.length === 0 ? 'Nenhuma ata encontrada' : 'Nenhuma ata corresponde aos filtros'}
          </h3>
          <p className="text-gray-600 mb-4">
            {atas.length === 0 
              ? 'Comece criando sua primeira ata de reunião.'
              : 'Tente ajustar os filtros de busca.'
            }
          </p>
          {atas.length === 0 && (
            <Link to="/nova-ata" className="btn-primary">
              Criar Nova Ata
            </Link>
          )}
        </div>
        )
      ) : (
        <div className="space-y-4">
          {atasFiltradas.map((ata) => (
            <div key={ata.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lds-blue text-white">
                        {TIPOS_REUNIAO[ata.tipo]}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{ata.ala}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(ata.data), 'dd/MM/yyyy', { locale: ptBR })} - {ata.horario}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{ata.estaca}</p>
                  <div className="text-sm text-gray-500">
                    {ata ? getAtaDescription(ata) : 'Dados não disponíveis'}
                  </div>
                  {ata && getAtaContent(ata) && (
                    <div className="mt-2 text-sm text-gray-500">
                      {getAtaContent(ata)}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/ata/${ata.id}`}
                    className="p-2 text-lds-blue hover:bg-lds-blue hover:text-white rounded-lg transition-colors"
                    title="Visualizar ata"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {temPermissao(usuario, 'editarAta') && (
                    <Link
                      to={`/editar-ata/${ata.id}`}
                      className="p-2 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                      title="Editar ata"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  )}
                  {temPermissao(usuario, 'excluirAta') && (
                  <button
                    onClick={() => handleExcluir(ata.id, ata.ala, ata.tipo)}
                    className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    title="Excluir ata"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        Total: {atasFiltradas.length} ata{atasFiltradas.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default ListaAtas;