import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Calendar, Users, FileText, MapPin, Clock, Book } from 'lucide-react';
import { useAta } from '../context/AtaContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TIPOS_REUNIAO } from '../types';
import { temPermissao } from '../utils/auth';

const VisualizarAta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obterAta, usuario } = useAta();

  const ata = id ? obterAta(id) : undefined;

  if (!ata) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ata não encontrada</h2>
        <p className="text-gray-600 mb-4">A ata solicitada não existe ou foi removida.</p>
        <Link to="/atas" className="btn-primary">
          Voltar para Lista de Atas
        </Link>
      </div>
    );
  }

  const handleImprimir = () => {
    window.print();
  };

  const isSacramental = ata.tipo === 'sacramental';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate('/atas')}
          className="flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Lista</span>
        </button>
        <div className="flex items-center space-x-3">
          {temPermissao(usuario, 'editarAta') && (
            <Link
              to={`/editar-ata/${ata.id}`}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Link>
          )}
          <button
            onClick={handleImprimir}
            className="btn-secondary flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="print-area bg-white print:shadow-none shadow-lg rounded-lg overflow-hidden">
        {/* Cabeçalho Moderno */}
        <div className="bg-gradient-to-r from-lds-blue to-lds-light-blue text-white p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {TIPOS_REUNIAO[ata.tipo]}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>{ata.ala}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{format(new Date(ata.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{ata.horario}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Informações da Reunião - Layout em Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-lds-blue">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-lds-blue" />
                <span>LIDERANÇA</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Presidida:</span>
                  <span className="text-gray-900">{ata.presidida_por}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Dirigida:</span>
                  <span className="text-gray-900">{ata.dirigida_por}</span>
                </div>
                {!isSacramental && ata.oracao_inicial && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Oração Inicial:</span>
                    <span className="text-gray-900">{ata.oracao_inicial}</span>
                  </div>
                )}
                {!isSacramental && ata.oracao_final && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Oração Final:</span>
                    <span className="text-gray-900">{ata.oracao_final}</span>
                  </div>
                )}
                {isSacramental && ata.recepcionista && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Recepcionista:</span>
                    <span className="text-gray-900">{ata.recepcionista}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isSacramental && (
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-lds-light-blue">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-lds-light-blue" />
                  <span>DETALHES</span>
                </h3>
                <div className="space-y-3 text-sm">
                  {ata.frequencia && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Frequência:</span>
                      <span className="text-gray-900 font-semibold">{ata.frequencia}</span>
                    </div>
                  )}
                  {ata.regente && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Regente:</span>
                      <span className="text-gray-900">{ata.regente}</span>
                    </div>
                  )}
                  {ata.pianista_organista && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Pianista/Organista:</span>
                      <span className="text-gray-900">{ata.pianista_organista}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Programa da Reunião Sacramental - Seguindo a ordem do modelo */}
          {isSacramental && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-lds-blue to-lds-light-blue text-white px-6 py-4">
                <h3 className="text-lg font-bold">PROGRAMA DA REUNIÃO</h3>
              </div>
              <div className="p-6">
                {/* Abertura */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">ABERTURA</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {ata.boas_vindas_reconhecimentos && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boas Vindas / Reconhecimentos (1 min.):</span>
                        <span className="text-gray-900">{ata.boas_vindas_reconhecimentos}</span>
                      </div>
                    )}
                    {ata.anuncios && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Anúncios (3 min.):</span>
                        <span className="text-gray-900">{ata.anuncios}</span>
                      </div>
                    )}
                    {ata.hino_abertura && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hino de Abertura (3 min.):</span>
                        <span className="text-gray-900">{ata.hino_abertura}</span>
                      </div>
                    )}
                    {ata.primeira_oracao && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Primeira Oração (1 min.):</span>
                        <span className="text-gray-900">{ata.primeira_oracao}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordenanças/Desobrigações/Apoios */}
                {ata.ordenancas_desobrigacoes_apoios && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">ORDENANÇAS / DESOBRIGAÇÕES / APOIOS (3-5 min.)</h4>
                    <div className="bg-blue-50 p-4 rounded border text-gray-700 text-sm">
                      <p className="whitespace-pre-wrap">{ata.ordenancas_desobrigacoes_apoios}</p>
                    </div>
                  </div>
                )}

                {/* Sacramento */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">SACRAMENTO</h4>
                  
                  {/* Citação sobre o Sacramento */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-center font-medium">
                      "O Sacramento foi preparado e será abençoado e distribuído por portadores do Sacerdócio."
                    </p>
                    <div className="text-center mt-3">
                      <Link
                        to="/oracoes-sacramentais"
                        className="inline-flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors text-sm font-medium"
                      >
                        <Book className="h-4 w-4" />
                        <span>Ver Orações Sacramentais</span>
                      </Link>
                    </div>
                  </div>
                  
                  {ata.hino_sacramental && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hino Sacramental (3 min.):</span>
                      <span className="text-gray-900">{ata.hino_sacramental}</span>
                    </div>
                  )}
                </div>

                {/* Oradores */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">ORADORES</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {ata.primeiro_orador && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Primeiro Orador (5 min.):</span>
                        <span className="text-gray-900">{ata.primeiro_orador}</span>
                      </div>
                    )}
                    {ata.segundo_orador && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Segundo Orador (10 min.):</span>
                        <span className="text-gray-900">{ata.segundo_orador}</span>
                      </div>
                    )}
                    {ata.interludio_musical && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Interlúdio Musical (3 min.):</span>
                        <span className="text-gray-900">{ata.interludio_musical}</span>
                      </div>
                    )}
                    {ata.ultimo_orador && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último Orador (15-20 min.):</span>
                        <span className="text-gray-900">{ata.ultimo_orador}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Encerramento */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">ENCERRAMENTO</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {ata.ultimo_hino && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último Hino (3 min.):</span>
                        <span className="text-gray-900">{ata.ultimo_hino}</span>
                      </div>
                    )}
                    {ata.ultima_oracao && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última Oração (1 min.):</span>
                        <span className="text-gray-900">{ata.ultima_oracao}</span>
                      </div>
                    )}
                    {ata.apresentacao_final && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Apresentação Final:</span>
                        <span className="text-gray-900">{ata.apresentacao_final}</span>
                      </div>
                    )}
                    {ata.agradecimentos_despedidas && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agradecimentos e Despedidas:</span>
                        <span className="text-gray-900">{ata.agradecimentos_despedidas}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participantes - apenas para reuniões que NÃO são sacramentais */}
          {!isSacramental && ata.participantes && ata.participantes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-lds-blue" />
                  <span>PARTICIPANTES</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Presente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ata.participantes.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.cargo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.presente 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.presente ? 'Presente' : 'Ausente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assuntos Discutidos - apenas para reuniões que NÃO são sacramentais */}
          {!isSacramental && ata.assuntos_discutidos && ata.assuntos_discutidos.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-lds-blue" />
                  <span>ASSUNTOS DISCUTIDOS</span>
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {ata.assuntos_discutidos.map((item, index) => (
                  <div key={item.id} className="border-l-4 border-lds-light-blue pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{index + 1}. {item.titulo}</h4>
                      {item.responsavel && (
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {item.responsavel}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decisões Tomadas - apenas para reuniões que NÃO são sacramentais */}
          {!isSacramental && ata.decisoes_tomadas && ata.decisoes_tomadas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">DECISÕES TOMADAS</h3>
              </div>
              <div className="p-6 space-y-6">
                {ata.decisoes_tomadas.map((item, index) => (
                  <div key={item.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{index + 1}. {item.decisao}</h4>
                    {item.justificativa && (
                      <p className="text-gray-700 mb-2">
                        <strong>Justificativa:</strong> {item.justificativa}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Votação:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.votacao === 'unanime' ? 'bg-green-100 text-green-800' :
                        item.votacao === 'maioria' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.votacao === 'unanime' ? 'Unânime' : 
                         item.votacao === 'maioria' ? 'Maioria' : 'Dividida'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações Designadas - apenas para reuniões que NÃO são sacramentais */}
          {!isSacramental && ata.acoes_designadas && ata.acoes_designadas.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-lds-blue" />
                  <span>AÇÕES DESIGNADAS</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ata.acoes_designadas.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.acao}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.responsavel}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.prazo ? format(new Date(item.prazo), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensagem/Pensamento - apenas para reuniões que NÃO são sacramentais */}
          {!isSacramental && ata.mensagem_pensamento && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">MENSAGEM / PENSAMENTO</h3>
              <p className="text-gray-700">
                <strong>Responsável:</strong> {ata.mensagem_pensamento}
              </p>
            </div>
          )}

          {/* Seções específicas para reunião sacramental */}
          {isSacramental && (
            <>
              {/* Desobrigações */}
              {ata.desobrigacoes && ata.desobrigacoes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">DESOBRIGAÇÕES / APOIOS</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ata.desobrigacoes.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.acao === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.acao === 'A' ? 'Apoio' : 'Desobrigação'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.posicao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confirmações */}
              {ata.confirmacoes && ata.confirmacoes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">CONFIRMAÇÕES</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmado(a) por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ata.confirmacoes.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.confirmado_por}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Ordenações ao Sacerdócio */}
              {ata.ordenacoes_sacerdocio && ata.ordenacoes_sacerdocio.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">ORDENAÇÕES AO SACERDÓCIO</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sacerdócio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ofício</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordenado por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ata.ordenacoes_sacerdocio.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.sacerdocio}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.oficio}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.ordenado_por}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bênção de Crianças */}
              {ata.bencao_criancas && ata.bencao_criancas.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">BÊNÇÃO DE CRIANÇAS</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dt Nasc.</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abençoado(a) por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ata.bencao_criancas.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.data_nascimento ? format(new Date(item.data_nascimento), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.abencoado_por}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Próxima Reunião */}
          {ata.proxima_reuniao && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>PRÓXIMA REUNIÃO</span>
              </h3>
              <p className="text-gray-700">
                <strong>Data:</strong> {format(new Date(ata.proxima_reuniao), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Observações */}
          {ata.observacoes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isSacramental ? 'TESTEMUNHOS / OBSERVAÇÕES / EVENTOS HISTÓRICOS' : 'OBSERVAÇÕES GERAIS'}
              </h3>
              <div className="bg-white p-4 rounded border text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{ata.observacoes}</p>
              </div>
            </div>
          )}

          {/* Observação sobre Reunião Familiar - apenas para sacramental */}
          {isSacramental && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-center font-medium">
                <strong>Lembrete:</strong> Realizar a Reunião Familiar Semanal & Ensino Familiar
              </p>
            </div>
          )}

          {/* Rodapé */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
            <p>Ata registrada em {format(new Date(ata.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarAta;