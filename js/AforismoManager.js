/**
 * AforismoManager — CRUD de aforismos + categorias
 *
 * Responsabilidades:
 * - Carregar dados do storage (com seed automática na primeira vez)
 * - CRUD de aforismos (criar, ler, atualizar, deletar)
 * - CRUD de categorias
 * - Persistência (salvar no storage após mudanças)
 *
 * Ver: docs/MANUAL_TECNICO.md §3.1, §3.6
 */

class AforismoManager {
  constructor(storage = storageService) {
    this.storage = storage;
    this.aforismos = [];
    this.categorias = [];
    this._migrado = false;
  }

  /**
   * Inicializa o manager: carrega dados do storage ou cria seed
   * @returns {Promise<void>}
   */
  async init() {
    console.log('[AforismoManager] Inicializando...');

    // Verifica se já foi migrado de schema v1 para v2
    this._migrado = await this.storage.get('aforismos_migrado_v2', false);

    // Carrega ou cria seed
    let loadedAforismos = await this.storage.get('aforismos_data', null);
    let loadedCategorias = await this.storage.get('aforismos_categorias', null);

    if (loadedAforismos === null) {
      // Primeira vez: usa seed
      console.log('[AforismoManager] Primeira inicialização. Carregando seed...');
      this.aforismos = JSON.parse(JSON.stringify(seedAforismos)); // deep copy
      this.categorias = JSON.parse(JSON.stringify(seedCategorias));
      await this.save();
      console.log(`[AforismoManager] Seed carregada: ${this.aforismos.length} aforismos, ${this.categorias.length} categorias`);
    } else {
      // Já tem dados: carrega do storage
      this.aforismos = loadedAforismos || [];
      this.categorias = loadedCategorias || [];

      // Migração de schema (se necessário)
      if (!this._migrado) {
        await this._migrarSchemav1Parav2();
      }

      console.log(`[AforismoManager] Dados carregados: ${this.aforismos.length} aforismos, ${this.categorias.length} categorias`);
    }
  }

  /**
   * Migra de schema v1 (categoriaId singular) para v2 (categoriaIds array)
   * @private
   */
  async _migrarSchemav1Parav2() {
    console.log('[AforismoManager] Migrando schema v1 → v2...');
    let mudou = false;

    this.aforismos.forEach(a => {
      if (a.categoriaId !== undefined) {
        a.categoriaIds = a.categoriaId ? [a.categoriaId] : [];
        delete a.categoriaId;
        mudou = true;
      }
    });

    if (mudou) {
      await this.save();
      await this.storage.set('aforismos_migrado_v2', true);
      console.log('[AforismoManager] Migração concluída.');
    }
  }

  /**
   * Salva dados no storage
   * @private
   */
  async save() {
    await this.storage.set('aforismos_data', this.aforismos);
    await this.storage.set('aforismos_categorias', this.categorias);
  }

  // ========== CRUD: Aforismos ==========

  /**
   * Cria um novo aforismo
   * @param {Object} dados - { texto, autor, obra, epoca, anoReferencia, idiomaOriginal, textoOriginal, categoriaIds, tags, notas, favorito }
   * @returns {string} - ID do aforismo criado
   */
  criarAforismos(dados) {
    const id = this._gerarId();
    const agora = new Date().toISOString();

    const aforismo = {
      id,
      texto: dados.texto,
      autor: dados.autor || null,
      obra: dados.obra || null,
      epoca: dados.epoca || null,
      anoReferencia: dados.anoReferencia || null,
      idiomaOriginal: dados.idiomaOriginal || null,
      textoOriginal: dados.textoOriginal || null,
      categoriaIds: Array.isArray(dados.categoriaIds) ? dados.categoriaIds : [],
      tags: this._normalizarTags(dados.tags),
      favorito: dados.favorito || false,
      notas: dados.notas || '',
      createdAt: agora,
      updatedAt: agora,
    };

    this.aforismos.push(aforismo);
    this.save();
    return id;
  }

  /**
   * Recupera um aforismo por ID
   * @param {string} id
   * @returns {Object|null}
   */
  obterAforismoId(id) {
    return this.aforismos.find(a => a.id === id) || null;
  }

