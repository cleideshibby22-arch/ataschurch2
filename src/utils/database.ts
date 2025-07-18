// Simulação de banco de dados usando localStorage com sincronização
export class DatabaseManager {
  private static instance: DatabaseManager;
  private syncKey = 'atas-db-sync';

  private constructor() {
    this.initializeSync();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeSync() {
    // Simular sincronização com servidor
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('atas-') || e.key?.startsWith('usuarios-')) {
        this.syncData();
      }
    });

    // Sincronizar a cada 30 segundos
    setInterval(() => {
      this.syncData();
    }, 30000);
  }

  private syncData() {
    try {
      const lastSync = localStorage.getItem(this.syncKey);
      const now = new Date().toISOString();
      
      // Simular sincronização com servidor remoto
      const dados = {
        atas: JSON.parse(localStorage.getItem('atas-sacramentais') || '[]'),
        usuarios: JSON.parse(localStorage.getItem('usuarios-unidade') || '[]'),
        hinos: JSON.parse(localStorage.getItem('hinos-personalizados') || '[]'),
        lastSync: now
      };

      // Em um ambiente real, aqui seria feita a sincronização com o servidor
      localStorage.setItem(this.syncKey, now);
      
      console.log('Dados sincronizados:', now);
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }

  public saveData(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.syncData();
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }

  public getData(key: string) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  }

  public exportAllData() {
    return {
      atas: this.getData('atas-sacramentais') || [],
      usuarios: this.getData('usuarios-unidade') || [],
      hinos: this.getData('hinos-personalizados') || [],
      exportedAt: new Date().toISOString()
    };
  }

  public importAllData(data: any) {
    try {
      if (data.atas) this.saveData('atas-sacramentais', data.atas);
      if (data.usuarios) this.saveData('usuarios-unidade', data.usuarios);
      if (data.hinos) this.saveData('hinos-personalizados', data.hinos);
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

export const db = DatabaseManager.getInstance();