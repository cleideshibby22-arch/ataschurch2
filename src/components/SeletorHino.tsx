import React, { useState } from 'react';
import { Search, Music, Plus, Trash2, Edit } from 'lucide-react';
import { HINOS, CATEGORIAS_HINOS, FONTES_HINOS, getHinosPorCategoria, getHinosPorFonte, buscarHinos, adicionarHino, removerHino, Hino } from '../data/hinos';

interface SeletorHinoProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const SeletorHino: React.FC<SeletorHinoProps> = ({
  value,
  onChange,
  placeholder = "Selecione um hino",
  className = "",
  required = false
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [fonteFiltro, setFonteFiltro] = useState("Todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoHino, setNovoHino] = useState({
    numero: '',
    titulo: '',
    categoria: 'Personalizado'
  });
  
  // Aplicar filtros
  let hinosFiltrados = HINOS;
  
  if (termoBusca) {
    hinosFiltrados = buscarHinos(termoBusca);
  } else {
    if (categoriaFiltro !== "Todos") {
      hinosFiltrados = getHinosPorCategoria(categoriaFiltro);
    }
    if (fonteFiltro !== "Todos") {
      hinosFiltrados = getHinosPorFonte(fonteFiltro);
    }
    if (categoriaFiltro !== "Todos" && fonteFiltro !== "Todos") {
      hinosFiltrados = HINOS.filter(hino => 
        hino.categoria === categoriaFiltro && 
        (fonteFiltro === "Igreja" && hino.fonte === "igreja" ||
         fonteFiltro === "Lar" && hino.fonte === "lar" ||
         fonteFiltro === "Personalizado" && hino.fonte === "personalizado")
      );
    }
  }

  const hinoSelecionado = HINOS.find(hino => 
    (value && (value === `${hino.numero} - ${hino.titulo}` || 
    value === hino.titulo ||
    value === hino.numero.toString()))
  );

  const selecionarHino = (hino: Hino) => {
    onChange(`${hino.numero} - ${hino.titulo}`);
    setMostrarModal(false);
    setTermoBusca("");
    setCategoriaFiltro("Todos");
    setFonteFiltro("Todos");
  };

  const limparSelecao = () => {
    onChange("");
    setMostrarModal(false);
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);
    setNovoHino({
      numero: '',
      titulo: '',
      categoria: 'Personalizado'
    });
  };

  const fecharFormulario = () => {
    setMostrarFormulario(false);
    setNovoHino({
      numero: '',
      titulo: '',
      categoria: 'Personalizado'
    });
  };

  const salvarNovoHino = () => {
    if (!novoHino.numero || !novoHino.titulo) {
      alert('Por favor, preencha o número e o título do hino.');
      return;
    }

    const numero = parseInt(novoHino.numero);
    if (isNaN(numero)) {
      alert('O número do hino deve ser um número válido.');
      return;
    }

    // Verificar se o número já existe
    if (HINOS.find(h => h.numero === numero)) {
      alert('Já existe um hino com este número.');
      return;
    }

    adicionarHino({
      numero,
      titulo: novoHino.titulo,
      categoria: novoHino.categoria
    });

    fecharFormulario();
    // Atualizar a lista
    window.location.reload();
  };

  const excluirHino = (hino: Hino) => {
    if (hino.fonte !== 'personalizado') {
      alert('Só é possível excluir hinos personalizados.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o hino "${hino.titulo}"?`)) {
      removerHino(hino.numero);
      window.location.reload();
    }
  };

  const getFonteBadgeColor = (fonte: string) => {
    switch (fonte) {
      case 'igreja': return 'bg-blue-100 text-blue-800';
      case 'lar': return 'bg-green-100 text-green-800';
      case 'personalizado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFonteLabel = (fonte: string) => {
    switch (fonte) {
      case 'igreja': return 'Igreja';
      case 'lar': return 'Lar';
      case 'personalizado': return 'Personalizado';
      default: return fonte;
    }
  };

  return (
    <>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`input-field pr-10 ${className}`}
          placeholder={placeholder}
          required={required}
          readOnly
        />
        <button
          type="button"
          onClick={() => setMostrarModal(true)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <Music className="h-5 w-5" />
        </button>
      </div>

      {/* Modal de Seleção */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Music className="h-6 w-6 text-lds-blue" />
                  <span>Selecionar Hino</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={abrirFormulario}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Hino</span>
                  </button>
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por número ou título
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ex: 31, Jesus, Sacramento..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="input-field"
                  >
                    {CATEGORIAS_HINOS.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte
                  </label>
                  <select
                    value={fonteFiltro}
                    onChange={(e) => setFonteFiltro(e.target.value)}
                    className="input-field"
                  >
                    {FONTES_HINOS.map(fonte => (
                      <option key={fonte} value={fonte}>{fonte}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Hinos */}
            <div className="p-6 overflow-y-auto max-h-96">
              {hinoSelecionado && (
                <div className="mb-4 p-3 bg-lds-blue text-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Selecionado: </span>
                      <span>{hinoSelecionado.numero} - {hinoSelecionado.titulo}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-gray-800`}>
                        {getFonteLabel(hinoSelecionado.fonte)}
                      </span>
                    </div>
                    <button
                      onClick={limparSelecao}
                      className="text-white hover:text-gray-200 text-sm underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                {hinosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum hino encontrado</p>
                  </div>
                ) : (
                  hinosFiltrados.map((hino) => (
                    <div
                      key={hino.numero}
                      className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                        hinoSelecionado?.numero === hino.numero
                          ? 'border-lds-blue bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => selecionarHino(hino)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">
                                {hino.numero} - {hino.titulo}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {hino.categoria}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getFonteBadgeColor(hino.fonte)}`}>
                                {getFonteLabel(hino.fonte)}
                              </span>
                            </div>
                          </div>
                        </button>
                        {hino.fonte === 'personalizado' && (
                          <button
                            onClick={() => excluirHino(hino)}
                            className="ml-2 p-1 text-red-600 hover:text-red-800"
                            title="Excluir hino personalizado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {hinosFiltrados.length} hino{hinosFiltrados.length !== 1 ? 's' : ''} encontrado{hinosFiltrados.length !== 1 ? 's' : ''}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  {hinoSelecionado && (
                    <button
                      onClick={() => setMostrarModal(false)}
                      className="btn-primary"
                    >
                      Confirmar Seleção
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Hino */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Adicionar Novo Hino</h3>
                <button
                  onClick={fecharFormulario}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="number"
                    value={novoHino.numero}
                    onChange={(e) => setNovoHino(prev => ({ ...prev, numero: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: 999"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={novoHino.titulo}
                    onChange={(e) => setNovoHino(prev => ({ ...prev, titulo: e.target.value }))}
                    className="input-field"
                    placeholder="Nome do hino"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={novoHino.categoria}
                    onChange={(e) => setNovoHino(prev => ({ ...prev, categoria: e.target.value }))}
                    className="input-field"
                  >
                    {CATEGORIAS_HINOS.filter(cat => cat !== "Todos").map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={fecharFormulario}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarNovoHino}
                  className="btn-primary"
                >
                  Salvar Hino
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeletorHino;