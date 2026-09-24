/**
 * uiCategorias.js — Gerenciar categorias
 */

const uiCategorias = {
  renderizar(manager) {
    const container = document.getElementById('categorias-container');
    if (!container) return;

    container.innerHTML = '';

    if (manager.categorias.length === 0) {
      container.innerHTML = '<p>Nenhuma categoria criada ainda.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'categorias-list';

    manager.categorias.forEach(cat => {
      const li = document.createElement('li');
      li.className = 'categoria-item';

      const nome = document.createElement('span');
      nome.className = 'categoria-nome';
      nome.textContent = cat.nome;

      const btnRenomear = document.createElement('button');
      btnRenomear.className = 'btn ghost';
      btnRenomear.textContent = '✎';
      btnRenomear.onclick = () => this.renomear(cat.id, manager);

      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn ghost danger';
      btnExcluir.textContent = '🗑️';
      btnExcluir.onclick = () => this.excluir(cat.id, manager);

      li.appendChild(nome);
      li.appendChild(btnRenomear);
      li.appendChild(btnExcluir);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  },

  renomear(id, manager) {
    const cat = manager.obterCategoriaId(id);
    if (!cat) return;

    const novoNome = prompt('Novo nome:', cat.nome);
    if (novoNome && novoNome.trim()) {
      manager.renomearCategoria(id, novoNome.trim());
      this.renderizar(manager);
    }
  },

  excluir(id, manager) {
    const cat = manager.obterCategoriaId(id);
    if (!cat) return;

    if (confirm(`Excluir categoria "${cat.nome}"? Os aforismos perderão essa categoria.`)) {
      manager.deletarCategoria(id);
      this.renderizar(manager);
    }
  },
};

// Setup do botão "Nova Categoria"
document.addEventListener('DOMContentLoaded', () => {
  const btnNovaCategoria = document.getElementById('btn-nova-categoria');
  if (btnNovaCategoria) {
    btnNovaCategoria.onclick = () => {
      const nome = prompt('Nome da nova categoria:');
      if (nome && nome.trim()) {
        aforismoManager.criarCategoria(nome.trim());
        uiCategorias.renderizar(aforismoManager);
      }
    };
  }
});
