import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Usuario } from '../types';
import { enviarCodigoRecuperacao, verificarCodigoRecuperacao, alterarSenhaComCodigo } from '../utils/auth';

const EsqueciSenha: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'codigo' | 'nova-senha' | 'sucesso'>('email');
  const [formData, setFormData] = useState({
    email: '',
    codigo: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [erros, setErros] = useState<{[key: string]: string}>({});
  const [carregando, setCarregando] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarEmail = () => {
    const novosErros: {[key: string]: string} = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const validarCodigo = () => {
    const novosErros: {[key: string]: string} = {};
    
    if (!formData.codigo.trim()) {
      novosErros.codigo = 'Código é obrigatório';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const validarNovaSenha = () => {
    const novosErros: {[key: string]: string} = {};
    
    if (!formData.novaSenha) {
      novosErros.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      novosErros.novaSenha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      novosErros.confirmarSenha = 'Senhas não coincidem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleEnviarCodigoRecuperacao = async () => {
    if (!validarEmail()) return;

    setCarregando(true);

    try {
      const resultado = await enviarCodigoRecuperacao(formData.email);
      
      if (!resultado.sucesso) {
        setErros({ email: resultado.erro || 'Erro ao enviar código' });
        return;
      }
      
      // Para demonstração, mostrar o código (em produção seria enviado por email)
      if (resultado.codigo) {
        alert(`Código de recuperação (simulação): ${resultado.codigo}`);
      }

      setStep('codigo');
    } catch (error) {
      console.error('Erro ao enviar código:', error);
      setErros({ geral: 'Erro ao enviar código. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!validarCodigo()) return;

    setCarregando(true);

    try {
      const verificacao = verificarCodigoRecuperacao(formData.email, formData.codigo);
      
      if (!verificacao.valido) {
        setErros({ codigo: verificacao.erro || 'Código inválido' });
        return;
      }
      
      setStep('nova-senha');
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      setErros({ geral: 'Erro ao verificar código. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!validarNovaSenha()) return;

    setCarregando(true);

    try {
      const resultado = alterarSenhaComCodigo(formData.email, formData.codigo, formData.novaSenha);
      
      if (!resultado.sucesso) {
        setErros({ geral: resultado.erro || 'Erro ao alterar senha' });
        return;
      }

      setStep('sucesso');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErros({ geral: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setCarregando(true);
    
    try {
      const resultado = await enviarCodigoRecuperacao(formData.email);
      
      if (!resultado.sucesso) {
        setErros({ geral: resultado.erro || 'Erro ao reenviar código' });
        return;
      }
      
      // Para demonstração, mostrar o novo código
      if (resultado.codigo) {
        alert(`Novo código de recuperação (simulação): ${resultado.codigo}`);
      }
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
    } finally {
      setCarregando(false);
    }
  };

  const renderStepEmail = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recuperar Senha
        </h2>
        <p className="text-gray-600">
          Digite seu email para receber o código de recuperação
        </p>
      </div>

      {erros.geral && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {erros.geral}
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`input-field pl-10 ${erros.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            placeholder="seu@email.com"
            required
          />
        </div>
        {erros.email && (
          <p className="mt-1 text-sm text-red-600">{erros.email}</p>
        )}
      </div>

      <button
        onClick={handleEnviarCodigoRecuperacao}
        disabled={carregando}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Enviando código...</span>
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            <span>Enviar Código</span>
          </>
        )}
      </button>
    </div>
  );

  const renderStepCodigo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Código Enviado
        </h2>
        <p className="text-gray-600">
          Enviamos um código de 6 dígitos para <strong>{formData.email}</strong>
        </p>
      </div>

      {erros.geral && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {erros.geral}
        </div>
      )}

      <div>
        <label htmlFor="codigo" className="label">
          Código de Verificação
        </label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          value={formData.codigo}
          onChange={handleInputChange}
          className={`input-field text-center text-lg tracking-widest ${erros.codigo ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="000000"
          maxLength={6}
          required
        />
        {erros.codigo && (
          <p className="mt-1 text-sm text-red-600">{erros.codigo}</p>
        )}
      </div>

      <button
        onClick={handleVerificarCodigo}
        disabled={carregando}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Verificando...</span>
          </>
        ) : (
          <span>Verificar Código</span>
        )}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Não recebeu o código?{' '}
          <button
            onClick={handleReenviarCodigo}
            disabled={carregando}
            className="font-medium text-lds-blue hover:text-lds-light-blue transition-colors disabled:opacity-50"
          >
            Reenviar
          </button>
        </p>
      </div>
    </div>
  );

  const renderStepNovaSenha = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nova Senha
        </h2>
        <p className="text-gray-600">
          Digite sua nova senha
        </p>
      </div>

      {erros.geral && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {erros.geral}
        </div>
      )}

      <div>
        <label htmlFor="novaSenha" className="label">
          Nova Senha
        </label>
        <input
          id="novaSenha"
          name="novaSenha"
          type="password"
          value={formData.novaSenha}
          onChange={handleInputChange}
          className={`input-field ${erros.novaSenha ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Mínimo 6 caracteres"
          required
        />
        {erros.novaSenha && (
          <p className="mt-1 text-sm text-red-600">{erros.novaSenha}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmarSenha" className="label">
          Confirmar Nova Senha
        </label>
        <input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          value={formData.confirmarSenha}
          onChange={handleInputChange}
          className={`input-field ${erros.confirmarSenha ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Digite a senha novamente"
          required
        />
        {erros.confirmarSenha && (
          <p className="mt-1 text-sm text-red-600">{erros.confirmarSenha}</p>
        )}
      </div>

      <button
        onClick={handleAlterarSenha}
        disabled={carregando}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Alterando senha...</span>
          </>
        ) : (
          <span>Alterar Senha</span>
        )}
      </button>
    </div>
  );

  const renderStepSucesso = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Senha Alterada com Sucesso!
        </h2>
        <p className="text-gray-600">
          Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
        </p>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="w-full btn-primary"
      >
        Ir para Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-lds-blue to-lds-light-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step !== 'sucesso' && (
            <div className="mb-6">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-lds-blue hover:text-lds-light-blue transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para Login</span>
              </button>
            </div>
          )}

          {step === 'email' && renderStepEmail()}
          {step === 'codigo' && renderStepCodigo()}
          {step === 'nova-senha' && renderStepNovaSenha()}
          {step === 'sucesso' && renderStepSucesso()}
        </div>

        {/* Informações de Segurança */}
        {step !== 'sucesso' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-200 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium mb-2">Dicas de Segurança</h3>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>• O código de verificação expira em 15 minutos</li>
                  <li>• Use uma senha forte com pelo menos 6 caracteres</li>
                  <li>• Não compartilhe seu código com ninguém</li>
                  <li>• Verifique se está acessando o site oficial</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EsqueciSenha;