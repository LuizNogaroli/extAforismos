/**
 * modalAforismoLeitura.js — Modal vintage de leitura com compartilhamento
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

    // Renderiza botões de compartilhamento
    this.renderizarCompartilhamento(aforismo);
  },

  renderizarCompartilhamento(aforismo) {
    const container = document.getElementById('compartilhar-botoes');
    if (!container) return;

    // Texto para compartilhar
    const texto = aforismo.texto.substring(0, 100) + (aforismo.texto.length > 100 ? '...' : '');
    const autoria = aforismo.autor ? `— ${aforismo.autor}` : '';
    const textoComAutoria = `"${texto}"\n\n${autoria}`;
    const url = window.location.href;

    // URLs de compartilhamento
    const links = [
      {
        nome: 'X',
        icon: '𝕏',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoComAutoria)}&url=${encodeURIComponent(url)}`,
        title: 'Compartilhar no X (Twitter)',
      },
      {
        nome: 'Facebook',
        icon: 'f',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(textoComAutoria)}`,
        title: 'Compartilhar no Facebook',
      },
      {
        nome: 'WhatsApp',
        icon: 'W',
        url: `https://wa.me/?text=${encodeURIComponent(textoComAutoria + '\n\n' + url)}`,
        title: 'Compartilhar no WhatsApp',
      },
      {
        nome: 'LinkedIn',
        icon: 'in',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        title: 'Compartilhar no LinkedIn',
      },
      {
        nome: 'Pinterest',
        icon: 'P',
        url: `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(textoComAutoria)}&url=${encodeURIComponent(url)}`,
        title: 'Compartilhar no Pinterest',
      },
      {
        nome: 'Email',
        icon: '✉️',
        url: `mailto:?subject=Aforismo&body=${encodeURIComponent(textoComAutoria + '\n\n' + url)}`,
        title: 'Compartilhar por Email',
      },
    ];

    container.innerHTML = links
      .map(
        link => `
          <a
            href="${link.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="compartilhar-btn"
            title="${link.title}"
          >
            ${link.icon}
          </a>
        `
      )
      .join('');
  },
};
