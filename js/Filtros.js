/**
 * Filtros — Classe que aplica filtros combinados aos aforismos
 *
 * Lógica:
 * - Cada tipo de filtro se combina com AND (filtros diferentes são AND)
 * - Dentro de tags/categorias: OR se o modo for "qualquer", AND se "todas"
 *
 * Ver: docs/MANUAL_TECNICO.md §3.4
 */

class Filtros {
  constructor() {
    // Filtros
    this.busca = '';                    // substring (ignora acentos)
    this.categorias = [];               // IDs de categorias selecionadas
    this.categoriasLogica = 'any';      // 'any' = OR, 'all' = AND
    this.tags = [];                     // tags selecionadas
    this.tagsLogica = 'any';            // 'any' = OR, 'all' = AND
    this.tipos = [];                    // tipos: "aforismo", "citacao", "filme", "dito"
    this.autor = null;                  // autor específico ou null
    this.periodoAno = [null, null];     // [min, max] para anoReferencia
    this.favoritos = false;             // só mostrar favoritos?

    // Ordenação e paginação
    this.ordem = 'recentes';            // 'recentes', 'autor', 'cronologico', 'aleatorio'
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
  }

  /**
   * Aplica todos os filtros aos aforismos
   * @param {Array} aforismos - lista de aforismos do AforismoManager
   * @returns {Object} - { total, items, paginaAtual, itensPorPagina, paginas }
   */
  aplicar(aforismos) {
    let resultado = [...aforismos];

    // 1. Filtro: busca textual (ignora acentos)
    if (this.busca) {
      const buscaNorm = this._normalizarParaBusca(this.busca);
      resultado = resultado.filter(a => {
        const textoNorm = this._normalizarParaBusca(
          `${a.texto} ${a.autor || ''} ${a.obra || ''} ${a.notas || ''}`
        );
        return textoNorm.includes(buscaNorm);
      });
    }

    // 2. Filtro: categorias (múltiplas com OR/AND)
    if (this.categorias.length > 0) {
      resultado = resultado.filter(a => {
        if (this.categoriasLogica === 'all') {
          // Precisa ter TODAS as categorias selecionadas
          return this.categorias.every(cid => a.categoriaIds.includes(cid));
        } else {
          // Qualquer uma das categorias selecionadas
          return this.categorias.some(cid => a.categoriaIds.includes(cid));
        }
      });
    }

    // 3. Filtro: tags (múltiplas com OR/AND)
    if (this.tags.length > 0) {
      resultado = resultado.filter(a => {
        if (this.tagsLogica === 'all') {
          // Precisa ter TODAS as tags selecionadas
          return this.tags.every(t => a.tags.includes(t));
        } else {
          // Qualquer uma das tags selecionadas
          return this.tags.some(t => a.tags.includes(t));
        }
      });
    }

    // 4. Filtro: tipo (aforismo, citacao, filme, dito)
    if (this.tipos.length > 0) {
      resultado = resultado.filter(a => {
        const tipo = a.tipo || 'aforismo'; // padrão para dados antigos
        return this.tipos.includes(tipo);
      });
    }

    // 5. Filtro: autor
    if (this.autor !== null) {
      resultado = resultado.filter(a => a.autor === this.autor);
    }

    // 6. Filtro: época (anoReferencia entre min e max)
    if (this.periodoAno[0] !== null || this.periodoAno[1] !== null) {
      const [min, max] = this.periodoAno;
      resultado = resultado.filter(a => {
        // Se não tiver ano, não passa (filtra apenas com ano definido)
        if (a.anoReferencia === null || a.anoReferencia === undefined) return false;
        if (min !== null && a.anoReferencia < min) return false;
        if (max !== null && a.anoReferencia > max) return false;
        return true;
      });
    }

    // 7. Filtro: favoritos
    if (this.favoritos) {
      resultado = resultado.filter(a => a.favorito === true);
    }

    // 8. Ordenação
    resultado = this._ordenar(resultado);

    // 9. Paginação
    const total = resultado.length;
    const paginas = Math.max(1, Math.ceil(total / this.itensPorPagina));
    const pagina = Math.min(this.paginaAtual, paginas); // garante que página válida
    const inicio = (pagina - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return {
      total,
      items: resultado.slice(inicio, fim),
      paginaAtual: pagina,
      itensPorPagina: this.itensPorPagina,
      paginas,
    };
  }

  /**
   * Ordena resultado conforme this.ordem
   * @private
   */
  _ordenar(resultado) {
    const arr = [...resultado];

    switch (this.ordem) {
      case 'recentes':
        arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;

      case 'autor':
        arr.sort((a, b) => {
          const autorA = (a.autor || 'Anônimo').toLowerCase();
          const autorB = (b.autor || 'Anônimo').toLowerCase();
          return autorA.localeCompare(autorB);
        });
        break;

      case 'cronologico':
        arr.sort((a, b) => {
          const anoA = a.anoReferencia ?? 9999;
          const anoB = b.anoReferencia ?? 9999;
          return anoA - anoB;
        });
        break;

      case 'aleatorio':
        // Fisher-Yates shuffle
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        break;
    }

    return arr;
  }

  /**
   * Normaliza texto para busca (ignora acentos, minúsculas)
   * @private
   */
  _normalizarParaBusca(texto) {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, ''); // Remove acentos
  }

