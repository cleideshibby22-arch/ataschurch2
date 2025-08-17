import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, List, FileText, Calendar, Users, Building } from 'lucide-react';
import { useAta } from '../context/AtaContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TIPOS_REUNIAO } from '../types';

const Home: React.FC = () => {
  const { atas } = useAta();
  const atasRecentes = atas.slice(0, 5);

  const estatisticasPorTipo = Object.keys(TIPOS_REUNIAO).reduce((acc, tipo) => {
    acc[tipo] = atas.filter(ata => ata.tipo === tipo).length;
    return acc;
  }, {} as Record<string, number>);

  const atasEsteMes = atas.filter(ata => {
    const dataAta = new Date(ata.data);
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return dataAta >= inicioMes;
  }).length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Atas das Reuniões da Igreja
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gerencie e organize as atas das reuniões da sua ala de forma simples e eficiente.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/nova-ata"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-lds-blue p-3 rounded-lg group-hover:bg-lds-light-blue transition-colors">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nova Ata</h3>
              <p className="text-gray-600">Criar uma nova ata de reunião</p>
            </div>
          </div>
        </Link>

        <Link
          to="/atas"
          className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-lds-blue p-3 rounded-lg group-hover:bg-lds-light-blue transition-colors">
              <List className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ver Atas</h3>
              <p className="text-gray-600">Visualizar todas as atas registradas</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-5 w-5 text-lds-blue" />
          <h2 className="text-xl font-semibold text-gray-900">Estatísticas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-lds-blue">{atas.length}</div>
            <div className="text-sm text-gray-600">Total de Atas</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-lds-blue">{atasEsteMes}</div>
            <div className="text-sm text-gray-600">Este Mês</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-lds-blue">
              {estatisticasPorTipo['sacramental'] || 0}
            </div>
            <div className="text-sm text-gray-600">Sacramentais</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-lds-blue">
              {atas.length > 0 ? format(new Date(atas[0].created_at), 'dd/MM', { locale: ptBR }) : '--'}
            </div>
            <div className="text-sm text-gray-600">Última Ata</div>
          </div>
        </div>
      </div>

      {/* Estatísticas por Tipo de Reunião */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Building className="h-5 w-5 text-lds-blue" />
          <h2 className="text-xl font-semibold text-gray-900">Atas por Tipo de Reunião</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TIPOS_REUNIAO).map(([tipo, nome]) => (
            <div key={tipo} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-lds-blue">
                {estatisticasPorTipo[tipo] || 0}
              </div>
              <div className="text-sm text-gray-600">{nome}</div>
            </div>
          ))}
        </div>
      </div>

      {atasRecentes.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-lds-blue" />
              <h2 className="text-xl font-semibold text-gray-900">Atas Recentes</h2>
            </div>
            <Link to="/atas" className="text-lds-blue hover:text-lds-light-blue text-sm font-medium">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {atasRecentes.map((ata) => (
              <Link
                key={ata.id}
                to={`/ata/${ata.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lds-blue text-white">
                        {TIPOS_REUNIAO[ata.tipo]}
                      </span>
                      <h3 className="font-medium text-gray-900">{ata.ala}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{ata.estaca}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(ata.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;