  /**
   * Atualiza um aforismo
   * @param {string} id
   * @param {Object} dados - campos a atualizar
   */
  atualizarAforismos(id, dados) {
    const aforismo = this.obterAforismoId(id);
    if (!aforismo) throw new Error(`Aforismo ${id} não encontrado`);

    // Atualiza campos permitidos
    if (dados.texto !== undefined) aforismo.texto = dados.texto;
    if (dados.autor !== undefined) aforismo.autor = dados.autor;
    if (dados.obra !== undefined) aforismo.obra = dados.obra;
    if (dados.epoca !== undefined) aforismo.epoca = dados.epoca;
    if (dados.anoReferencia !== undefined) aforismo.anoReferencia = dados.anoReferencia;
    if (dados.idiomaOriginal !== undefined) aforismo.idiomaOriginal = dados.idiomaOriginal;
    if (dados.textoOriginal !== undefined) aforismo.textoOriginal = dados.textoOriginal;
    if (Array.isArray(dados.categoriaIds)) aforismo.categoriaIds = dados.categoriaIds;
    if (dados.tags !== undefined) aforismo.tags = this._normalizarTags(dados.tags);
    if (dados.notas !== undefined) aforismo.notas = dados.notas;
    if (dados.favorito !== undefined) aforismo.favorito = dados.favorito;

    aforismo.updatedAt = new Date().toISOString();
    this.save();
  }

  /**
   * Deleta um aforismo
   * @param {string} id
   */
  deletarAforismos(id) {
    const idx = this.aforismos.findIndex(a => a.id === id);
    if (idx === -1) throw new Error(`Aforismo ${id} não encontrado`);

    this.aforismos.splice(idx, 1);
    this.save();
  }

  /**
   * Toggle favorito
   * @param {string} id
   */
  toggleFavorito(id) {
    const aforismo = this.obterAforismoId(id);
    if (!aforismo) throw new Error(`Aforismo ${id} não encontrado`);

    aforismo.favorito = !aforismo.favorito;
    aforismo.updatedAt = new Date().toISOString();
    this.save();
  }

  // ========== CRUD: Categorias ==========

  /**
   * Cria uma nova categoria
   * @param {string} nome
   * @returns {string} - ID da categoria
   */
  criarCategoria(nome) {
    const id = this._gerarId();
    const categoria = {
      id,
      nome,
      createdAt: new Date().toISOString(),
    };

    this.categorias.push(categoria);
    this.save();
    return id;
  }

  /**
   * Recupera uma categoria por ID
   * @param {string} id
   * @returns {Object|null}
   */
  obterCategoriaId(id) {
    return this.categorias.find(c => c.id === id) || null;
  }

  /**
   * Atualiza nome de uma categoria
   * @param {string} id
   * @param {string} novoNome
   */
  renomearCategoria(id, novoNome) {
    const categoria = this.obterCategoriaId(id);
    if (!categoria) throw new Error(`Categoria ${id} não encontrada`);

    categoria.nome = novoNome;
    this.save();
  }

  /**
   * Deleta uma categoria
   * Remove a categoria de todos os aforismos
   * @param {string} id
   */
  deletarCategoria(id) {
    const idx = this.categorias.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Categoria ${id} não encontrada`);

    this.categorias.splice(idx, 1);

    // Remove da categoria de todos os aforismos
    this.aforismos.forEach(a => {
      a.categoriaIds = a.categoriaIds.filter(cid => cid !== id);
    });

    this.save();
  }

  /**
   * Retorna lista de todos os autores (únicos)
   * @returns {string[]}
   */
  obterAutores() {
    const autores = new Set();
    this.aforismos.forEach(a => {
      if (a.autor) autores.add(a.autor);
    });
    return Array.from(autores).sort();
  }

  /**
   * Retorna lista de todas as tags (únicas)
   * @returns {string[]}
   */
  obterTags() {
    const tags = new Set();
    this.aforismos.forEach(a => {
      a.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }

  // ========== Helpers ==========

  /**
   * Gera um ID único (simplificado: timestamp + random)
   * @private
   */
  _gerarId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normaliza tags: minúsculas, sem espaços extras
   * @private
   */
  _normalizarTags(tags) {
    if (!tags) return [];
    if (typeof tags === 'string') {
      // Se é string com vírgulas, split e normaliza
      return tags
        .split(',')
        .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
        .filter(t => t.length > 0);
    }
    if (Array.isArray(tags)) {
      return tags
        .map(t => (typeof t === 'string' ? t.trim().toLowerCase().replace(/\s+/g, '-') : ''))
        .filter(t => t.length > 0);
    }
    return [];
  }
}

// Singleton global
const aforismoManager = new AforismoManager();
