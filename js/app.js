/**
 * app.js — Orquestrador principal (state machine)
 *
 * Responsabilidades:
 * - Inicializar todos os managers
 * - Renderizar views baseado em navegação
 * - Coordenar eventos entre módulos
 * - Gerir tema escuro/claro
 *
 * Ver: docs/MANUAL_TECNICO.md §1.3, §5
 */

class App {
  constructor() {
    this._viewAtual = 'listagem';
    this._modalLeituraAberta = false;
    this._indiceAtualModal = null; // índice na lista filtrada
    this._listaFiltradaParaModal = []; // cópia da lista filtrada para navegação
  }

  /**
   * Inicializa a aplicação
   * Ordem crítica:
   * 1. StorageService já está carregado (singleton)
   * 2. Carrega seed de categorias e aforismos
   * 3. Inicializa AforismoManager
   * 4. Renderiza UI inicial
   */
  async init() {
    console.log('[app.js] Inicializando...');

    try {
      // Aguarda o AforismoManager carregar dados
      await aforismoManager.init();

      // Setup de tema
      this._inicializarTema();

      // Setup de listeners de filtro
      this._setupListenersForiltros();

      // Renderiza primeira vez
      this.renderListagem();

      // Setup de navegação
      this._setupNavegacao();

      console.log('[app.js] ✓ Inicialização concluída');
    } catch (e) {
      console.error('[app.js] Erro na inicialização:', e);
      alert('Erro ao carregar a extensão. Veja o console.');
    }
  }