  /**
   * Reseta todos os filtros
   */
  resetar() {
    this.busca = '';
    this.categorias = [];
    this.categoriasLogica = 'any';
    this.tags = [];
    this.tagsLogica = 'any';
    this.tipos = [];
    this.autor = null;
    this.periodoAno = [null, null];
    this.favoritos = false;
    this.ordem = 'recentes';
    this.paginaAtual = 1;
  }

  /**
   * Retorna true se há algum filtro ativo
   */
  temFiltrosAtivos() {
    return !!(
      this.busca ||
      this.categorias.length > 0 ||
      this.tags.length > 0 ||
      this.tipos.length > 0 ||
      this.autor ||
      this.periodoAno[0] !== null ||
      this.periodoAno[1] !== null ||
      this.favoritos
    );
  }

  /**
   * Retorna array de filtros ativos para exibição
   * @param {Array} categorias - lista de categorias do AforismoManager
   * @returns {Array} - [{ tipo, valor, label }]
   */
  obterFiltrosAtivos(categorias) {
    const ativos = [];

    if (this.busca) {
      ativos.push({
        tipo: 'busca',
        valor: this.busca,
        label: `"${this.busca}"`,
      });
    }

    this.categorias.forEach(cid => {
      const cat = categorias.find(c => c.id === cid);
      if (cat) {
        ativos.push({
          tipo: 'categoria',
          valor: cid,
          label: cat.nome,
        });
      }
    });

    this.tags.forEach(tag => {
      ativos.push({
        tipo: 'tag',
        valor: tag,
        label: `#${tag}`,
      });
    });

    this.tipos.forEach(t => {
      const labels = {
        aforismo: '📖 Aforismo',
        citacao: '📚 Citação',
        filme: '🎬 Filme',
        dito: '💬 Dito',
      };
      ativos.push({
        tipo: 'tipo',
        valor: t,
        label: labels[t] || t,
      });
    });

    if (this.autor) {
      ativos.push({
        tipo: 'autor',
        valor: this.autor,
        label: `👤 ${this.autor}`,
      });
    }

    if (this.periodoAno[0] !== null || this.periodoAno[1] !== null) {
      const [min, max] = this.periodoAno;
      const label = `${min || '?'} – ${max || '?'}`;
      ativos.push({
        tipo: 'epoca',
        valor: null,
        label: `📅 ${label}`,
      });
    }

    if (this.favoritos) {
      ativos.push({
        tipo: 'favoritos',
        valor: true,
        label: '★ Favoritos',
      });
    }

    return ativos;
  }

  /**
   * Remove um filtro ativo
   * @param {string} tipo - 'busca', 'categoria', 'tag', 'autor', 'epoca', 'favoritos'
   * @param {*} valor - valor a remover
   */
  removerFiltro(tipo, valor) {
    switch (tipo) {
      case 'busca':
        this.busca = '';
        break;
      case 'categoria':
        this.categorias = this.categorias.filter(cid => cid !== valor);
        break;
      case 'tag':
        this.tags = this.tags.filter(t => t !== valor);
        break;
      case 'tipo':
        this.tipos = this.tipos.filter(t => t !== valor);
        break;
      case 'autor':
        this.autor = null;
        break;
      case 'epoca':
        this.periodoAno = [null, null];
        break;
      case 'favoritos':
        this.favoritos = false;
        break;
    }
    this.paginaAtual = 1; // volta pra página 1 ao remover filtro
  }
}

// Singleton global
const filtros = new Filtros();
