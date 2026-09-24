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
    this._migradoV2 = false;
    this._migradoV3 = false;
    this._migradoV4 = false;
    this._migradoV5 = false;
  }

  /**
   * Inicializa o manager: carrega dados do storage ou cria seed
   * @returns {Promise<void>}
   */
  async init() {
    console.log('[AforismoManager] Inicializando...');

    // Verifica flags de migração
    this._migradoV2 = await this.storage.get('aforismos_migrado_v2', false);
    this._migradoV3 = await this.storage.get('aforismos_migrado_v3', false);
    this._migradoV4 = await this.storage.get('aforismos_migrado_v4', false);
    this._migradoV5 = await this.storage.get('aforismos_migrado_v5', false);

    // Carrega ou cria seed
    let loadedAforismos = await this.storage.get('aforismos_data', null);
    let loadedCategorias = await this.storage.get('aforismos_categorias', null);

    if (loadedAforismos === null) {
      // Primeira vez: usa seed
      console.log('[AforismoManager] Primeira inicialização. Carregando seed v0.3.0...');
      this.aforismos = JSON.parse(JSON.stringify(seedAforismos)); // deep copy
      this.categorias = JSON.parse(JSON.stringify(seedCategorias));
      await this.save();
      await this.storage.set('aforismos_migrado_v2', true);
      await this.storage.set('aforismos_migrado_v3', true);
      await this.storage.set('aforismos_migrado_v4', true);
      await this.storage.set('aforismos_migrado_v5', true);
      console.log(`[AforismoManager] Seed carregada: ${this.aforismos.length} itens, ${this.categorias.length} categorias`);
    } else {
      // Já tem dados: carrega do storage
      this.aforismos = loadedAforismos || [];
      this.categorias = loadedCategorias || [];

      // Migração de schema v1 → v2 (se necessário)
      if (!this._migradoV2) {
        await this._migrarSchemav1Parav2();
      }

      // Migração de schema v2 → v3 (se necessário)
      if (!this._migradoV3) {
        await this._migrarSchemav2Parav3();
      }

      // Migração de schema v3 → v4 (se necessário)
      if (!this._migradoV4) {
        await this._migrarSchemav3Parav4();
      }

      // Migração de schema v4 → v5 (se necessário)
      if (!this._migradoV5) {
        await this._migrarSchemav4Parav5();
      }

      console.log(`[AforismoManager] Dados carregados: ${this.aforismos.length} itens, ${this.categorias.length} categorias`);
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
      console.log('[AforismoManager] Migração v1 → v2 concluída.');
    }
  }

  /**
   * Migra de schema v2 (sem tipo) para v3 (com tipo + campos de citação)
   * @private
   */
  async _migrarSchemav2Parav3() {
    console.log('[AforismoManager] Migrando schema v2 → v3...');
    let mudou = false;

    this.aforismos.forEach(a => {
      // Adiciona campo `tipo` se não existir (padrão: aforismo)
      if (a.tipo === undefined) {
        a.tipo = 'aforismo';
        mudou = true;
      }

      // Adiciona campos de citação com valores padrão
      if (a.leitura_completa === undefined) a.leitura_completa = false;
      if (a.contexto === undefined) a.contexto = '';
      if (a.pagina === undefined) a.pagina = null;
      if (a.edicao === undefined) a.edicao = null;
      if (a.generoLiterario === undefined) a.generoLiterario = '';
      if (a.anoPublicacao === undefined) a.anoPublicacao = a.anoReferencia || null;

      if (mudou) console.log(`[AforismoManager] Migrou v2→v3: ${a.id}`);
    });

    if (mudou) {
      await this.save();
      await this.storage.set('aforismos_migrado_v3', true);
      console.log('[AforismoManager] Migração v2 → v3 concluída.');
    }
  }

  /**
   * Migra de schema v3 (sem comentários) para v4 (com comentários)
   * @private
   */
  async _migrarSchemav3Parav4() {
    console.log('[AforismoManager] Migrando schema v3 → v4...');
    let mudou = false;

    this.aforismos.forEach(a => {
      // Adiciona array de comentários se não existir
      if (!Array.isArray(a.comentarios)) {
        a.comentarios = [];
        mudou = true;
        console.log(`[AforismoManager] Migrou v3→v4: ${a.id}`);
      }
    });

    if (mudou) {
      await this.save();
      await this.storage.set('aforismos_migrado_v4', true);
      console.log('[AforismoManager] Migração v3 → v4 concluída.');
    }
  }

  /**
   * Migra de schema v4 (sem imagens/livros) para v5 (com imagens e livrosRecomendados)
   * @private
   */
  async _migrarSchemav4Parav5() {
    console.log('[AforismoManager] Migrando schema v4 → v5...');
    let mudou = false;

    this.aforismos.forEach(a => {
      // Adiciona arrays de imagens e livros se não existirem
      if (!Array.isArray(a.imagens)) {
        a.imagens = [];
        mudou = true;
      }
      if (!Array.isArray(a.livrosRecomendados)) {
        a.livrosRecomendados = [];
        mudou = true;
      }
    });

    if (mudou) {
      await this.save();
      await this.storage.set('aforismos_migrado_v5', true);
      console.log('[AforismoManager] Migração v4 → v5 concluída.');
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
   * Cria um novo aforismo/citação/filme/dito
   * @param {Object} dados - { tipo, texto, autor, obra, epoca, anoReferencia, categoriaIds, tags, notas, favorito, ... }
   * @returns {string} - ID criado
   */
  criarAforismos(dados) {
    const id = this._gerarId();
    const agora = new Date().toISOString();

    const item = {
      id,
      tipo: dados.tipo || 'aforismo',
      texto: dados.texto,
      autor: dados.autor || null,
      obra: dados.obra || null,
      epoca: dados.epoca || null,
      anoReferencia: dados.anoReferencia || null,
      anoPublicacao: dados.anoPublicacao || dados.anoReferencia || null,
      idiomaOriginal: dados.idiomaOriginal || null,
      textoOriginal: dados.textoOriginal || null,
      contexto: dados.contexto || '',
      pagina: dados.pagina || null,
      edicao: dados.edicao || null,
      generoLiterario: dados.generoLiterario || '',
      leitura_completa: dados.leitura_completa || false,
      categoriaIds: Array.isArray(dados.categoriaIds) ? dados.categoriaIds : [],
      tags: this._normalizarTags(dados.tags),
      favorito: dados.favorito || false,
      notas: dados.notas || '',
      comentarios: [],
      createdAt: agora,
      updatedAt: agora,
    };

    this.aforismos.push(item);
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

  // ========== CRUD: Comentários ==========

  /**
   * Adiciona um comentário a um aforismo
   * @param {string} aforismoId - ID do aforismo
   * @param {Object} comentario - { tipo, texto, autor }
   * @returns {string} - ID do comentário
   */
  adicionarComentario(aforismoId, comentario) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    const id = this._gerarId();
    const novoComentario = {
      id,
      tipo: comentario.tipo || 'interpretacao',
      texto: comentario.texto,
      autor: comentario.autor || 'Você',
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(item.comentarios)) {
      item.comentarios = [];
    }

    item.comentarios.push(novoComentario);
    item.updatedAt = new Date().toISOString();
    this.save();
    return id;
  }

  /**
   * Deleta um comentário
   * @param {string} aforismoId
   * @param {string} comentarioId
   */
  deletarComentario(aforismoId, comentarioId) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    if (!Array.isArray(item.comentarios)) return;

    const idx = item.comentarios.findIndex(c => c.id === comentarioId);
    if (idx === -1) throw new Error(`Comentário ${comentarioId} não encontrado`);

    item.comentarios.splice(idx, 1);
    item.updatedAt = new Date().toISOString();
    this.save();
  }

  /**
   * Retorna comentários de um aforismo
   * @param {string} aforismoId
   * @returns {Array}
   */
  obterComentarios(aforismoId) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) return [];
    return item.comentarios || [];
  }

  // ========== CRUD: Imagens ==========

  /**
   * Adiciona uma imagem a um aforismo
   * @param {string} aforismoId
   * @param {Object} imagem - { url, descricao, width, height }
   * @returns {string} - ID da imagem
   */
  adicionarImagem(aforismoId, imagem) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    const id = this._gerarId();
    const novaImagem = {
      id,
      url: imagem.url, // data URI
      descricao: imagem.descricao || '',
      width: imagem.width || 0,
      height: imagem.height || 0,
      addedAt: new Date().toISOString(),
    };

    if (!Array.isArray(item.imagens)) {
      item.imagens = [];
    }

    item.imagens.push(novaImagem);
    item.updatedAt = new Date().toISOString();
    this.save();
    return id;
  }

  /**
   * Deleta uma imagem
   * @param {string} aforismoId
   * @param {string} imagemId
   */
  deletarImagem(aforismoId, imagemId) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    if (!Array.isArray(item.imagens)) return;

    const idx = item.imagens.findIndex(i => i.id === imagemId);
    if (idx === -1) throw new Error(`Imagem ${imagemId} não encontrada`);

    item.imagens.splice(idx, 1);
    item.updatedAt = new Date().toISOString();
    this.save();
  }

  // ========== CRUD: Livros Recomendados ==========

  /**
   * Adiciona um livro recomendado
   * @param {string} aforismoId
   * @param {Object} livro - { titulo, autor, isbn, marketplace, urlAfiliado, comoRelacionado }
   * @returns {string} - ID do livro
   */
  adicionarLivroRecomendado(aforismoId, livro) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    const id = this._gerarId();
    const novoLivro = {
      id,
      titulo: livro.titulo,
      autor: livro.autor || '',
      isbn: livro.isbn || '',
      marketplace: livro.marketplace || 'amazon',
      urlAfiliado: livro.urlAfiliado,
      comoRelacionado: livro.comoRelacionado || '',
      addedAt: new Date().toISOString(),
    };

    if (!Array.isArray(item.livrosRecomendados)) {
      item.livrosRecomendados = [];
    }

    item.livrosRecomendados.push(novoLivro);
    item.updatedAt = new Date().toISOString();
    this.save();
    return id;
  }

  /**
   * Deleta um livro recomendado
   * @param {string} aforismoId
   * @param {string} livroId
   */
  deletarLivroRecomendado(aforismoId, livroId) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) throw new Error(`Item ${aforismoId} não encontrado`);

    if (!Array.isArray(item.livrosRecomendados)) return;

    const idx = item.livrosRecomendados.findIndex(l => l.id === livroId);
    if (idx === -1) throw new Error(`Livro ${livroId} não encontrado`);

    item.livrosRecomendados.splice(idx, 1);
    item.updatedAt = new Date().toISOString();
    this.save();
  }

  /**
   * Retorna livros recomendados de um aforismo
   * @param {string} aforismoId
   * @returns {Array}
   */
  obterLivrosRecomendados(aforismoId) {
    const item = this.obterAforismoId(aforismoId);
    if (!item) return [];
    return item.livrosRecomendados || [];
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
