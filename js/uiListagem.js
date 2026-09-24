/**
 * uiListagem.js — Renderização da listagem de aforismos
 */

const uiListagem = {
  renderizar(resultado, manager) {
    const container = document.getElementById('aforismos-list');
    if (!container) return;

    container.innerHTML = '';

    if (resultado.items.length === 0) {
      container.innerHTML = '<li class="vazio"><p>Nenhum aforismo encontrado com esses filtros.</p></li>';
      document.getElementById('resultado-contador').textContent = '0 aforismos';
      return;
    }

    resultado.items.forEach((aforismo, index) => {
      const li = this.criarCardAforismos(aforismo, manager, index);
      container.appendChild(li);
    });

    // Atualiza contador
    const label = resultado.total === 1 ? 'aforismo' : 'aforismos';
    document.getElementById('resultado-contador').textContent = `${resultado.total} ${label}`;

    // Atualiza paginação
    this.atualizarPaginacao(resultado);

    // Atualiza filtros ativos
    this.atualizarFiltrosAtivos(manager);
  },

  criarCardAforismos(aforismo, manager, index) {
    const li = document.createElement('li');
    li.className = aforismo.favorito ? 'aforismo-card favorito' : 'aforismo-card';

    // Capitular
    const primeiraLetra = aforismo.autor ? aforismo.autor.charAt(0).toUpperCase() : '?';
    const capitular = document.createElement('div');
    capitular.className = 'capitular';
    capitular.textContent = primeiraLetra;

    // Dados principais
    const dados = document.createElement('div');
    dados.className = 'aforismo-dados';

    const titulo = document.createElement('div');
    titulo.className = 'aforismo-titulo';
    titulo.textContent = `${aforismo.autor || 'Anônimo'} · ${aforismo.obra || '?'} · ${aforismo.epoca || '?'}`;

    const trecho = document.createElement('div');
    trecho.className = 'aforismo-trecho';
    trecho.textContent = truncar(aforismo.texto, 150);

    const tags = document.createElement('div');
    tags.className = 'aforismo-tags';
    aforismo.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = `#${tag}`;
      tags.appendChild(span);
    });

    dados.appendChild(titulo);
    dados.appendChild(trecho);
    dados.appendChild(tags);

    // Ações (coluna direita)
    const acoes = document.createElement('div');
    acoes.className = 'aforismo-acoes';

    // Categorias como pills
    const categoriasDiv = document.createElement('div');
    categoriasDiv.className = 'aforismo-categorias';
    aforismo.categoriaIds.forEach(catId => {
      const cat = manager.obterCategoriaId(catId);
      if (cat) {
        const pill = document.createElement('span');
        pill.className = 'categoria-pill';
        pill.textContent = cat.nome;
        categoriasDiv.appendChild(pill);
      }
    });

    // Botões
    const btnLer = document.createElement('button');
    btnLer.className = 'btn-ler';
    btnLer.textContent = '❦ Ler';
    btnLer.onclick = () => app.abrirModalLeitura(index);

    acoes.appendChild(categoriasDiv);
    acoes.appendChild(btnLer);

    // Monta card
    li.appendChild(capitular);
    li.appendChild(dados);
    li.appendChild(acoes);

    // Click na linha abre modal
    li.onclick = (e) => {
      if (e.target !== btnLer) app.abrirModalLeitura(index);
    };

    return li;
  },

  atualizarPaginacao(resultado) {
    const btnAnterior = document.getElementById('paginacao-anterior');
    const btnProximo = document.getElementById('paginacao-proximo');
    const infoPagina = document.getElementById('paginacao-info-pagina');

    if (btnAnterior) btnAnterior.disabled = resultado.paginaAtual === 1;
    if (btnProximo) btnProximo.disabled = resultado.paginaAtual === resultado.paginas;
    if (infoPagina) infoPagina.textContent = `Página ${resultado.paginaAtual} de ${resultado.paginas}`;
  },

  atualizarFiltrosAtivos(manager) {
    const container = document.getElementById('filtros-ativos');
    const btnLimpar = document.getElementById('btn-limpar-filtros');
    if (!container) return;

    const ativos = filtros.obterFiltrosAtivos(manager.categorias);
    container.innerHTML = '';

    if (ativos.length === 0) {
      if (btnLimpar) btnLimpar.style.display = 'none';
      return;
    }

    if (btnLimpar) btnLimpar.style.display = 'inline-block';

    ativos.forEach(filtro => {
      const chip = document.createElement('span');
      chip.className = 'filtro-chip';
      chip.innerHTML = `${esc(filtro.label)} <button class="chip-remove" onclick="filtros.removerFiltro('${filtro.tipo}', ${JSON.stringify(filtro.valor).replace(/"/g, '&quot;')}); app.renderListagem();">✕</button>`;
      container.appendChild(chip);
    });
  },
};
