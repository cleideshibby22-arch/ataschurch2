import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Printer } from 'lucide-react';

const OracoesSacramentais: React.FC = () => {
  const navigate = useNavigate();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>
        <button
          onClick={handleImprimir}
          className="btn-secondary flex items-center space-x-2"
        >
          <Printer className="h-4 w-4" />
          <span>Imprimir</span>
        </button>
      </div>

      <div className="print-area bg-white print:shadow-none shadow-lg rounded-lg overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-lds-blue to-lds-light-blue text-white p-8">
          <div className="text-center">
            <Book className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Orações Sacramentais
            </h1>
            <p className="text-lg text-blue-100">
              A Igreja de Jesus Cristo dos Santos dos Últimos Dias
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Introdução */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800 text-center font-medium leading-relaxed">
              "O Sacramento foi preparado e será abençoado e distribuído por portadores do Sacerdócio."
            </p>
          </div>

          {/* Bênção do Pão */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-lds-blue to-lds-light-blue text-white px-6 py-4">
              <h2 className="text-xl font-bold">BÊNÇÃO DO PÃO</h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-lds-blue">
                <p className="text-gray-800 leading-relaxed text-lg">
                  Ó Deus, Pai Eterno, nós te rogamos em nome de teu Filho, Jesus Cristo, 
                  que abençoes e santifiques este pão para as almas de todos os que 
                  partilharem dele, para que o comam em lembrança do corpo de teu Filho 
                  e testifiquem a ti, ó Deus, Pai Eterno, que desejam tomar sobre si o 
                  nome de teu Filho e recordá-lo sempre e guardar os mandamentos que ele 
                  lhes deu, para que possam ter sempre consigo o seu Espírito. Amém.
                </p>
              </div>
              
              {/* Referência */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 italic">
                  Morôni 4:3; Doutrina e Convênios 20:77
                </p>
              </div>
            </div>
          </div>

          {/* Bênção da Água */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-lds-blue to-lds-light-blue text-white px-6 py-4">
              <h2 className="text-xl font-bold">BÊNÇÃO DA ÁGUA</h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-lds-light-blue">
                <p className="text-gray-800 leading-relaxed text-lg">
                  Ó Deus, Pai Eterno, nós te rogamos em nome de teu Filho, Jesus Cristo, 
                  que abençoes e santifiques esta água, para as almas de todos os que 
                  beberem dela, para que o façam em lembrança do sangue de teu Filho, 
                  que por eles foi derramado, e testifiquem a ti, ó Deus, Pai Eterno, 
                  que sempre se lembram dele, para que possam ter consigo o seu Espírito. 
                  Amém.
                </p>
              </div>
              
              {/* Referência */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 italic">
                  Morôni 5:2; Doutrina e Convênios 20:79
                </p>
              </div>
            </div>
          </div>

          {/* Instruções Adicionais */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">INSTRUÇÕES IMPORTANTES</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>As orações sacramentais devem ser proferidas exatamente como estão escritas.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Se houver erro na oração, ela deve ser repetida corretamente.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Apenas portadores do Sacerdócio de Melquisedeque ou sacerdotes do Sacerdócio Aarônico podem abençoar o sacramento.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>O sacramento deve ser preparado com reverência e distribuído de forma ordeira.</p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
            <p>A Igreja de Jesus Cristo dos Santos dos Últimos Dias</p>
            <p className="mt-1">Manual Geral: Servir na Igreja de Jesus Cristo dos Santos dos Últimos Dias</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OracoesSacramentais;