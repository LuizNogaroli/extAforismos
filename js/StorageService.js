/**
 * StorageService — Fallback automático com persistência
 *
 * Tentativa 1: chrome.storage.local (extensão instalada)
 * Tentativa 2: localStorage (dev-server / navegador)
 * Tentativa 3: memória (offline, não persiste)
 *
 * Ver: extDocumentacao/01-storage-e-persistencia.md
 */

class StorageService {
  constructor() {
    this._cache = new Map(); // cache em memória para evitar re-reads desnecessários
  }

  /**
   * Recupera um valor do storage
   * @param {string} key - chave
   * @param {*} defaultValue - valor padrão se não encontrado
   * @returns {Promise<*>}
   */
  async get(key, defaultValue) {
    // Verifica cache primeiro
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }

    // Tentativa 1: chrome.storage.local (extensão instalada)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else if (key in result) {
              this._cache.set(key, result[key]);
              resolve(result[key]);
            } else {
              resolve(defaultValue);
            }
          });
        });
      } catch (e) {
        console.warn('[StorageService] chrome.storage.local falhou:', e.message);
      }
    }

    // Tentativa 2: localStorage (dev-server / navegador)
    if (typeof localStorage !== 'undefined') {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          const parsed = JSON.parse(value);
          this._cache.set(key, parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('[StorageService] localStorage falhou:', e.message);
      }
    }

    // Tentativa 3: memória (offline)
    return defaultValue;
  }

  /**
   * Salva um valor no storage
   * @param {string} key - chave
   * @param {*} value - valor (será serializado para JSON)
   * @returns {Promise<void>}
   */
  async set(key, value) {
    this._cache.set(key, value);

    // Tentativa 1: chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      } catch (e) {
        console.warn('[StorageService] chrome.storage.local falhou ao salvar:', e.message);
      }
    }

    // Tentativa 2: localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return;
      } catch (e) {
        console.warn('[StorageService] localStorage falhou ao salvar:', e.message);
      }
    }

    // Tentativa 3: só memória
    console.warn('[StorageService] Offline mode: dados salvos só em memória, serão perdidos ao recarregar');
  }

  /**
   * Remove uma chave do storage
   * @param {string} key
   * @returns {Promise<void>}
   */
  async remove(key) {
    this._cache.delete(key);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        return new Promise((resolve, reject) => {
          chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      } catch (e) {
        console.warn('[StorageService] chrome.storage.local falhou ao remover:', e.message);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn('[StorageService] localStorage falhou ao remover:', e.message);
      }
    }
  }

  /**
   * Limpa todo o storage
   * @returns {Promise<void>}
   */
  async clear() {
    this._cache.clear();

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        return new Promise((resolve, reject) => {
          chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      } catch (e) {
        console.warn('[StorageService] chrome.storage.local falhou ao limpar:', e.message);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.clear();
        return;
      } catch (e) {
        console.warn('[StorageService] localStorage falhou ao limpar:', e.message);
      }
    }
  }
}

// Singleton global
const storageService = new StorageService();
