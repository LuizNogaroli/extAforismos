# extAforismos — Visão, Conceito e Diretrizes

O **extAforismos** faz parte da coleção de extensões do Chrome para problemas cotidianos (ao lado de `extTotalPlanner`, `extListaDeCompras`, `extGestorDeOrcamento`, entre outros). Este documento descreve a ideia do projeto, antes de qualquer código. É o ponto de partida para o planejamento técnico.

> **Status (2026-09-23):** só a concepção. Nada foi implementado.

---

## 1. Propósito

Um **caderno pessoal de aforismos**. O usuário guarda frases curtas e densas de autores, obras e épocas diferentes, organiza por **categoria** e **tags**, e depois as encontra com **filtros** combináveis.

O conteúdo é literário, e isso orienta o visual. A listagem é funcional, mas o **momento de leitura** (o modal) deve parecer uma página de um livro antigo, e não um formulário.

Três pilares:

1. **Cadastro:** registrar o aforismo com autor, obra, época e contexto.
2. **Organização:** uma categoria por aforismo (eixo principal) e quantas tags o usuário quiser (eixos livres).
3. **Reencontro:** listagem com cabeçalho de filtros e leitura em modal de estilo vintage.

---

## 2. Conceitos do domínio

| Conceito | Definição | Regra |
|---|---|---|
| **Aforismo** | Frase ou trecho curto, atribuído a um autor. | Só o **texto** é obrigatório. Autor ausente aparece como "Anônimo". |
| **Categoria** | Eixo temático principal (ex.: *Moral*, *Política*, *Amor*, *Morte*, *Conhecimento*, *Estoicismo*). | **Múltiplas por aforismo** (0 a N). CRUD próprio. Excluir uma categoria remove ela de todos os aforismos, deixando-os com as categorias restantes — nenhum aforismo é apagado. Ao usar a extensão pela primeira vez, vem com 8 categorias pré-sugeridas (seed), editáveis pelo usuário. |
| **Tag** | Rótulo livre e transversal (ex.: `tempo`, `virtude`, `ironia`, `sêneca-cartas`). | Várias por aforismo. São criadas ao digitar, com autocompletar das já existentes. São normalizadas (minúsculas, sem espaços nas pontas) para que `Tempo` e `tempo` não virem duas tags diferentes. |
| **Autor** | Quem escreveu ou disse. | Texto livre com autocompletar. Não é uma entidade separada no MVP. |
| **Obra / Fonte** | Livro, carta, discurso ou "tradição oral". | Opcional. |
| **Época** | Ano ou século da obra (ex.: `c. 65 d.C.`, `séc. XVII`, `1886`). | Texto de exibição mais um **ano numérico opcional** para ordenar e filtrar por período. |

### 2.1. Modelo de dados (rascunho)

```js
aforismos = [{
  id, texto,
  autor, obra, epoca, anoReferencia,   // anoReferencia: número (negativo = a.C.), opcional
  idiomaOriginal, textoOriginal,        // opcional: ex. latim + tradução em `texto`
  categoriaIds: [],                     // MÚLTIPLAS (0 a N), pode estar vazio
  tags: ['tempo', 'virtude'],
  favorito: false,
  notas,                                // reflexão pessoal do usuário
  createdAt, updatedAt
}]

aforismos_categorias = [{ id, nome, createdAt }]
```

A persistência usa `StorageService` com fallback (`chrome.storage.local` → `localStorage` → memória), conforme `extDocumentacao/01-storage-e-persistencia.md`.

---

## 3. Listagem

### 3.1. Inspiração: a "cortina" de marketplaces

A estrutura de cada linha vem do resultado de busca por marketplace do `extListaDeCompras` (`docs/frontend-layout.md`, seção 5), reproduzido na Lista de Compras do `extTotalPlanner`. Lá, cada oferta é uma linha horizontal com três colunas:

```
[thumb]  [marketplace + avaliação, título, descrição, badges]  [preço + "Ver oferta"]
```

No extAforismos, a mesma anatomia ganha conteúdo literário:

```
[capitular]  [autor · obra · época            ]  [categoria]
             [“Trecho do aforismo em itálico,… ”]  [ ❦ Ler   ]
             [selos de tags: #tempo #virtude   ]
```

| Coluna da cortina | Equivalente no extAforismos |
|---|---|
| Thumb 44×44 com a inicial do marketplace | **Capitular:** a inicial do autor numa moldura ornamentada, com a cor da categoria |
| Marketplace + avaliação | **Autor · obra · época**, com o autor em versalete |
| Título + descrição | **Trecho do aforismo** em itálico, truncado em 2 ou 3 linhas |
| Badges (frete grátis, cashback) | **Selos de tags**, parecidos com carimbos ou etiquetas de biblioteca |
| Preço + "Ver oferta" | **Categoria** + ação "Ler" (abre o modal) e ☆ favorito |

