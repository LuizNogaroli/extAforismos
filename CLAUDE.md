# Diretrizes do Projeto extAforismos

> 🤖 Este arquivo segue o **Padrão B de documentação** ([`../extDocumentacao/07-governanca-de-documentacao.md`](../extDocumentacao/07-governanca-de-documentacao.md)) — arquivo vivo de protocolo + onboarding.

## Protocolo de Documentação Técnica

Toda mudança significativa (feature, padrão técnico, decisão de design, refatoração) deve ser registrada assim, **nessa ordem**:

1. **Implementar a mudança** no código.
2. **Atualizar [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md)**:
   - Seção 3 (Soluções Técnicas) — se for um padrão reutilizável neste projeto ou herdável de outros.
   - Seção 6 (Histórico de Versões) — sempre, uma linha cronológica resumida.
3. **Criar um arquivo em [`docs/historico/`](docs/historico/)**:
   - Nome: `<assunto>_<YYYYMMDD>_<HHMM>.md` (ex.: `modal_vintage_20260924_1430.md`).
   - Conteúdo: O que foi feito · Por quê · Estado antes/depois · Como desfazer se preciso.

Isso permite que qualquer sessão futura (sua ou de outra IA) chegue e veja exatamente o que mudou, onde e como.

---

## Onboarding Rápido para uma Sessão Nova

Se você chegou agora, leia **nesta ordem** antes de mexer em qualquer coisa:

### 0. Base Compartilhada
**[`../extDocumentacao/README.md`](../extDocumentacao/README.md)** — conhecimento compartilhado entre todos os projetos de extensão Chrome (storage, Manifest V3, CORS, dev-server local, problemas comuns).

Após ler o `README.md`, abra os arquivos específicos conforme precisar:
- `01-storage-e-persistencia.md` — padrão `StorageService` com fallback (`chrome.storage.local` → `localStorage` → memória).
- `02-service-worker-mv3.md` — como o Manifest V3 funciona.
- `06-arquitetura-vanilla-js-sem-bundler.md` — estrutura de projeto sem bundler (como a maioria das extensões aqui).

### 1. Visão do Projeto
**[`docs/Sobre_extAforismos.md`](docs/Sobre_extAforismos.md)** — leia primeiro. É a descrição da ideia: um caderno de aforismos com categoria, tags, filtros e modal vintage. Sem isso, decisões de onde colocar uma feature saem erradas.

