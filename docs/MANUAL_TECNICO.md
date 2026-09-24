# extAforismos — Manual Técnico

## 1. Arquitetura

### 1.1. Stack Técnico

```
Chrome Extension (Manifest V3)
├── index.html (single-page app)
├── js/
│   ├── app.js                    (inicialização + state machine + router)
│   ├── aforismoManager.js        (CRUD de aforismos)
│   ├── filtros.js                (lógica de filtros combinados)
│   ├── modalAforismoLeitura.js   (modal vintage de leitura + navegação)
│   ├── uiListagem.js             (renderização da listagem + paginação)
│   └── utils.js                  (escape, normalização, formatação)
├── css/
│   ├── index.css                 (um único arquivo, estilos globais)
│   └── (nenhum CSS-in-JS, nenhum módulo por componente)
├── fonts/
│   ├── EBGaramond.woff2          (listagem e interface)
│   ├── IMFellEnglish.woff2       (capitular e ornamentos no modal)
│   └── (fallback system para offline)
└── manifest.json                 (MV3, permissions)
```

**Decisão de design:** nenhum bundler, nenhum framework. Tudo roda direto no navegador. Modular por responsabilidade, não por componente React/Vue.

### 1.2. Fluxo de Dados

```
IndexedDB / localStorage (StorageService)
    ↑ ↓
AforismoManager (CRUD em memória durante a sessão)
    ↑ ↓
app.js (state machine, re-render)
    ↑ ↓
Filtros (seleciona subset de aforismos em memória)
    ↑ ↓
uiListagem.js (renderiza cards da listagem + paginação)
modalAforismoLeitura.js (renderiza modal ao clicar)
```

Tudo é síncrono em memória. Escrita em storage é async via `StorageService` e aguardada em `init()`.

### 1.3. Inicialização

```js
// app.js — ordem de inicialização
await StorageService.init();
await AforismoManager.init();  // carrega dados do storage
renderUI();                     // pinta a listagem + cabeçalho de filtros
attachEventListeners();         // cliques, navegação, etc.
```

Nenhuma tela renderiza antes de `AforismoManager.init()` terminar.

---

## 2. Paleta de Cores e Tipografia

### 2.1. CSS Custom Properties (`:root`)

```css
:root {
  --bg: #f4ecd8;                    /* papel creme, fundo da página */
  --surface: #faf7f1;               /* cards/modais, papel mais claro */
  --border: #d4cac0;                /* linhas finas e separadores */
  --border-dark: #8b7355;           /* moldura do modal, sépia forte */
  --text: #3b2f24;                  /* texto principal, sépia escuro */
  --text-muted: #6b5d50;            /* labels, data, metadata */
  --accent: #8b2e1f;                /* vermelho-tinta para ênfase (favoritos, highlights) */
  --accent-gold: #a67c2e;           /* dourado envelhecido para ornamentos */
  --accent-light: #d9a574;          /* sépia claro para backgrounds suavizados */
  
  /* Dark mode (automático via prefers-color-scheme) */
  --bg-dark: #2a231b;
  --surface-dark: #3a2f27;
  --text-dark: #e8ddd0;
  --text-muted-dark: #a89a8f;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: var(--bg-dark);
    --surface: var(--surface-dark);
    --text: var(--text-dark);
    --text-muted: var(--text-muted-dark);
    /* borders e accents permanecem, apenas ajustados se necessário */
  }
}
```

Nenhuma cor fixa em `#hex` fora deste bloco. Tudo referencia `var(--*)`.

### 2.2. Tipografia

| Uso | Fonte | Fallback | Localização |
|---|---|---|---|
| Textos gerais, cabeçalho de filtros, listagem | EB Garamond | `Georgia, serif` | `fonts/EBGaramond.woff2` |
| Capitular no modal, ornamentos | IM Fell English | `Georgia, serif` (sem drop cap) | `fonts/IMFellEnglish.woff2` |
| Código (se necessário) | Monospace sistema | `monospace` | — |

```css
@font-face {
  font-family: "EB Garamond";
  src: url("../fonts/EBGaramond.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "IM Fell English";
  src: url("../fonts/IMFellEnglish.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: "EB Garamond", Georgia, serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  background-color: var(--bg);
}
```

Tamanho base: 16px. Escalas de tipografia via `em` (relativos, não fixos em `px`).

---

## 3. Soluções Técnicas de Destaque

### 3.1. StorageService com Fallback Automático

