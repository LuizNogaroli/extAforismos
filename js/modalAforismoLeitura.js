/**
 * modalAforismoLeitura.js — Modal vintage de leitura
 */

const modalAforismoLeitura = {
  renderizar(aforismo, manager) {
    const content = document.querySelector('.modal-content-vintage');
    if (!content) return;

    // Categorias como subtítulo
    const categorias = aforismo.categoriaIds
      .map(cid => manager.obterCategoriaId(cid)?.nome)
      .filter(Boolean)
      .join(' · ');

    const cabecalho = categorias ? `❦ ${categorias.toUpperCase()} ❦` : '❦ AFORISMO ❦';

    // Texto com capitular simulada
    let texto = aforismo.texto;
    const primeiraLetra = texto.charAt(0).toUpperCase();
    const resto = texto.slice(1);

    // HTML do modal
    content.innerHTML = `
      <div class="modal-cabecalho-vintage">${esc(cabecalho)}</div>

      <div class="modal-texto-vintage">
        <p class="com-capitular">
          <span class="capitular-letra">${esc(primeiraLetra)}</span>${esc(resto)}
        </p>
      </div>

      <div class="modal-separador">── ✥ ──</div>

      <div class="modal-autoria">
        ${aforismo.autor ? `<p>— ${esc(aforismo.autor).toUpperCase()}` : '<p>— ANÔNIMO'}
        ${aforismo.obra ? `, <em>${esc(aforismo.obra)}</em>` : ''}
        </p>
        ${aforismo.epoca ? `<p class="epoca">${esc(aforismo.epoca)}</p>` : ''}
      </div>

      ${aforismo.textoOriginal ? `
        <div class="modal-original">
          <p class="original-label"><em>Original:</em></p>
          <p>${esc(aforismo.textoOriginal)}</p>
        </div>
      ` : ''}

      ${aforismo.tags.length > 0 ? `
        <div class="modal-tags">
          ${aforismo.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
        </div>
      ` : ''}
    `;

    // Atualiza botão de favorito
    const btnFav = document.getElementById('btn-modal-favorito');
    if (btnFav) {
      btnFav.textContent = aforismo.favorito ? '★ Favorito' : '☆ Favoritar';
    }
  },
};