### 2. Mapa Técnico
**[`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md)** — arquitetura, tecnologia, padrões já resolvidos (seção 3), mapa de dados (seção 4). Leia inteiro antes de fazer mudanças que envolvam armazenamento, visual ou arquitetura.

### 3. Tudo Que Precisa de Correção
**[`docs/pendencias.md`](docs/pendencias.md)** — bugs, decidições em aberto, código morto, ideias ainda não implementadas. Consulte antes de sugerir algo "novo", pode já estar anotado aqui.

### 4. Histórico Granular Recente
**[`docs/historico/`](docs/historico/)** — um arquivo por mudança, em ordem cronológica (o timestamp está no nome). **Leia os 3–5 mais recentes** para saber exatamente o que a sessão anterior deixou pronto/incompleto.

### 5. Discussões de Design (se relevante)
**[`docs/UX_LAYOUT.md`](docs/UX_LAYOUT.md)** (quando existir) — análises de design que ainda não viraram código, pontos em aberto, trade-offs considerados. Consulte antes de propor uma mudança de visual.

### Depois disso
O código é a fonte de verdade para "como está agora". Os documentos acima explicam o *porquê*.

---

## Lições das Extensões Irmãs

### Padrões a Reutilizar

| Padrão | Referência | Por quê |
|---|---|---|
| **StorageService com fallback** | [`extDocumentacao/01-storage-e-persistencia.md`](../extDocumentacao/01-storage-e-persistencia.md) | Permite testar sem extensão instalada + funciona offline. |
| **Listagem com cortina de marketplace** | [`extListaDeCompras/docs/frontend-layout.md`](../extListaDeCompras/docs/frontend-layout.md) (§5) | A anatomia das linhas (imagem pequena | dados | ação) já é testada. Adapt para conteúdo literário. |
| **Modal padrão** | [`extListaDeCompras/docs/frontend-layout.md`](../extListaDeCompras/docs/frontend-layout.md) (§3) | Estrutura `modal-backdrop` + `modal` + `stopPropagation()` — usa em todo lugar. |
| **Navegação e estado global** | [`extTotalPlanner/docs/MANUAL_TECNICO.md`](../extTotalPlanner/docs/MANUAL_TECNICO.md) (§3.19) | Rotas com `#` + máquina de estado + re-render da view. |
| **Filtros com pills ativas** | [`extTotalPlanner/docs/MANUAL_TECNICO.md`](../extTotalPlanner/docs/MANUAL_TECNICO.md) (§3.12) | Em vez de `:has(input:checked)`, use classe `.on` para que re-render funcione sem rebuscado. |
| **Notifications + som** | [`extListaDeCompras/docs/notifications-and-sound.md`](../extListaDeCompras/docs/notifications-and-sound.md) | Padrão pronto para avisos sonoros (sintetizador Web Audio, sem MP3). |

### Decisões Já Tomadas Noutros Projetos

- **Vanilla JS sem bundler:** `extTotalPlanner` usa essa abordagem há 1.45 versões, com sucesso. Estrutura: `index.html` único, `js/` com módulos reutilizáveis, `css/` com um arquivo de estilos.
- **Sem biblioteca de componentes:** CSS puro + classes utilitárias (`.ghost`, `.secondary`, `.primary`), usado em `extListaDeCompras`. Mais simples, sem dependências.
- **Tipografia em web fonts:** aqui queremos histórico + offline, então **guardar `.woff2` locais** (EB Garamond, IM Fell English). Ver [`docs/Sobre_extAforismos.md`](docs/Sobre_extAforismos.md) §5.3.
- **Cores personalizadas por tema:** `extTotalPlanner` tenta isso, mas o Tailwind local é v2 sem JIT (nenhuma classe arbitrária funciona). Aqui usamos **CSS custom properties** (`:root { --bg, --text, … }`) que são simples e portáveis.

### Armadilhas a Evitar

| Armadilha | Lição | Como evitar |
|---|---|---|
| **Acessar `chrome.storage` direto** | Acopla o código, dificulta teste. | Usar `StorageService` singleton com injeção de dependência (§01 da extDocumentacao). |
| **Dois formatos de dados simultaneamente** | `extTotalPlanner` sofreu com `planner_compras` (widget) e `planner_lista_compras` (CRUD genérico) nunca se encontrando. | Ter um contrato único de dados desde o começo. Migração explícita se mudar depois. |
| **Chaves de armazenamento inconsistentes** | `extTotalPlanner` §3.22 descobriu chaves diferentes para a mesma coisa em Contextos vs. Categorias vs. Hábitos. | Documentar todas as chaves em `docs/MANUAL_TECNICO.md` §4.1 (Mapa de Dados) já no MVP. |
| **`:has()` em CSS sem verificar suporte** | Não há fallback em navegadores antigos. | Está ok para extensão Chrome (que sempre é a versão mais recente), mas documentar a dependência. |
| **Esquecer `@media print`** | Telas impressas viram um caos visual. | Se o modal é bonito, fazer a versão de impressão (A5/A6) também. Já mencionado em [`docs/Sobre_extAforismos.md`](docs/Sobre_extAforismos.md) §8 (ideia pós-MVP). |
| **Sem escape de HTML do usuário** | XSS implícito. | Todo texto que vai para `innerHTML` passa por função `esc()` (ver padrão em `extTotalPlanner/docs/MANUAL_TECNICO.md` §3.7). |

---

## Tecnologia Decidida

- **Manifest V3** (obrigatório para Chrome 127+, recomendado sempre).
- **Vanilla JavaScript** — sem framework, sem bundler.
  - Uma única página HTML (`index.html`).
  - Módulos JS em `js/` (um arquivo por funcionalidade, ex.: `js/aforismoManager.js`, `js/filtros.js`).
  - CSS em `css/` (único arquivo, não há CSS-in-JS nem módulos por componente).
  - Tipografia: `.woff2` locais (dentro de `fonts/`), não web fonts da rede.
- **Armazenamento:** `StorageService` (fallback automático).
- **Interface:** pt-BR, cores em CSS custom properties (dark mode automático via `prefers-color-scheme`).

---

## Diretrizes de Visual (Vintage/Literário)

Inspiração: página de um livro antigo, fichas de catálogo de biblioteca, papel envelhecido com ornamentos.

- **Cores:** Creme/papel (`#f4ecd8`), texto sépia escuro (`#3b2f24`), detalhes em vermelho-tinta (`#8b2e1f`) ou dourado envelhecido (`#a67c2e`).
- **Tipografia:** Serifada em tudo (Garamond na listagem, IM Fell English para capitulares e ornamentos).
- **Listagem:** inspiração de marketplace (imagem | dados | ação), mas com conteúdo literário — autor inicial em moldura, trecho em itálico, tags como selos.
- **Modal:** moldura dupla fina, capitular (drop cap), papel com vinheta (gradiente radial), sem imagens externas — tudo CSS.
- **Ornamentos:** fleurons (❦ ❧ ✥), travessões tipográficos (—), aspas curvas (" "), sem aspas retas.

Mais detalhes em [`docs/Sobre_extAforismos.md`](docs/Sobre_extAforismos.md) §3–5 e [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md) §2 (Paleta de Cores).

---

## Após Concluir Qualquer Mudança

1. **Atualizar `docs/MANUAL_TECNICO.md`** (§3 se padrão, §6 sempre).
2. **Criar um arquivo em `docs/historico/`** descrevendo a mudança.
3. **Se for UX/design**, considerar atualizar `docs/UX_LAYOUT.md` (quando esse arquivo existir).
4. **Se encontrar um bug/decisão em aberto**, anotar em `docs/pendencias.md`.

Isso permite que a próxima sessão chegue e entenda o contexto completo, sem precisar reconstruir nada.

---

## Notas Finais

- **Responsividade:** mobile-first é recomendado. Começar por mobile (que é mais restritivo) facilita a expansão para desktop depois.
- **Testes:** como é Vanilla JS sem bundler, pode-se abrir o `index.html` direto no navegador (com um servidor local simples para CORS, se houver busca de dados). Não precisa de `npm install` ou `npm run build`.
- **Compatibilidade:** alvo é Chrome 127+, não precisa suportar Firefox, Safari ou navegadores antigos.
