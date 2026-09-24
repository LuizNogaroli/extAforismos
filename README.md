# extAforismos

Uma extensão Chrome para criar e organizar um caderno pessoal de aforismos — frases curtas, densas e literárias de diferentes autores e épocas.

## 🎯 Visão Geral

**extAforismos** combina simplicidade (categoria única, tags livres) com profundidade de busca (filtros combinados por busca, categoria, tags, autor, época, favoritos). O foco visual é vintage e literário — a listagem segue o padrão de marketplace (funcional, legível), e o **modal de leitura** imita uma página de livro antigo, com papel envelhecido, moldura tipográfica, capitular e aspas curvas.

## 📚 Documentação

**Antes de qualquer coisa:** comece lendo [CLAUDE.md](CLAUDE.md) (2 min) e depois [docs/Sobre_extAforismos.md](docs/Sobre_extAforismos.md) (5 min). O resto da documentação está em `docs/`.

| Documento | Propósito |
|---|---|
| **[CLAUDE.md](CLAUDE.md)** | Protocolo de documentação + onboarding rápido para novas sessões. Leia sempre primeiro. |
| **[docs/Sobre_extAforismos.md](docs/Sobre_extAforismos.md)** | Visão do projeto, conceitos de domínio (aforismo, categoria, tag, autor), anatomia da listagem, descrição do modal vintage, requisitos de entrada. |
| **[docs/MANUAL_TECNICO.md](docs/MANUAL_TECNICO.md)** | Arquitetura (Vanilla JS sem bundler), padrões técnicos (StorageService, escape de HTML, filtros), modelo de dados, estrutura de arquivos. |
| **[docs/pendencias.md](docs/pendencias.md)** | 4 decisões em aberto (onde abre, categorias, seed, exemplo), ideias pós-MVP, armadilhas de outras extensões. |
| **[docs/historico/](docs/historico/)** | Um arquivo por mudança realizada, em ordem cronológica (timestamp no nome). Consulte os 3–5 mais recentes para ver o que mudou. |

## ⚙️ Stack

- **Manifest V3** — obrigatório para Chrome moderno.
- **Vanilla JavaScript** — sem framework, sem bundler.
  - Uma página HTML única (`index.html`).
  - Módulos JS em `js/` (um por funcionalidade).
  - CSS puro em `css/` (um arquivo único).
  - Tipografia: `.woff2` locais (`EB Garamond`, `IM Fell English`), não web fonts da rede.
- **Armazenamento** — `StorageService` com fallback automático:
  1. `chrome.storage.local` (extensão instalada)
  2. `localStorage` (dev-server / teste)
  3. Memória (offline, não persiste)
- **Visual** — cores vintage (creme, sépia, vermelho-tinta) em CSS custom properties, dark mode automático via `prefers-color-scheme`.

## 🎨 Características Planejadas (v1.0)

- **Cadastro:** aforismo (obrigatório), autor, obra, época + ano, texto original + idioma, categoria, tags, notas pessoais, favorito.
- **Listagem:** inspirada em marketplace (`extListaDeCompras`), com capitular do autor, trecho em itálico, selos de tags.
- **Filtros:** busca (ignora acentos), categoria, tags (AND/OR), autor, época, favoritos, ordenação, paginação.
- **Modal Vintage:** moldura dupla, papel com vinheta (gradiente radial), capitular (drop cap), fleurons (❦ ✥), navegação por setas.

## ✅ Decisões do Projeto (Resolvidas)

Todas as decisões foram tomadas (2026-09-24). Ver `docs/historico/decisoes_projeto_20260924_0000.md` para detalhes.

| # | Decisão | Escolha |
|---|---|---|
| 1 | **Onde abre** | **Página inteira** — o ícone abre uma aba nova com o app completo. |
| 2 | **Categorias** | **Múltiplas** (0 a N por aforismo) — cada aforismo pode ter várias categorias. |
| 3 | **Seed de categorias** | **Sim** — 8 sugestões iniciais (Moral, Política, Amor, Conhecimento, Estoicismo, Morte, Tempo, Virtude). |
| 4 | **Coleção de exemplo** | **Sim** — ~10 aforismos de domínio público pré-carregados (Sêneca, Marcus Aurelius, Montaigne, etc.). |

## 📝 Ideias Pós-MVP

Listadas em [docs/pendencias.md](docs/pendencias.md) §2:
- Aforismo do dia (notificação diária)
- Importar e exportar (JSON, CSV)
- Coleções temáticas (agrupamentos manuais)
- Cartão para compartilhar (export PNG vintage)
- Impressão (A5/A6 com `@media print`)
- Autor como entidade (biografia, retrato)
- Integração com extTotalPlanner
- Análise por IA (contexto histórico, aplicações modernas)

## 🛠️ Como Começar

### Próxima Sessão de Desenvolvimento

1. Leia [CLAUDE.md](CLAUDE.md) (protocolo + onboarding).
2. Leia [docs/Sobre_extAforismos.md](docs/Sobre_extAforismos.md) + [docs/MANUAL_TECNICO.md](docs/MANUAL_TECNICO.md).
3. Consulte [docs/pendencias.md](docs/pendencias.md) antes de propor mudanças.
4. Decida sobre os 4 pontos em aberto (§2 acima).
5. Escolha por onde começar:
   - **Estrutura base:** `index.html` + `js/app.js` (state machine) + `css/index.css` (estilos globais).
   - **Protótipo visual:** modal vintage (HTML + CSS puro) como proof-of-concept do design.
   - **Dados:** `StorageService` + `AforismoManager` (CRUD em memória).
   - **Filtros:** classe `Filtros` com aplicação de filtros combinados.

### Desenvolvimento Local

Não há `npm install` ou build necessário. Para testar:

```bash
# Opção 1: abrir index.html direto (funciona para UI estática)
# Opção 2: servidor HTTP local simples (se usar fetch mais tarde)
python3 -m http.server 8000
# Depois abrir: http://localhost:8000
```

### Adicionar à Chrome

1. Com o servidor rodando (ou só a pasta estática), acesse `chrome://extensions`.
2. Ative "Modo do desenvolvedor" (canto superior direito).
3. "Carregar sem compactação" → selecione a pasta `extAforismos/`.
4. A extensão aparece na barra de ferramentas.

## 📋 Status

- **v0.0.1 (2026-09-24):** Apenas documentação (nenhum código).
  - `CLAUDE.md` — protocolo + onboarding
  - `docs/Sobre_extAforismos.md` — visão + conceitos + decisões em aberto
  - `docs/MANUAL_TECNICO.md` — arquitetura + padrões técnicos
  - `docs/pendencias.md` — decisões em aberto + ideias pós-MVP
  - `docs/historico/` — vazio (será preenchido conforme muda)

## 🔗 Referências

- **[extDocumentacao/](../extDocumentacao/)** — base compartilhada entre extensões Chrome (storage, Manifest V3, vanilla js, problemas comuns).
- **[extTotalPlanner/](../extTotalPlanner/)** — padrões de onboarding, dark mode, Vanilla JS, documentação viva.
- **[extListaDeCompras/](../extListaDeCompras/)** — padrão de listagem "cortina", modal backdrop, CSS puro sem bundler.

## 📄 Licença

Descrição apenas. Nenhum código foi escrito ainda (v0.0.1 = concepção).

---

**Próxima sessão?** Comece lendo [CLAUDE.md](CLAUDE.md), depois [docs/Sobre_extAforismos.md](docs/Sobre_extAforismos.md). Tudo que você precisa saber está lá — não precisa reconstruir do zero.
