# Decisões do Projeto — 2026-09-24 00:00

## O Que Foi Decidido

As 4 decisões em aberto da §9 de `Sobre_extAforismos.md` foram resolvidas pelo usuário:

| # | Decisão | Escolha | Impacto |
|---|---|---|---|
| 1 | **Onde abre** | **Página inteira** | Mais espaço para filtros e listagem. O ícone da extensão dispara a abertura de uma aba nova com a página completa do app. |
| 2 | **Categorias** | **Múltiplas** (não uma só) | Cada aforismo pode ter 0 ou mais categorias. A navegação/filtro por categoria muda: checkboxes múltiplas ao invés de select único. O schema de dados muda: `categoriaId` vira `categoriaIds: []`. |
| 3 | **Seed de categorias** | **Sim, com sugestões** | Ao criar a extensão, popular com categorias sugeridas (ex.: Moral, Política, Amor, Conhecimento, Estoicismo, Morte, Tempo, Virtude). Usuário pode editar/deletar depois. Reduz atrito no primeiro uso. |
| 4 | **Coleção de exemplo** | **Sim** | Pré-carregar ~10 aforismos de domínio público (Sêneca, Marcus Aurelius, Montaigne, etc.) para demonstrar filtros e navegação no modal. Usuário pode deletar todos e começar do zero se quiser. |

## Impacto na Implementação

### Schema de Dados Atualizado

**Antes (múltiplas categorias):**
```js
{
  id: "uuid",
  texto: "...",
  autor: "...",
  categoriaId: "uuid-categoria" || null,  // UMA categoria
  tags: ["tag1", "tag2"],
  // ...
}
```

**Depois (múltiplas categorias):**
```js
{
  id: "uuid",
  texto: "...",
  autor: "...",
  categoriaIds: ["uuid-cat1", "uuid-cat2"],  // MÚLTIPLAS (pode estar vazio)
  tags: ["tag1", "tag2"],
  // ...
}
```

**Mudança de filtro:**
- Filtro de categoria muda de **select único** (radio/select) para **checkboxes múltiplas** (OR: qualquer uma das categorias escolhidas).
- A UI do filtro ganha uma seção para categorias com pills, como as tags.

### Seed de Categorias Iniciais (v1.0)

Ao iniciar a extensão pela primeira vez (sem dados no storage), popular automaticamente:

```js
const seedCategorias = [
  { id: "cat-moral", nome: "Moral" },
  { id: "cat-politica", nome: "Política" },
  { id: "cat-amor", nome: "Amor" },
  { id: "cat-conhecimento", nome: "Conhecimento" },
  { id: "cat-estoicismo", nome: "Estoicismo" },
  { id: "cat-morte", nome: "Morte" },
  { id: "cat-tempo", nome: "Tempo" },
  { id: "cat-virtude", nome: "Virtude" },
];

const seedAforismos = [
  // ~10 aforismos de domínio público, cada um com múltiplas categorias
  {
    id: "afor-1",
    texto: "Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que elas são difíceis.",
    autor: "Sêneca",
    obra: "Cartas a Lucílio",
    epoca: "c. 65 d.C.",
    anoReferencia: 65,
    categoriaIds: ["cat-estoicismo", "cat-acao"], // MÚLTIPLAS!
    tags: ["coragem", "ação", "superacao"],
    favorito: false,
    notas: "",
    createdAt: "2026-09-24T00:00:00Z",
    updatedAt: "2026-09-24T00:00:00Z",
  },
  // ... mais aforismos
];
```

**Lógica em `AforismoManager.init()`:**
```js
async init() {
  let data = await this.storage.get("aforismos_data", null);
  let categories = await this.storage.get("aforismos_categorias", null);

  if (data === null) {
    // Primeira vez: carregar seed
    this.aforismos = JSON.parse(JSON.stringify(seedAforismos)); // deep copy
    this.categorias = JSON.parse(JSON.stringify(seedCategorias));
    await this.save();
  } else {
    this.aforismos = data;
    this.categorias = categories || [];
  }
}
```

**Flag de migração (para futuro):** se mudarmos o schema novamente, usar `aforismos_migrado_v2` (semelhante ao padrão usado em `extTotalPlanner`).

### Mudanças na Listagem

**Cards da listagem agora mostram múltiplas categorias:**

```
[Capitular]  [Sêneca · Cartas · c. 65 d.C.]  [Estoicismo, Ação]
             ["Não é porque as..."]            [✎ Editar · ★ Favorito]
             [#coragem #ação #superacao]
```

Ou com pills de categoria (igual aos selos de tags):

```
[Capitular]  [Sêneca · Cartas · c. 65 d.C.]  [🏷 Estoicismo  🏷 Ação]
             ["Não é porque as..."]            [❦ Ler]
             [#coragem #ação #superacao]
```

### Mudanças nos Filtros

**Cabeçalho de filtros:** adicionar uma seção de categorias com checkboxes (como tags):

```
┌─────────────────────────────────────────┐
│ 🔍 Busca: [_________]                   │
├─────────────────────────────────────────┤
│ Categorias:  ☐ Moral  ☐ Política  ☐... │
│ Tags:        ☐ coragem  ☐ virtude  ... │
│ Autor:       [dropdown]                  │
│ Época:       [intervalo de anos]        │
│ Favoritos:   ☐                          │
│ Ordenar:     [recentes ▼]               │
└─────────────────────────────────────────┘
```

**Lógica em `Filtros.aplicar()`:** adicionar validação de categorias (OR: qualquer uma das selecionadas).

### Coleção de Exemplo

**~10 aforismos de domínio público** com categorias múltiplas. Sugestão de autores:

- **Sêneca** (c. 4 a.C. – 65 d.C.) — filósofo estoico romano
- **Marcus Aurelius** (121–180 d.C.) — imperador romano, estoico
- **Montaigne** (1533–1592) — ensaísta francês, humanista
- **Epicteto** (c. 50–135 d.C.) — filósofo estoico grego
- **Pascal** (1623–1662) — matemático e filósofo francês
- **La Rochefoucauld** (1613–1680) — moralista francês
- **Nietzsche** (1844–1900) — filósofo alemão
- **Heráclito** (c. 535–475 a.C.) — filósofo pré-socrático

Cada aforismo atribuído a pelo menos 2 categorias (ex.: Sêneca → Estoicismo + Ação + Morte).

## Impacto na Documentação

Atualizar:
- `docs/Sobre_extAforismos.md` §9 — marcar decisões como resolvidas ✅
- `docs/MANUAL_TECNICO.md` §4.2 — schema com `categoriaIds` em vez de `categoriaId`
- `docs/pendencias.md` §1 — remover as 4 decisões (agora resolvidas)
- `README.md` — refletir as decisões tomadas

## Próximos Passos

1. ✅ Atualizar documentação com as decisões
2. Implementar `index.html` base
3. Implementar `js/app.js` (state machine)
4. Implementar `StorageService` com seed
5. Implementar `AforismoManager` com schema atualizado
6. Implementar `Filtros` com validação de múltiplas categorias
7. Implementar `uiListagem.js` com cards + paginação
8. Implementar modal vintage com `modalAforismoLeitura.js`

---

**Estado Anterior:** 4 decisões em aberto.
**Estado Novo:** Todas resolvidas. Schema de dados atualizado. Seed e exemplo pré-carregado.
**Rollback:** Se precisar voltar para categorias únicas, alterar `categoriaIds: []` para `categoriaId: null` e remover checkboxes de categoria do filtro.
