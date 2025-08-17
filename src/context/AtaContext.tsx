import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ata } from '../types';
import { AtaService } from '../services/ataService';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { Usuario } from '../types';

interface AtaContextType {
  atas: Ata[];
  carregando: boolean;
  usuario: Usuario | null;
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
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    inicializarAuth();
  }, []);

  const inicializarAuth = async () => {
    if (isSupabaseAvailable && supabase) {
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await carregarUsuarioLogado(session.user.id);
      } else {
        // Fallback para localStorage se não houver sessão
        const usuarioLocal = localStorage.getItem('usuario-logado');
        if (usuarioLocal) {
          setUsuario(JSON.parse(usuarioLocal));
        }
      }
      
      // Escutar mudanças de autenticação
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUsuario(null);
          setAtas([]);
          localStorage.removeItem('usuario-logado');
        } else if (event === 'SIGNED_IN' && session?.user) {
          await carregarUsuarioLogado(session.user.id);
        }
      });
    } else {
      // Fallback para localStorage
      const usuarioLocal = localStorage.getItem('usuario-logado');
      if (usuarioLocal) {
        setUsuario(JSON.parse(usuarioLocal));
      }
    }
    
    await carregarAtas();
  };

  const carregarUsuarioLogado = async (userId: string) => {
    try {
      if (!isSupabaseAvailable || !supabase) return;

      // Buscar dados do usuário
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError || !usuarioData) {
        console.error('Erro ao buscar dados do usuário:', usuarioError);
        return;
      }

      // Buscar unidades do usuário
      const { data: usuarioUnidades, error: unidadesError } = await supabase
        .from('usuario_unidades')
        .select(`
          *,
          unidades (*)
        `)
        .eq('usuario_id', userId);

      if (unidadesError) {
        console.error('Erro ao buscar unidades:', unidadesError);
        return;
      }

      // Se tem apenas uma unidade, fazer login automático
      if (usuarioUnidades && usuarioUnidades.length === 1) {
        const relacao = usuarioUnidades[0];
        const unidade = relacao.unidades;
        
        const usuarioCompleto: Usuario = {
          id: usuarioData.id,
          senha: '', // Não armazenar senha
          unidadeId: unidade.id,
          tipoUnidade: unidade.tipo,
          nomeUnidade: unidade.nome,
          logoUnidade: unidade.logo || '',
          nomeUsuario: usuarioData.nome_usuario,
          email: usuarioData.email,
          cargo: relacao.cargo,
          telefone: usuarioData.telefone || '',
          fotoUsuario: usuarioData.foto_usuario || '',
          dataCadastro: usuarioData.data_cadastro,
          tipo: relacao.tipo,
          permissoes: relacao.permissoes
        };

        setUsuario(usuarioCompleto);
        localStorage.setItem('usuario-logado', JSON.stringify(usuarioCompleto));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };
  const carregarAtas = async () => {
    try {
      setCarregando(true);
      
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
      usuario,
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