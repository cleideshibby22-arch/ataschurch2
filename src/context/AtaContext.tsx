import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ata } from '../types';
import { AtaService } from '../services/ataService';
import { getUsuarioLogado } from '../utils/auth';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

interface AtaContextType {
  atas: Ata[];
  carregando: boolean;
  adicionarAta: (ata: Omit<Ata, 'id' | 'created_at' | 'unidade_id' | 'criado_por'>) => void;
  editarAta: (id: string, ata: Omit<Ata, 'id' | 'created_at' | 'unidade_id' | 'criado_por'>) => void;
  obterAta: (id: string) => Ata | undefined;
  excluirAta: (id: string) => void;
  limparTodasAtas: () => void;
  recarregarAtas: () => Promise<void>;
}

const AtaContext = createContext<AtaContextType | undefined>(undefined);

export const useAta = function() {
  const context = useContext(AtaContext);
  if (!context) {
    throw new Error('useAta deve ser usado dentro de um AtaProvider');
  }
  return context;
};

export const AtaProvider = function({ children }: { children: React.ReactNode }) {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Verificar sessão do Supabase ao inicializar
    if (isSupabaseAvailable && supabase) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAtas([]);
          localStorage.removeItem('usuario-logado');
          sessionStorage.removeItem('usuario-logado');
        } else if (event === 'SIGNED_IN' && session) {
          // Recarregar atas quando usuário fizer login
          await carregarAtas();
        }
      });
    }
    
    carregarAtas();
  }, []);

  const carregarAtas = async () => {
    try {
      setCarregando(true);
      const usuario = getUsuarioLogado();
      
      if (!usuario?.unidadeId) {
        setAtas([]);
        return;
      }

      const atasCarregadas = await AtaService.buscarAtas(usuario.unidadeId);
      setAtas(atasCarregadas);
    } catch (error) {
      console.error('Erro ao carregar atas:', error);
      setAtas([]);
    } finally {
      setCarregando(false);
    }
  };

  const adicionarAta = async (novaAta: Omit<Ata, 'id' | 'created_at' | 'unidade_id' | 'criado_por'>) => {
    try {
      const usuario = getUsuarioLogado();
      
      if (!usuario?.unidadeId || !usuario?.id) {
        throw new Error('Usuário não autenticado');
      }

      const ataCompleta = {
        ...novaAta,
        unidade_id: usuario.unidadeId,
        criado_por: usuario.id,
        created_at: new Date().toISOString()
      };
      
      await AtaService.cadastrarAta(ataCompleta);
      await carregarAtas(); // Recarregar atas após criar
    } catch (error) {
      console.error('Erro ao adicionar ata:', error);
      throw error;
    }
  };

  const editarAta = async (id: string, ataAtualizada: Omit<Ata, 'id' | 'created_at' | 'unidade_id' | 'criado_por'>) => {
    try {
      const usuario = getUsuarioLogado();
      
      if (!usuario?.unidadeId) {
        throw new Error('Usuário não autenticado');
      }

      const ataComUnidade = {
        ...ataAtualizada,
        unidade_id: usuario.unidadeId,
        criado_por: usuario.id
      };
      
      await AtaService.atualizarAta(id, ataComUnidade);
      await carregarAtas(); // Recarregar atas após editar
    } catch (error) {
      console.error('Erro ao editar ata:', error);
      throw error;
    }
  };

  const obterAta = (id: string) => {
    return atas.find(ata => ata.id === id);
  };

  const excluirAta = async (id: string) => {
    try {
      await AtaService.removerAta(id);
      await carregarAtas(); // Recarregar atas após excluir
    } catch (error) {
      console.error('Erro ao excluir ata:', error);
      throw error;
    }
  };

  const limparTodasAtas = () => {
    // Esta função agora só limpa o estado local
    // Em um sistema real, seria necessário implementar uma função no backend
    setAtas([]);
  };

  const recarregarAtas = async () => {
    await carregarAtas();
  };

  return (
    <AtaContext.Provider value={{ 
      atas, 
      carregando, 
      adicionarAta, 
      editarAta, 
      obterAta, 
      excluirAta, 
      limparTodasAtas, 
      recarregarAtas 
    }}>
      {children}
    </AtaContext.Provider>
  );
};