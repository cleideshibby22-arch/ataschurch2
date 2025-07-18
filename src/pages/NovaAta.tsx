import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Users, FileText, Calendar, Clock, MapPin } from 'lucide-react';
import { useAta } from '../context/AtaContext';
import { FormData, TipoReuniao, TIPOS_REUNIAO, CARGOS_POR_TIPO } from '../types';
import { getUsuarioLogado } from '../utils/auth';
import SeletorHino from '../components/SeletorHino';

const NovaAta: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { adicionarAta, editarAta, obterAta } = useAta();
  const usuario = getUsuarioLogado();
  const isEdicao = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    tipo: 'sacramental',
    data: new Date().toISOString().split('T')[0],
    estaca: '',
    ala: '',
    horario: '',
    presidida_por: '',
    dirigida_por: '',
    oracao_inicial: '',
    oracao_final: '',
    recepcionista: '',
    frequencia: '',
    regente: '',
    pianista_organista: '',
    
    boas_vindas_reconhecimentos: '',
    anuncios: '',
    hino_abertura: '',
    primeira_oracao: '',
    
    ordenancas_desobrigacoes_apoios: '',
    
    hino_sacramental: '',
    
    primeiro_orador: '',
    segundo_orador: '',
    
    interludio_musical: '',
    ultimo_orador: '',
    ultimo_hino: '',
    ultima_oracao: '',
    
    apresentacao_final: '',
    agradecimentos_despedidas: '',
    
    desobrigacoes: [],
    confirmacoes: [],
    ordenacoes_sacerdocio: [],
    bencao_criancas: [],
    
    participantes: [],
    assuntos_discutidos: [],
    decisoes_tomadas: [],
    acoes_designadas: [],
    proxima_reuniao: '',
    observacoes: '',
    mensagem_pensamento: ''
  });

  const [erros, setErros] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (isEdicao && id) {
      const ata = obterAta(id);
      if (ata) {
        setFormData({
          tipo: ata.tipo,
          data: ata.data,
          estaca: ata.estaca,
          ala: ata.ala,
          horario: ata.horario,
          presidida_por: ata.presidida_por,
          dirigida_por: ata.dirigida_por,
          oracao_inicial: ata.oracao_inicial || '',
          oracao_final: ata.oracao_final || '',
          recepcionista: ata.recepcionista || '',
          frequencia: ata.frequencia || '',
          regente: ata.regente || '',
          pianista_organista: ata.pianista_organista || '',
          
          boas_vindas_reconhecimentos: ata.boas_vindas_reconhecimentos || '',
          anuncios: ata.anuncios || '',
          hino_abertura: ata.hino_abertura || '',
          primeira_oracao: ata.primeira_oracao || '',
          
          ordenancas_desobrigacoes_apoios: ata.ordenancas_desobrigacoes_apoios || '',
          
          hino_sacramental: ata.hino_sacramental || '',
          
          primeiro_orador: ata.primeiro_orador || '',
          segundo_orador: ata.segundo_orador || '',
          
          interludio_musical: ata.interludio_musical || '',
          ultimo_orador: ata.ultimo_orador || '',
          ultimo_hino: ata.ultimo_hino || '',
          ultima_oracao: ata.ultima_oracao || '',
          
          apresentacao_final: ata.apresentacao_final || '',
          agradecimentos_despedidas: ata.agradecimentos_despedidas || '',
          
          desobrigacoes: ata.desobrigacoes || [],
          confirmacoes: ata.confirmacoes || [],
          ordenacoes_sacerdocio: ata.ordenacoes_sacerdocio || [],
          bencao_criancas: ata.bencao_criancas || [],
          
          participantes: ata.participantes || [],
          assuntos_discutidos: ata.assuntos_discutidos || [],
          decisoes_tomadas: ata.decisoes_tomadas || [],
          acoes_designadas: ata.acoes_designadas || [],
          proxima_reuniao: ata.proxima_reuniao || '',
          observacoes: ata.observacoes || '',
          mensagem_pensamento: ata.mensagem_pensamento || ''
        });
      }
    }
  }, [isEdicao, id, obterAta]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const novosErros: {[key: string]: string} = {};

    if (!formData.tipo) novosErros.tipo = 'Tipo de reunião é obrigatório';
    if (!formData.data) novosErros.data = 'Data é obrigatória';
    if (!formData.estaca.trim()) novosErros.estaca = 'Estaca é obrigatória';
    if (!formData.ala.trim()) novosErros.ala = 'Ala é obrigatória';
    if (!formData.horario.trim()) novosErros.horario = 'Horário é obrigatório';
    if (!formData.presidida_por.trim()) novosErros.presidida_por = 'Presidida por é obrigatório';
    if (!formData.dirigida_por.trim()) novosErros.dirigida_por = 'Dirigida por é obrigatório';

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      const dadosAta = {
        ...formData,
        criado_por: usuario?.id || 'unknown'
      };

      if (isEdicao && id) {
        editarAta(id, dadosAta);
      } else {
        adicionarAta(dadosAta);
      }

      navigate('/atas');
    } catch (error) {
      console.error('Erro ao salvar ata:', error);
      alert('Erro ao salvar ata. Tente novamente.');
    }
  };

  const adicionarParticipante = () => {
    const novoParticipante = {
      id: Date.now().toString(),
      nome: '',
      cargo: '',
      presente: true
    };
    setFormData(prev => ({
      ...prev,
      participantes: [...prev.participantes, novoParticipante]
    }));
  };

  const removerParticipante = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.filter(p => p.id !== id)
    }));
  };

  const atualizarParticipante = (id: string, campo: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.map(p => 
        p.id === id ? { ...p, [campo]: valor } : p
      )
    }));
  };

  const adicionarAssunto = () => {
    const novoAssunto = {
      id: Date.now().toString(),
      titulo: '',
      descricao: '',
      responsavel: ''
    };
    setFormData(prev => ({
      ...prev,
      assuntos_discutidos: [...prev.assuntos_discutidos, novoAssunto]
    }));
  };

  const removerAssunto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assuntos_discutidos: prev.assuntos_discutidos.filter(a => a.id !== id)
    }));
  };

  const atualizarAssunto = (id: string, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      assuntos_discutidos: prev.assuntos_discutidos.map(a => 
        a.id === id ? { ...a, [campo]: valor } : a
      )
    }));
  };

  const adicionarDecisao = () => {
    const novaDecisao = {
      id: Date.now().toString(),
      decisao: '',
      justificativa: '',
      votacao: 'unanime' as const
    };
    setFormData(prev => ({
      ...prev,
      decisoes_tomadas: [...prev.decisoes_tomadas, novaDecisao]
    }));
  };

  const removerDecisao = (id: string) => {
    setFormData(prev => ({
      ...prev,
      decisoes_tomadas: prev.decisoes_tomadas.filter(d => d.id !== id)
    }));
  };

  const atualizarDecisao = (id: string, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      decisoes_tomadas: prev.decisoes_tomadas.map(d => 
        d.id === id ? { ...d, [campo]: valor } : d
      )
    }));
  };

  const adicionarAcao = () => {
    const novaAcao = {
      id: Date.now().toString(),
      acao: '',
      responsavel: '',
      prazo: '',
      status: 'pendente' as const
    };
    setFormData(prev => ({
      ...prev,
      acoes_designadas: [...prev.acoes_designadas, novaAcao]
    }));
  };

  const removerAcao = (id: string) => {
    setFormData(prev => ({
      ...prev,
      acoes_designadas: prev.acoes_designadas.filter(a => a.id !== id)
    }));
  };

  const atualizarAcao = (id: string, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      acoes_designadas: prev.acoes_designadas.map(a => 
        a.id === id ? { ...a, [campo]: valor } : a
      )
    }));
  };

  const adicionarDesobrigacao = () => {
    const novaDesobrigacao = {
      id: Date.now().toString(),
      nome: '',
      acao: 'A' as const,
      posicao: ''
    };
    setFormData(prev => ({
      ...prev,
      desobrigacoes: [...prev.desobrigacoes, novaDesobrigacao]
    }));
  };

  const removerDesobrigacao = (id: string) => {
    setFormData(prev => ({
      ...prev,
      desobrigacoes: prev.desobrigacoes.filter(d => d.id !== id)
    }));
  };

  const atualizarDesobrigacao = (id: string, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      desobrigacoes: prev.desobrigacoes.map(d => 
        d.id === id ? { ...d, [campo]: valor } : d
      )
    }));
  };

  const isSacramental = formData.tipo === 'sacramental';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/atas')}
          className="flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Lista</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdicao ? 'Editar Ata' : 'Nova Ata'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-lds-blue" />
            <span>Informações Básicas</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Reunião</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className={`input-field ${erros.tipo ? 'border-red-300' : ''}`}
                required
              >
                {Object.entries(TIPOS_REUNIAO).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              {erros.tipo && <p className="mt-1 text-sm text-red-600">{erros.tipo}</p>}
            </div>

            <div>
              <label className="label">Data</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className={`input-field ${erros.data ? 'border-red-300' : ''}`}
                required
              />
              {erros.data && <p className="mt-1 text-sm text-red-600">{erros.data}</p>}
            </div>

            <div>
              <label className="label">Estaca</label>
              <input
                type="text"
                name="estaca"
                value={formData.estaca}
                onChange={handleInputChange}
                className={`input-field ${erros.estaca ? 'border-red-300' : ''}`}
                placeholder="Nome da estaca"
                required
              />
              {erros.estaca && <p className="mt-1 text-sm text-red-600">{erros.estaca}</p>}
            </div>

            <div>
              <label className="label">Ala</label>
              <input
                type="text"
                name="ala"
                value={formData.ala}
                onChange={handleInputChange}
                className={`input-field ${erros.ala ? 'border-red-300' : ''}`}
                placeholder="Nome da ala"
                required
              />
              {erros.ala && <p className="mt-1 text-sm text-red-600">{erros.ala}</p>}
            </div>

            <div>
              <label className="label">Horário</label>
              <input
                type="time"
                name="horario"
                value={formData.horario}
                onChange={handleInputChange}
                className={`input-field ${erros.horario ? 'border-red-300' : ''}`}
                required
              />
              {erros.horario && <p className="mt-1 text-sm text-red-600">{erros.horario}</p>}
            </div>

            <div>
              <label className="label">Presidida por</label>
              <input
                type="text"
                name="presidida_por"
                value={formData.presidida_por}
                onChange={handleInputChange}
                className={`input-field ${erros.presidida_por ? 'border-red-300' : ''}`}
                placeholder="Nome de quem presidiu"
                required
              />
              {erros.presidida_por && <p className="mt-1 text-sm text-red-600">{erros.presidida_por}</p>}
            </div>

            <div>
              <label className="label">Dirigida por</label>
              <input
                type="text"
                name="dirigida_por"
                value={formData.dirigida_por}
                onChange={handleInputChange}
                className={`input-field ${erros.dirigida_por ? 'border-red-300' : ''}`}
                placeholder="Nome de quem dirigiu"
                required
              />
              {erros.dirigida_por && <p className="mt-1 text-sm text-red-600">{erros.dirigida_por}</p>}
            </div>

            {isSacramental && (
              <>
                <div>
                  <label className="label">Recepcionista</label>
                  <input
                    type="text"
                    name="recepcionista"
                    value={formData.recepcionista}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do recepcionista"
                  />
                </div>

                <div>
                  <label className="label">Frequência</label>
                  <input
                    type="text"
                    name="frequencia"
                    value={formData.frequencia}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ex: 150"
                  />
                </div>

                <div>
                  <label className="label">Regente</label>
                  <input
                    type="text"
                    name="regente"
                    value={formData.regente}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do regente"
                  />
                </div>

                <div>
                  <label className="label">Pianista/Organista</label>
                  <input
                    type="text"
                    name="pianista_organista"
                    value={formData.pianista_organista}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do pianista/organista"
                  />
                </div>
              </>
            )}

            {!isSacramental && (
              <>
                <div>
                  <label className="label">Oração Inicial</label>
                  <input
                    type="text"
                    name="oracao_inicial"
                    value={formData.oracao_inicial}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome de quem fez a oração inicial"
                  />
                </div>

                <div>
                  <label className="label">Oração Final</label>
                  <input
                    type="text"
                    name="oracao_final"
                    value={formData.oracao_final}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome de quem fez a oração final"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Programa da Reunião Sacramental */}
        {isSacramental && (
          <>
            {/* Abertura */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Abertura</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Boas Vindas / Reconhecimentos (1 min.)</label>
                  <input
                    type="text"
                    name="boas_vindas_reconhecimentos"
                    value={formData.boas_vindas_reconhecimentos}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome da pessoa"
                  />
                </div>

                <div>
                  <label className="label">Anúncios (3 min.)</label>
                  <input
                    type="text"
                    name="anuncios"
                    value={formData.anuncios}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome da pessoa"
                  />
                </div>

                <div>
                  <label className="label">Hino de Abertura (3 min.)</label>
                  <SeletorHino
                    value={formData.hino_abertura}
                    onChange={(value) => setFormData(prev => ({ ...prev, hino_abertura: value }))}
                    placeholder="Selecione o hino de abertura"
                  />
                </div>

                <div>
                  <label className="label">Primeira Oração (1 min.)</label>
                  <input
                    type="text"
                    name="primeira_oracao"
                    value={formData.primeira_oracao}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome da pessoa"
                  />
                </div>
              </div>
            </div>

            {/* Ordenanças/Desobrigações/Apoios */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ordenanças / Desobrigações / Apoios (3-5 min.)</h2>
              
              <div>
                <label className="label">Descrição</label>
                <textarea
                  name="ordenancas_desobrigacoes_apoios"
                  value={formData.ordenancas_desobrigacoes_apoios}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva as ordenanças, desobrigações e apoios..."
                />
              </div>

              {/* Lista de Desobrigações/Apoios */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Desobrigações / Apoios</h3>
                  <button
                    type="button"
                    onClick={adicionarDesobrigacao}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {formData.desobrigacoes.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="label">Nome</label>
                        <input
                          type="text"
                          value={item.nome}
                          onChange={(e) => atualizarDesobrigacao(item.id, 'nome', e.target.value)}
                          className="input-field"
                          placeholder="Nome da pessoa"
                        />
                      </div>
                      <div>
                        <label className="label">Ação</label>
                        <select
                          value={item.acao}
                          onChange={(e) => atualizarDesobrigacao(item.id, 'acao', e.target.value)}
                          className="input-field"
                        >
                          <option value="A">Apoio</option>
                          <option value="D">Desobrigação</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Posição</label>
                        <input
                          type="text"
                          value={item.posicao}
                          onChange={(e) => atualizarDesobrigacao(item.id, 'posicao', e.target.value)}
                          className="input-field"
                          placeholder="Cargo/Posição"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removerDesobrigacao(item.id)}
                          className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sacramento */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sacramento</h2>
              
              <div>
                <label className="label">Hino Sacramental (3 min.)</label>
                <SeletorHino
                  value={formData.hino_sacramental}
                  onChange={(value) => setFormData(prev => ({ ...prev, hino_sacramental: value }))}
                  placeholder="Selecione o hino sacramental"
                />
              </div>
            </div>

            {/* Oradores */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Oradores</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Primeiro Orador (5 min.)</label>
                  <input
                    type="text"
                    name="primeiro_orador"
                    value={formData.primeiro_orador}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do primeiro orador"
                  />
                </div>

                <div>
                  <label className="label">Segundo Orador (10 min.)</label>
                  <input
                    type="text"
                    name="segundo_orador"
                    value={formData.segundo_orador}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do segundo orador"
                  />
                </div>

                <div>
                  <label className="label">Interlúdio Musical (3 min.)</label>
                  <input
                    type="text"
                    name="interludio_musical"
                    value={formData.interludio_musical}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Descrição do interlúdio"
                  />
                </div>

                <div>
                  <label className="label">Último Orador (15-20 min.)</label>
                  <input
                    type="text"
                    name="ultimo_orador"
                    value={formData.ultimo_orador}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome do último orador"
                  />
                </div>
              </div>
            </div>

            {/* Encerramento */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Encerramento</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Último Hino (3 min.)</label>
                  <SeletorHino
                    value={formData.ultimo_hino}
                    onChange={(value) => setFormData(prev => ({ ...prev, ultimo_hino: value }))}
                    placeholder="Selecione o último hino"
                  />
                </div>

                <div>
                  <label className="label">Última Oração (1 min.)</label>
                  <input
                    type="text"
                    name="ultima_oracao"
                    value={formData.ultima_oracao}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome da pessoa"
                  />
                </div>

                <div>
                  <label className="label">Apresentação Final</label>
                  <input
                    type="text"
                    name="apresentacao_final"
                    value={formData.apresentacao_final}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Descrição da apresentação"
                  />
                </div>

                <div>
                  <label className="label">Agradecimentos e Despedidas</label>
                  <input
                    type="text"
                    name="agradecimentos_despedidas"
                    value={formData.agradecimentos_despedidas}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Nome da pessoa"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Participantes - apenas para reuniões que NÃO são sacramentais */}
        {!isSacramental && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-lds-blue" />
                <span>Participantes</span>
              </h2>
              <button
                type="button"
                onClick={adicionarParticipante}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Participante</span>
              </button>
            </div>

            {formData.participantes.map((participante) => (
              <div key={participante.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Nome</label>
                    <input
                      type="text"
                      value={participante.nome}
                      onChange={(e) => atualizarParticipante(participante.id, 'nome', e.target.value)}
                      className="input-field"
                      placeholder="Nome do participante"
                    />
                  </div>
                  <div>
                    <label className="label">Cargo</label>
                    <input
                      type="text"
                      value={participante.cargo}
                      onChange={(e) => atualizarParticipante(participante.id, 'cargo', e.target.value)}
                      className="input-field"
                      placeholder="Cargo do participante"
                    />
                  </div>
                  <div>
                    <label className="label">Presente</label>
                    <select
                      value={participante.presente ? 'true' : 'false'}
                      onChange={(e) => atualizarParticipante(participante.id, 'presente', e.target.value === 'true')}
                      className="input-field"
                    >
                      <option value="true">Presente</option>
                      <option value="false">Ausente</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removerParticipante(participante.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assuntos Discutidos - apenas para reuniões que NÃO são sacramentais */}
        {!isSacramental && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Assuntos Discutidos</h2>
              <button
                type="button"
                onClick={adicionarAssunto}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Assunto</span>
              </button>
            </div>

            {formData.assuntos_discutidos.map((assunto) => (
              <div key={assunto.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Título</label>
                      <input
                        type="text"
                        value={assunto.titulo}
                        onChange={(e) => atualizarAssunto(assunto.id, 'titulo', e.target.value)}
                        className="input-field"
                        placeholder="Título do assunto"
                      />
                    </div>
                    <div>
                      <label className="label">Responsável</label>
                      <input
                        type="text"
                        value={assunto.responsavel || ''}
                        onChange={(e) => atualizarAssunto(assunto.id, 'responsavel', e.target.value)}
                        className="input-field"
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Descrição</label>
                    <textarea
                      value={assunto.descricao}
                      onChange={(e) => atualizarAssunto(assunto.id, 'descricao', e.target.value)}
                      className="input-field"
                      rows={3}
                      placeholder="Descrição detalhada do assunto"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removerAssunto(assunto.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Decisões Tomadas - apenas para reuniões que NÃO são sacramentais */}
        {!isSacramental && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Decisões Tomadas</h2>
              <button
                type="button"
                onClick={adicionarDecisao}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Decisão</span>
              </button>
            </div>

            {formData.decisoes_tomadas.map((decisao) => (
              <div key={decisao.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="grid gap-4">
                  <div>
                    <label className="label">Decisão</label>
                    <input
                      type="text"
                      value={decisao.decisao}
                      onChange={(e) => atualizarDecisao(decisao.id, 'decisao', e.target.value)}
                      className="input-field"
                      placeholder="Descrição da decisão"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Justificativa</label>
                      <textarea
                        value={decisao.justificativa || ''}
                        onChange={(e) => atualizarDecisao(decisao.id, 'justificativa', e.target.value)}
                        className="input-field"
                        rows={2}
                        placeholder="Justificativa da decisão"
                      />
                    </div>
                    <div>
                      <label className="label">Votação</label>
                      <select
                        value={decisao.votacao || 'unanime'}
                        onChange={(e) => atualizarDecisao(decisao.id, 'votacao', e.target.value)}
                        className="input-field"
                      >
                        <option value="unanime">Unânime</option>
                        <option value="maioria">Maioria</option>
                        <option value="dividida">Dividida</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removerDecisao(decisao.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ações Designadas - apenas para reuniões que NÃO são sacramentais */}
        {!isSacramental && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ações Designadas</h2>
              <button
                type="button"
                onClick={adicionarAcao}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Ação</span>
              </button>
            </div>

            {formData.acoes_designadas.map((acao) => (
              <div key={acao.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Ação</label>
                    <input
                      type="text"
                      value={acao.acao}
                      onChange={(e) => atualizarAcao(acao.id, 'acao', e.target.value)}
                      className="input-field"
                      placeholder="Descrição da ação"
                    />
                  </div>
                  <div>
                    <label className="label">Responsável</label>
                    <input
                      type="text"
                      value={acao.responsavel}
                      onChange={(e) => atualizarAcao(acao.id, 'responsavel', e.target.value)}
                      className="input-field"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="label">Prazo</label>
                    <input
                      type="date"
                      value={acao.prazo || ''}
                      onChange={(e) => atualizarAcao(acao.id, 'prazo', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removerAcao(acao.id)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Próxima Reunião e Observações */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informações Finais</h2>
          
          <div className="grid gap-4">
            {!isSacramental && (
              <>
                <div>
                  <label className="label">Próxima Reunião</label>
                  <input
                    type="date"
                    name="proxima_reuniao"
                    value={formData.proxima_reuniao}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Mensagem/Pensamento</label>
                  <input
                    type="text"
                    name="mensagem_pensamento"
                    value={formData.mensagem_pensamento}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Responsável pela mensagem ou pensamento"
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">
                {isSacramental ? 'Testemunhos / Observações / Eventos Históricos' : 'Observações Gerais'}
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                className="input-field"
                rows={4}
                placeholder={isSacramental 
                  ? "Registre testemunhos especiais, observações importantes ou eventos históricos da reunião..."
                  : "Observações gerais sobre a reunião..."
                }
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/atas')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isEdicao ? 'Salvar Alterações' : 'Salvar Ata'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NovaAta;