A linha inteira pode ser clicada para abrir o modal. "Ler" é o alvo explícito.

### 3.2. Estética da listagem

Vintage, mas legível. Referência: ficha de catálogo de biblioteca ou página de índice de um livro antigo.

- Fundo creme ou papel (`#f4ecd8`), texto sépia escuro (`#3b2f24`) e detalhes em vermelho-tinta (`#8b2e1f`) ou dourado envelhecido (`#a67c2e`).
- Divisores finos com fleurons (❦ ❧ ✥) no lugar de bordas de card chapadas.
- Serifada em tudo. A listagem pode usar uma serifada de texto mais sóbria que a do modal (ver §5).

---

## 4. Cabeçalho de filtros

Os filtros são o centro da listagem. O cabeçalho fica fixo no topo, acima da lista, e todos os filtros se **combinam** (E lógico entre filtros diferentes).

| Filtro | Controle | Observação |
|---|---|---|
| **Busca textual** | Campo de texto | Procura no texto, no autor, na obra e nas notas. Ignora acentos e maiúsculas (`virtude` encontra `Virtude`, `coracao` encontra `coração`). |
| **Categoria** | Pills de seleção múltipla | Inclui "Sem categoria". |
| **Tags** | Pills com autocompletar e seleção múltipla | Interruptor **"todas / qualquer uma"** (E/OU) entre as tags escolhidas. |
| **Autor** | Select com autocompletar | Lista os autores já cadastrados, com contagem (`Sêneca (12)`). |
| **Época** | Intervalo de anos ou atalhos por período | Atalhos sugeridos: Antiguidade, Medieval, Renascimento, Moderno, Contemporâneo. Usa `anoReferencia`. |
| **Favoritos** | Pill liga/desliga | ☆ / ★ |
| **Ordenar por** | Select | Mais recentes, Autor (A–Z), Cronológico (época), Aleatório. |

Comportamento:

- **Filtros ativos em chips** abaixo do cabeçalho, cada um com ✕, e um "Limpar filtros" geral.
- **Contador** de resultados (`42 aforismos · 7 com os filtros atuais`).
- **Paginação** igual à da cortina: itens por página (10/20/50) mais "‹ Anterior / Página X de Y / Próxima ›".
- **Estado vazio** com texto sóbrio: *"Nenhum aforismo encontrado com esses filtros."*
- Os filtros ficam guardados (como preferência de interface), então a listagem reabre como foi deixada.
- A ordem de aplicação segue a da cortina: filtrar → ordenar → paginar.

---

## 5. Modal de leitura (vintage)

Ao clicar num aforismo, abre um modal que imita **uma página impressa antiga**. É a parte mais importante da identidade visual do projeto.

### 5.1. Composição

```
┌──────────────────────────────────────────┐
│  ╔════════════════════════════════════╗  │  ← moldura dupla fina (sépia)
│  ║             ❦  MORAL  ❦            ║  │  ← categoria em versalete espaçado
│  ║                                    ║  │
│  ║   N ão é porque as coisas são      ║  │  ← capitular (drop cap) na 1ª letra
│  ║     difíceis que não ousamos;      ║  │
│  ║     é porque não ousamos que       ║  │  ← texto grande, serifado, centrado
│  ║     elas são difíceis.             ║  │     ou justificado
│  ║                                    ║  │
│  ║             ── ✥ ──                ║  │  ← fleuron separador
│  ║                                    ║  │
│  ║       — SÊNECA, Cartas a Lucílio   ║  │  ← autor em versalete, obra em itálico
│  ║                c. 65 d.C.          ║  │
│  ║                                    ║  │
│  ║   Non quia difficilia sunt…        ║  │  ← texto original (se houver), menor
│  ║                                    ║  │
│  ║   #coragem  #ação                  ║  │  ← tags como carimbos discretos
│  ╚════════════════════════════════════╝  │
│   ‹ anterior   ★  ✎ editar  ⧉ copiar   próximo ›   │
└──────────────────────────────────────────┘
```

### 5.2. Diretrizes de estilo

