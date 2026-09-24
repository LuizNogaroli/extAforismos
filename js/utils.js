/**
 * Utils — Funções auxiliares reutilizáveis
 *
 * Ver: docs/MANUAL_TECNICO.md §3.2
 */

/**
 * Escapa HTML para evitar XSS
 * Todo texto que vem do usuário passa por aqui antes de innerHTML
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valida e formata URL (só permite http/https)
 * @param {string} url
 * @returns {string|null}
 */
function safeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? url : null;
  } catch {
    return null;
  }
}

/**
 * Formata data para exibição
 * @param {string} isoString - ex: "2026-09-24T14:30:00Z"
 * @returns {string} - ex: "24/09/2026"
 */
function formatarData(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch {
    return '';
  }
}

/**
 * Formata data/hora para exibição
 * @param {string} isoString
 * @returns {string} - ex: "24 de set de 2026, 14:30"
 */
function formatarDataHora(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const opcoes = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('pt-BR', opcoes).format(date);
  } catch {
    return '';
  }
}

/**
 * Trunca texto a N caracteres + "..."
 * @param {string} texto
 * @param {number} maxLen
 * @returns {string}
 */
function truncar(texto, maxLen = 100) {
  if (!texto) return '';
  if (texto.length <= maxLen) return texto;
  return texto.substring(0, maxLen).trimEnd() + '…';
}

/**
 * Converte array de strings em string com delimitador
 * @param {Array} arr
 * @param {string} delimitador - padrão: ", "
 * @returns {string}
 */
function unir(arr, delimitador = ', ') {
  if (!Array.isArray(arr)) return '';
  return arr.filter(item => item).join(delimitador);
}

/**
 * Cria um elemento DOM com texto escapado
 * @param {string} tag - 'div', 'p', 'span', etc.
 * @param {string} texto - será escapado antes de adicionar
 * @param {Object} attrs - atributos { class, id, ...}
 * @returns {HTMLElement}
 */
function criarElemento(tag, texto = '', attrs = {}) {
  const el = document.createElement(tag);
  if (texto) el.textContent = texto;
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      el.className = value;
    } else if (key === 'id') {
      el.id = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

/**
 * Cria um botão padrão
 * @param {string} texto
 * @param {string} classe - 'primary', 'secondary', 'ghost', etc.
 * @param {Function} onclick - callback ao clicar
 * @returns {HTMLButtonElement}
 */
function criarBotao(texto, classe = 'primary', onclick = null) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.className = `btn ${classe}`;
  if (onclick) btn.onclick = onclick;
  return btn;
}

/**
 * Normaliza string para URL-safe (slug)
 * @param {string} str
 * @returns {string}
 */
function paraSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Deep clona um objeto (cópia profunda)
 * @param {*} obj
 * @returns {*}
 */
function clonarProfundo(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Aguarda um tempo em ms (para async/await)
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce para funções (útil para input em tempo real)
 * @param {Function} fn
 * @param {number} delay - ms
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timeout;
  return function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle para funções (executa no máximo a cada N ms)
 * @param {Function} fn
 * @param {number} limit - ms
 * @returns {Function}
 */
function throttle(fn, limit = 300) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Detecta modo escuro do sistema (prefers-color-scheme)
 * @returns {boolean}
 */
function modoEscuroDoSistema() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Aplica/remove classe no documento (para dark mode)
 * @param {string} nomeClasse
 * @param {boolean} ativar
 */
function aplicarClasseDocumento(nomeClasse, ativar = true) {
  if (ativar) {
    document.documentElement.classList.add(nomeClasse);
  } else {
    document.documentElement.classList.remove(nomeClasse);
  }
}