Fonte: [`extDocumentacao/01-storage-e-persistencia.md`](../../extDocumentacao/01-storage-e-persistencia.md).

```js
class StorageService {
  async get(key, defaultValue) {
    // Tentativa 1: chrome.storage.local (extensão instalada)
    if (chrome?.storage?.local) {
      try {
        const result = await chrome.storage.local.get(key);
        if (key in result) return result[key];
      } catch (e) { /* falha silenciosa */ }
    }
    
    // Tentativa 2: localStorage (dev-server / navegador)
    if (typeof localStorage !== "undefined") {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) return JSON.parse(value);
      } catch (e) { /* falha silenciosa */ }
    }
    
    // Tentativa 3: memória (offline, nunca persiste)
    return defaultValue;
  }

  async set(key, value) {
    // mesma ordem de tentativa
    if (chrome?.storage?.local) {
      try {
        await chrome.storage.local.set({ [key]: value });
        return;
      } catch (e) { /* falha silenciosa */ }
    }
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return;
      } catch (e) { /* falha silenciosa */ }
    }
  }
}

const storageService = new StorageService(); // singleton
```

**Uso em qualquer manager:**

```js
class AforismoManager {
  constructor(storage = storageService) {
    this.storage = storage;
    this.aforismos = [];
  }

  async init() {
    this.aforismos = await this.storage.get("aforismos_data", []);
  }

  async save() {
    await this.storage.set("aforismos_data", this.aforismos);
  }
}
```

**Testes:** passar um mock de storage:
```js
const mockStorage = { 
  get: async (k, def) => def, 
  set: async () => {} 
};
const manager = new AforismoManager(mockStorage);
```

### 3.2. Escape de HTML (Prevenção de XSS)

Toda string que vem do usuário passa por `esc()` antes de `innerHTML`.

```js
function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Uso:
const titulo = document.createElement("h2");
titulo.innerHTML = esc(aforismo.texto); // seguro
```

URLs só viram link se forem `http://` ou `https://`:

```js
function safeUrl(input) {
  try {
    const url = new URL(input);
    return (url.protocol === "http:" || url.protocol === "https:") ? input : null;
  } catch {
    return null;
  }
}
```

### 3.3. Normalização de Tags

Tags são criadas com autocompletar, mas precisam ser normalizadas (sem maiúsculas diferentes virar tags diferentes):

```js
function normalizarTag(tag) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");  // espaços viram hífens
}

// Uso em AforismoManager:
AdicionarTag(aforismoId, tag) {
  const normalizado = normalizarTag(tag);
  if (!this.aforismos[aforismoId].tags.includes(normalizado)) {
    this.aforismos[aforismoId].tags.push(normalizado);
  }
}
```

### 3.4. Filtros Combinados (E Lógico)

Os filtros devem se combinar: se escolher categoria + 2 tags (qualquer uma), só mostra aforismos que têm a categoria E (qualquer uma das 2 tags).

```js
class Filtros {
  constructor() {
    this.busca = "";          // substring (ignora acentos)
    this.categoria = null;    // string ou null
    this.tags = [];           // array de tags (OR entre elas se "qualquer uma")
    this.tagsLogica = "any";  // "all" = AND, "any" = OR
    this.autor = null;
    this.periodoAno = [null, null]; // [min, max]
    this.favoritos = false;
    this.ordem = "recentes";  // "recentes", "autor", "cronologico", "aleatorio"
    this.paginaAtual = 1;
    this.itensPorPagina = 10;
  }

  aplicar(aforismos) {
    let resultado = aforismos;

    // Filtro: busca textual (ignora acentos)
    if (this.busca) {
      const buscaNorm = this.busca.toLowerCase().replace(/[àáâãäèéêëìíîïòóôõöùúûü]/g, "...");
      resultado = resultado.filter(a => {
        const textoNorm = (a.texto + a.autor + a.obra + a.notas || "")
          .toLowerCase()
          .replace(/[àáâãäèéêëìíîïòóôõöùúûü]/g, "..");
        return textoNorm.includes(buscaNorm);
      });
    }

    // Filtro: categoria
    if (this.categoria !== null) {
      resultado = resultado.filter(a => a.categoriaId === this.categoria);
    }

    // Filtro: tags (AND ou OR)
    if (this.tags.length > 0) {
      resultado = resultado.filter(a => {
        const match = this.tags.map(t => a.tags.includes(t));
        return this.tagsLogica === "all" 
          ? match.every(m => m)  // todas as tags
          : match.some(m => m);   // qualquer tag
      });
    }

    // Filtro: autor
    if (this.autor !== null) {
      resultado = resultado.filter(a => a.autor === this.autor);
    }

    // Filtro: época (anoReferencia entre min e max)
    if (this.periodoAno[0] !== null || this.periodoAno[1] !== null) {
      const [min, max] = this.periodoAno;
      resultado = resultado.filter(a => {
        if (a.anoReferencia === null) return false;
        if (min !== null && a.anoReferencia < min) return false;
        if (max !== null && a.anoReferencia > max) return false;
        return true;
      });
    }

    // Filtro: favoritos
    if (this.favoritos) {
      resultado = resultado.filter(a => a.favorito === true);
    }

    // Ordenação
    switch (this.ordem) {
      case "recentes":
        resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "autor":
        resultado.sort((a, b) => (a.autor || "Anônimo").localeCompare(b.autor || "Anônimo"));
        break;
      case "cronologico":
        resultado.sort((a, b) => (a.anoReferencia ?? 9999) - (b.anoReferencia ?? 9999));
        break;
      case "aleatorio":
        resultado.sort(() => Math.random() - 0.5);
        break;
    }

    // Paginação
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return {
      total: resultado.length,
      items: resultado.slice(inicio, fim),
      paginaAtual: this.paginaAtual,
      itensPorPagina: this.itensPorPagina,
      paginas: Math.ceil(resultado.length / this.itensPorPagina),
    };
  }
}
```