- **Papel envelhecido** feito só com CSS: fundo creme com `radial-gradient` escurecendo as bordas (vinheta) e textura sutil, sem imagens externas.
- **Moldura** dupla fina (`border` + `outline` com `outline-offset`) em sépia, com ornamentos nos cantos (✥ ou ❦) posicionados em `::before`/`::after`.
- **Capitular** via `::first-letter`: 3 a 4 linhas de altura, em vermelho-tinta ou dourado, fonte decorativa.
- **Autor em versalete** (`font-variant: small-caps; letter-spacing`), obra em *itálico*, precedidos de travessão (—).
- **Aspas tipográficas** (“ ” ou « ») e travessões reais, nunca `"` ou `-` retos.
- **Backdrop** escuro e quente (`rgba(40, 28, 16, .6)`) no lugar do cinza-azulado padrão.
- **Animação de abertura** curta e discreta (fade com leve escala), com respeito a `prefers-reduced-motion`.
- Ações (favoritar, editar, copiar, navegar) ficam **fora da "página"**, discretas, para não quebrar a ilusão do livro.
- Teclado: `Esc` fecha, `←`/`→` navegam dentro da lista **já filtrada**.
- A estrutura segue o padrão de modal dos projetos irmãos (`modal-backdrop` + `modal` + `stopPropagation`, `extListaDeCompras/docs/frontend-layout.md` §3).

### 5.3. Tipografia (sugestão)

Fontes históricas e livres (licença SIL OFL), **empacotadas dentro da extensão** (`.woff2` locais). Assim a extensão funciona offline e não depende da CSP para carregar fontes da rede.

| Uso | Fonte sugerida | Por quê |
|---|---|---|
| Texto do aforismo no modal | **EB Garamond** ou **Cormorant Garamond** | Garamond clássica, de livro dos séculos XVI e XVII |
| Capitular e ornamentos | **IM Fell English** ou **UnifrakturMaguntia** (com moderação) | Reproduz tipos de impressão antiga |
| Listagem e interface | **EB Garamond** ou **Libre Baskerville** | Serifada legível em tamanho pequeno |
| Fallback | `Georgia, "Times New Roman", serif` | Disponível em qualquer sistema |

---

## 6. Cadastro

- Formulário em modal "comum" (limpo, mas coerente com a paleta creme e sépia), separado do modal de leitura.
- Campos: texto (textarea grande), autor (autocompletar), obra, época + ano de referência, categoria (select + "nova categoria"), tags (campo de chips com autocompletar), texto original e idioma (seção recolhível "Original"), notas pessoais, favorito.
- Gerenciador de categorias em modal próprio: criar, renomear no lugar e excluir, como o `CategoryManager` da Lista de Compras.
- Todo texto do usuário passa por escape antes de ir para `innerHTML` (mesma regra do `extTotalPlanner`, §3 do `MANUAL_TECNICO.md`).

---

## 7. Diretrizes técnicas herdadas da coleção

Antes de implementar, ler `extDocumentacao/` (base de conhecimento compartilhada), em especial:

- `01-storage-e-persistencia.md`: `StorageService` único com injeção de dependência.
- `02-service-worker-mv3.md`: Manifest V3.
- `06-arquitetura-vanilla-js-sem-bundler.md`: Vanilla JS, sem bundler.
- `07-governanca-de-documentacao.md`: projeto pequeno → **Padrão B** (`CLAUDE.md` + `MANUAL_TECNICO.md` vivo + `historico/`).
- `08-git-desde-o-inicio.md`: repositório git desde o primeiro commit.

Interface em **pt-BR**. Ícones por emoji ou caracteres tipográficos (❦ ✥ ❧ ★ ☆), sem bibliotecas externas.

---

## 8. Ideias para depois (fora do MVP)

- **Aforismo do dia** na nova aba ou numa notificação diária.
- **Importar e exportar** (JSON e CSV) para backup e para trazer coleções prontas.
- **Coleções / cadernos temáticos** (agrupamentos manuais, além de categoria e tags).
- **Cartão para compartilhar:** exportar o modal como imagem (PNG) no estilo vintage.
- **Impressão:** `@media print` com o aforismo numa página A5 ou A6, no mesmo estilo do modal.
- **Autor como entidade** (biografia curta, datas, retrato em gravura), se a lista de autores crescer.
- Atalho no grupo **"Outros Sistemas"** do `extTotalPlanner`.

---

## 9. Decisões em aberto
## 9. Decisões do Projeto (Resolvidas — 2026-09-24)

Todas as decisões foram resolvidas. Ver arquivo de histórico `docs/historico/decisoes_projeto_20260924_0000.md` para o raciocínio completo.

| # | Decisão | Escolha |
|---|---|---|
| 1 | **Onde abre** | **Página inteira** — o ícone da extensão abre uma aba nova com o app completo. |
| 2 | **Categorias** | **Múltiplas** (0 a N por aforismo) — cada aforismo pode ter várias categorias. Filtro por categoria usa checkboxes (OR). |
| 3 | **Categorias iniciais** | **Com seed de 8 sugestões:** Moral, Política, Amor, Conhecimento, Estoicismo, Morte, Tempo, Virtude. Editáveis pelo usuário. |
| 4 | **Coleção de exemplo** | **Sim** — pré-carrega ~10 aforismos de domínio público (Sêneca, Marcus Aurelius, Montaigne, etc.) com múltiplas categorias e tags. |
