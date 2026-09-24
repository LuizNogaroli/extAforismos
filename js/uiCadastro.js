/**
 * uiCadastro.js — Formulário de novo/editar aforismo
 */

const uiCadastro = {
  renderizar(aforismoParaEditar, manager) {
    const form = document.getElementById('form-aforismo');
    const titulo = document.getElementById('novo-titulo');

    if (aforismoParaEditar) {
      titulo.textContent = 'Editar Aforismo';
      this.preencherFormulario(aforismoParaEditar, manager);
    } else {
      titulo.textContent = 'Novo Aforismo';
      form.reset();
    }

    // Renderiza checkboxes de categorias
    this.renderizarCheckboxesCategorias(aforismoParaEditar, manager);

    // Listener no formulário
    form.onsubmit = (e) => {
      e.preventDefault();
      this.salvarAforismos(aforismoParaEditar, manager);
    };
  },

  preencherFormulario(aforismo, manager) {
    document.getElementById('form-texto').value = aforismo.texto;
    document.getElementById('form-autor').value = aforismo.autor || '';
    document.getElementById('form-obra').value = aforismo.obra || '';
    document.getElementById('form-epoca').value = aforismo.epoca || '';
    document.getElementById('form-ano').value = aforismo.anoReferencia || '';
    document.getElementById('form-idioma').value = aforismo.idiomaOriginal || '';
    document.getElementById('form-texto-original').value = aforismo.textoOriginal || '';
    document.getElementById('form-tags').value = aforismo.tags.join(', ');
    document.getElementById('form-notas').value = aforismo.notas || '';
    document.getElementById('form-favorito').checked = aforismo.favorito;
  },

  renderizarCheckboxesCategorias(aforismo, manager) {
    const container = document.getElementById('form-categorias');
    container.innerHTML = '';

    manager.categorias.forEach(cat => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = cat.id;
      input.checked = aforismo ? aforismo.categoriaIds.includes(cat.id) : false;

      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${cat.nome}`));
      container.appendChild(label);
    });
  },

  salvarAforismos(aforismoExistente, manager) {
    const dados = {
      texto: document.getElementById('form-texto').value.trim(),
      autor: document.getElementById('form-autor').value.trim() || null,
      obra: document.getElementById('form-obra').value.trim() || null,
      epoca: document.getElementById('form-epoca').value.trim() || null,
      anoReferencia: parseInt(document.getElementById('form-ano').value) || null,
      idiomaOriginal: document.getElementById('form-idioma').value.trim() || null,
      textoOriginal: document.getElementById('form-texto-original').value.trim() || null,
      categoriaIds: Array.from(document.querySelectorAll('#form-categorias input:checked')).map(
        input => input.value
      ),
      tags: document.getElementById('form-tags').value,
      notas: document.getElementById('form-notas').value.trim() || '',
      favorito: document.getElementById('form-favorito').checked,
    };

    if (!dados.texto) {
      alert('O texto do aforismo é obrigatório.');
      return;
    }

    if (aforismoExistente) {
      manager.atualizarAforismos(aforismoExistente.id, dados);
      alert('Aforismo atualizado!');
    } else {
      manager.criarAforismos(dados);
      alert('Aforismo criado!');
    }

    app.navigate('listagem');
  },
};