  /**
   * Navega para uma view diferente
   * @param {string} viewName - 'listagem', 'categorias', 'novo'
   * @param {string} idAforismoEditar - (opcional) se estiver editando
   */
  navigate(viewName, idAforismoEditar = null) {
    if (viewName === this._viewAtual && !idAforismoEditar) return;

    // Oculta view atual
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Mostra nova view
    const newView = document.getElementById(`view-${viewName}`);
    if (newView) {
      newView.classList.add('active');
      this._viewAtual = viewName;

      // Atualiza nav (menu lateral)
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

      // Fecha sidebar em mobile
      if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('closed');
      }

      // Renderiza conteúdo específico da view
      if (viewName === 'listagem') {
        this.renderListagem();
      } else if (viewName === 'categorias') {
        this.renderCategorias();
      } else if (viewName === 'novo') {
        this.renderFormularioNovo(idAforismoEditar);
      }
    }
  }

  /**
   * Renderiza a listagem com filtros
   */
  async renderListagem() {
    console.log('[app.js] Renderizando listagem...');

    // Aplica filtros
    const resultado = filtros.aplicar(aforismoManager.aforismos);
    this._listaFiltradaParaModal = resultado.items; // guarda para navegação modal

    // Renderiza UI
    uiListagem.renderizar(resultado, aforismoManager);
  }

  /**
   * Renderiza gerenciador de categorias
   */
  renderCategorias() {
    console.log('[app.js] Renderizando categorias...');
    uiCategorias.renderizar(aforismoManager);
  }

  /**
   * Renderiza formulário de novo/editar aforismo
   * @param {string|null} idParaEditar
   */
  renderFormularioNovo(idParaEditar = null) {
    console.log('[app.js] Renderizando formulário...');
    const aforismo = idParaEditar ? aforismoManager.obterAforismoId(idParaEditar) : null;
    uiCadastro.renderizar(aforismo, aforismoManager);
  }

  /**
   * Abre modal de leitura de aforismo (por índice na lista filtrada)
   * @param {number} index
   */
  abrirModalLeitura(index) {
    this._indiceAtualModal = index;
    this._modalLeituraAberta = true;

    const aforismo = this._listaFiltradaParaModal[index];
    if (!aforismo) return;

    modalAforismoLeitura.renderizar(aforismo, aforismoManager);

    const backdrop = document.getElementById('modal-leitura');
    if (backdrop) backdrop.classList.add('aberto');

    // Atualiza botões de navegação modal
    this._atualizarBotoesNavegacaoModal();

    // Setup listeners para comentários
    this._setupListenersComentarios();
  }

  /**
   * Fecha modal de leitura
   */
  fecharModalLeitura() {
    this._modalLeituraAberta = false;
    const backdrop = document.getElementById('modal-leitura');
    if (backdrop) backdrop.classList.remove('aberto');
  }

  /**
   * Navega para aforismo anterior no modal
   */
  navegarModalAnterior() {
    if (this._indiceAtualModal === null) return;
    const novoIndex = this._indiceAtualModal - 1;
    if (novoIndex >= 0) {
      this.abrirModalLeitura(novoIndex);
    }
  }

  /**
   * Navega para aforismo próximo no modal
   */
  navegarModalProximo() {
    if (this._indiceAtualModal === null) return;
    const novoIndex = this._indiceAtualModal + 1;
    if (novoIndex < this._listaFiltradaParaModal.length) {
      this.abrirModalLeitura(novoIndex);
    }
  }

  /**
   * Atualiza estado dos botões de navegação do modal
   * @private
   */
  _atualizarBotoesNavegacaoModal() {
    const btnAnterior = document.getElementById('btn-modal-anterior');
    const btnProximo = document.getElementById('btn-modal-proxximo');

    if (btnAnterior) btnAnterior.disabled = this._indiceAtualModal === 0;
    if (btnProximo) btnProximo.disabled = this._indiceAtualModal >= this._listaFiltradaParaModal.length - 1;
  }

  /**
   * Toggle favorito do aforismo que tá no modal aberto
   */
  toggleFavoritoDoModal() {
    if (this._indiceAtualModal === null) return;
    const aforismo = this._listaFiltradaParaModal[this._indiceAtualModal];
    if (!aforismo) return;

    aforismoManager.toggleFavorito(aforismo.id);
    // Re-renderiza modal com novo estado
    modalAforismoLeitura.renderizar(aforismo, aforismoManager);
  }

  /**
   * Edita aforismo do modal aberto
   */
  editarAforismoDoModal() {
    if (this._indiceAtualModal === null) return;
    const aforismo = this._listaFiltradaParaModal[this._indiceAtualModal];
    if (!aforismo) return;

    this.fecharModalLeitura();
    this.navigate('novo', aforismo.id);
  }

  /**
   * Paginação: vai para página anterior
   */
  paginacaoAnterior() {
    if (filtros.paginaAtual > 1) {
      filtros.paginaAtual--;
      this.renderListagem();
    }
  }

  /**
   * Paginação: vai para página próxima
   */
  paginacaoProximo() {
    const resultado = filtros.aplicar(aforismoManager.aforismos);
    if (filtros.paginaAtual < resultado.paginas) {
      filtros.paginaAtual++;
      this.renderListagem();
    }
  }

  /**
   * Adiciona comentário ao aforismo do modal
   */
  adicionarComentarioDoModal() {
    if (this._indiceAtualModal === null) return;
    const aforismo = this._listaFiltradaParaModal[this._indiceAtualModal];
    if (!aforismo) return;

    const textarea = document.getElementById('comentario-novo-texto');
    const selectTipo = document.getElementById('comentario-novo-tipo');

    if (!textarea || !selectTipo) return;

    const texto = textarea.value.trim();
    if (!texto) {
      alert('Escreva um comentário!');
      return;
    }

    aforismoManager.adicionarComentario(aforismo.id, {
      tipo: selectTipo.value,
      texto: texto,
      autor: 'Você',
    });

    // Re-renderiza o modal
    modalAforismoLeitura.renderizar(aforismo, aforismoManager);

    // Limpa o textarea
    textarea.value = '';
  }

  /**
   * Deleta comentário do aforismo do modal
   * @param {string} aforismoId
   * @param {string} comentarioId
   */
  deletarComentarioDoModal(aforismoId, comentarioId) {
    if (confirm('Excluir este comentário?')) {
      aforismoManager.deletarComentario(aforismoId, comentarioId);

      const aforismo = aforismoManager.obterAforismoId(aforismoId);
      if (aforismo) {
        modalAforismoLeitura.renderizar(aforismo, aforismoManager);
      }
    }
  }

  /**
   * Setup de listeners para comentários no modal
   * @private
   */
  _setupListenersComentarios() {
    const btnAdicionar = document.getElementById('btn-adicionar-comentario');
    if (btnAdicionar) {
      btnAdicionar.onclick = () => this.adicionarComentarioDoModal();
    }
  }

  /**
   * Inicializa tema escuro/claro
   * @private
   */
  _inicializarTema() {
    const btnTema = document.getElementById('btn-theme-toggle');
    if (!btnTema) return;

    // Verifica preferência do usuário ou sistema
    const temaPreferido = localStorage.getItem('tema-extaforismos') || 'auto';
    this._aplicarTema(temaPreferido);

    // Listener no botão
    btnTema.onclick = () => {
      const temaSalvo = localStorage.getItem('tema-extaforismos') || 'auto';
      let novoTema;
      if (temaSalvo === 'auto') {
        novoTema = modoEscuroDoSistema() ? 'claro' : 'escuro';
      } else if (temaSalvo === 'escuro') {
        novoTema = 'claro';
      } else {
        novoTema = 'auto';
      }
      localStorage.setItem('tema-extaforismos', novoTema);
      this._aplicarTema(novoTema);
    };
  }

  /**
   * Aplica tema ao documento
   * @private
   */
  _aplicarTema(tema) {
    const html = document.documentElement;
    if (tema === 'auto') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', tema);
    }
  }

  /**
   * Setup de listeners para filtros
   * @private
   */
  _setupListenersForiltros() {
    // Busca (com debounce)
    const inputBusca = document.getElementById('filtro-busca');
    if (inputBusca) {
      inputBusca.addEventListener(
        'input',
        debounce((e) => {
          filtros.busca = e.target.value;
          filtros.paginaAtual = 1;
          this.renderListagem();
        }, 300)
      );
    }

    // Ordem
    const selectOrdem = document.getElementById('filtro-ordem');
    if (selectOrdem) {
      selectOrdem.addEventListener('change', (e) => {
        filtros.ordem = e.target.value;
        filtros.paginaAtual = 1;
        this.renderListagem();
      });
    }

    // Itens por página
    const selectItens = document.getElementById('paginacao-itens');
    if (selectItens) {
      selectItens.addEventListener('change', (e) => {
        filtros.itensPorPagina = parseInt(e.target.value);
        filtros.paginaAtual = 1;
        this.renderListagem();
      });
    }

    // Botão "Novo Aforismo"
    const btnNovo = document.getElementById('btn-novo-aforismo');
    if (btnNovo) {
      btnNovo.onclick = () => this.navigate('novo');
    }

    // Botão "Limpar Filtros"
    const btnLimpar = document.getElementById('btn-limpar-filtros');
    if (btnLimpar) {
      btnLimpar.onclick = () => {
        filtros.resetar();
        // Re-popula inputs do UI
        document.getElementById('filtro-busca').value = '';
        document.getElementById('filtro-ordem').value = 'recentes';
        this.renderListagem();
      };
    }
  }

  /**
   * Setup de navegação (menu sidebar)
   * @private
   */
  _setupNavegacao() {
    const btnToggle = document.getElementById('btn-menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (btnToggle && sidebar) {
      btnToggle.onclick = () => {
        sidebar.classList.toggle('closed');
      };
    }

    // Responsividade: fecha sidebar ao redimensionar para mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('closed')) {
        sidebar.classList.add('closed');
      }
    });
  }
}

// Singleton global
const app = new App();

// Inicializa ao carregar DOM
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