### 3.5. Modal Padrão (Backdrop + Stoppage)

Estrutura copiada de `extListaDeCompras`, usada tanto para leitura quanto para cadastro:

```html
<div id="modal-leitura" class="modal-backdrop" onclick="if (event.target === this) fecharModal(this)">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="modal-header">
      <h2>Título do Modal</h2>
      <button onclick="fecharModal(this.closest('.modal-backdrop'))">✕</button>
    </div>
    <div class="modal-content">
      <!-- conteúdo -->
    </div>
    <div class="modal-footer">
      <!-- ações -->
    </div>
  </div>
</div>
```

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(40, 28, 16, 0.6);  /* sépia semi-transparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background-color: var(--surface);
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid var(--border-dark);
  outline: 1px solid var(--border);
  outline-offset: 2px;
  padding: 32px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .modal-backdrop,
  .modal {
    animation: none;
  }
}
```

### 3.6. Seed de Categorias e Coleção de Exemplo

Ao iniciar a extensão pela primeira vez (nenhum dado no storage), o `AforismoManager.init()` popula automaticamente:

**Seed de Categorias (8 sugestões iniciais):**
- Moral, Política, Amor, Conhecimento, Estoicismo, Morte, Tempo, Virtude

Cada categoria tem `id`, `nome`, `createdAt`. O usuário pode editá-las ou deletá-las depois.

**Coleção de Exemplo (~10 aforismos de domínio público):**
- Autores sugeridos: Sêneca, Marcus Aurelius, Montaigne, Epicteto, Pascal, La Rochefoucauld, Nietzsche, Heráclito
- Cada aforismo atribuído a múltiplas categorias (2-3) e vários tags
- Demonstrates filtros, navegação e modal vintage

**Flag de migração:**
Se o schema mudar novamente, usar `aforismos_migrado_v2` (boolean no storage). Semelhante ao padrão em `extTotalPlanner`. Exempli gratia:

```js
async init() {
  const migrado = await this.storage.get("aforismos_migrado_v2", false);
  
  if (!migrado) {
    // Migração do schema v1 (categoriaId) para v2 (categoriaIds)
    const dados = await this.storage.get("aforismos_data", null);
    if (dados) {
      dados.forEach(a => {
        if (a.categoriaId !== undefined) {
          a.categoriaIds = a.categoriaId ? [a.categoriaId] : [];
          delete a.categoriaId;
        }
      });
      await this.storage.set("aforismos_data", dados);
    }
    await this.storage.set("aforismos_migrado_v2", true);
  }
}
```

### 3.7. Capitular (Drop Cap) no Modal de Leitura

```css
.aforismo-texto::first-letter {
  font-family: "IM Fell English", Georgia, serif;
  font-size: 3.2em;
  font-weight: bold;
  color: var(--accent);
  float: left;
  line-height: 1;
  padding-right: 0.1em;
  margin-top: -0.05em;
}
```

Não funciona se o texto começar com aspas — nesse caso, remover as aspas do `:first-letter` é complexo em CSS puro. Solução: detectar aspas ao renderizar e usar uma `<span>` para a primeira letra legítima.

---

## 4. Modelo de Dados

### 4.1. Mapa de Chaves de Armazenamento

| Chave | Tipo | Conteúdo | Nota |
|---|---|---|---|
| `aforismos_data` | Array | Lista de objetos aforismo | Todos os aforismos salvos. |
| `aforismos_categorias` | Array | Lista de objetos categoria | Categorias disponíveis. |
| `filtros_estado` | Object | Estado atual dos filtros | Recupera ao abrir (busca, categoria, tags, página). |
| `preferencias_ui` | Object | Preferências de interface | `itensPorPagina`, `temaDarkMode` (se não usar `prefers-color-scheme`). |

### 4.2. Schema de Aforismo

```js
{
  id: "uuid-v4-ou-string-única",
  texto: "Não é porque as coisas são difíceis...",  // obrigatório
  autor: "Sêneca" || null,  // null = "Anônimo"
  obra: "Cartas a Lucílio" || null,
  epoca: "c. 65 d.C." || null,  // texto de exibição
  anoReferencia: 65 || null,  // negativo = a.C., para ordenar/filtrar
  idiomaOriginal: "latim" || null,
  textoOriginal: "Non quia difficilia sunt…" || null,
  categoriaIds: ["uuid-cat1", "uuid-cat2"],  // MÚLTIPLAS (pode estar vazio)
  tags: ["coragem", "ação"],  // normalizadas (minúsculas)
  favorito: false,
  notas: "Reflexão pessoal do usuário",  // opcional
  createdAt: "2026-09-24T14:30:00Z",
  updatedAt: "2026-09-24T14:30:00Z",
}
```

### 4.3. Schema de Categoria

```js
{
  id: "uuid-v4",
  nome: "Moral",
  createdAt: "2026-09-24T10:00:00Z",
}
```

---

## 5. Estrutura de Arquivos

```
extAforismos/
├── index.html                    (SPA única)
├── CLAUDE.md                     (este arquivo)
├── manifest.json                 (MV3)
├── js/
│   ├── app.js                    (init + state machine)
│   ├── aforismoManager.js        (CRUD)
│   ├── filtros.js                (classe Filtros)
│   ├── modalAforismoLeitura.js   (renderização + navegação)
│   ├── uiListagem.js             (cards + paginação)
│   ├── uiCadastro.js             (formulário de novo/editar)
│   ├── uiCategorias.js           (CRUD de categorias)
│   └── utils.js                  (esc, normalizar, datas, etc.)
├── css/
│   └── index.css                 (único arquivo)
├── fonts/
│   ├── EBGaramond.woff2
│   └── IMFellEnglish.woff2
└── docs/
    ├── MANUAL_TECNICO.md         (este arquivo)
    ├── Sobre_extAforismos.md     (visão + conceitos)
    ├── pendencias.md             (bugs, ideias, em aberto)
    ├── UX_LAYOUT.md              (quando surgir discussão de design)
    └── historico/
        ├── <mudança>_<data>.md   (uma arquivo por mudança)
        └── …
```

---

## 6. Histórico de Versões

| Versão | Data | Autor | O Quê |
|---|---|---|---|
| 0.0.2 | 2026-09-24 | Claude Haiku 4.5 + Usuário | **Decisões do projeto:** página inteira, categorias múltiplas, seed de 8 categorias iniciais, coleção de ~10 aforismos de exemplo pré-carregados. Schema atualizado: `categoriaId` → `categoriaIds: []`. Arquivo `docs/historico/decisoes_projeto_20260924_0000.md` + seção 3.6 do MANUAL com seed/migração. |
| 0.0.1 | 2026-09-24 | Claude Haiku 4.5 | Documentação inicial: visão, CLAUDE.md, MANUAL_TECNICO.md, README.md, pendencias.md. Nenhum código implementado. |

---

## Notas de Desenvolvimento

- **Dark mode:** automático via `prefers-color-scheme: dark` em CSS. Nenhuma lógica JS necessária.
- **Impressão:** `@media print { … }` para as versões A5/A6 do modal (pós-MVP).
- **Responsividade:** começar mobile-first. Breakpoint principal: 768px (tablet e acima).
- **Teste offline:** abrir `index.html` direto no navegador com um servidor local HTTP simples (para CORS se houver).
- **Sem `npm install`:** tudo funciona com arquivos estáticos. Se precisar de tooling depois, adicionar Vite/Rollup.
