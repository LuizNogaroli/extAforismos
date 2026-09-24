# Pendências — extAforismos

Registro de tudo que precisa de correção, pontos em aberto, ideias pós-MVP e decisões ainda não tomadas.

---

## Decisões do Projeto (Resolvidas — 2026-09-24)

✅ Todas as 4 decisões em aberto foram resolvidas. Ver `docs/historico/decisoes_projeto_20260924_0000.md` para detalhe completo.

| # | Decisão | Escolha |
|---|---|---|
| 1 | **Onde abre** | **Página inteira** |
| 2 | **Categorias por aforismo** | **Múltiplas** (0 a N) |
| 3 | **Categorias iniciais** | **Com seed** (8 sugestões: Moral, Política, Amor, Conhecimento, Estoicismo, Morte, Tempo, Virtude) |
| 4 | **Coleção de exemplo** | **Sim** (~10 aforismos de domínio público pré-carregados) |

---

## Ideias Pós-MVP (Fora do Escopo v1.0)

Listadas em `Sobre_extAforismos.md` §8, sem ordem de prioridade:

### Aforismo do Dia
- Notificação diária ou um widget que mostra um aforismo diferente ao abrir a extensão.
- Pode usar `chrome.alarms` (ver pattern em `extTotalPlanner`).

### Importar e Exportar
- JSON com backup completo (aforismos + categorias + configurações).
- CSV apenas de aforismos (para compartilhar com outro usuário).
- Importar pode detectar duplicatas (antes de sobrescrever).

### Coleções Temáticas
- Agrupamentos manuais além de categoria e tags (ex.: "Cartas de Sêneca", "Filosofia Grega").
- Seria um nível a mais de organização; MVP só tem categoria + tags.

### Cartão para Compartilhar
- Exportar o modal como PNG no estilo vintage, pronto para redes sociais.
- Liberar compartilhamento de um único aforismo com link curto.

### Impressão
- `@media print` para uma página A5 ou A6 com o aforismo no estilo do modal.
- Permite imprimir e trabalhar com papel, complementando a coleção digital.

### Autor como Entidade
- Se a lista de autores crescer, criar uma página de "Autores" com biografia, datas, retrato em gravura.
- Por enquanto, autor é só texto livre.

### Integração com extTotalPlanner
- Atalho no grupo "Outros Sistemas" da sidebar do Planner.
- Permite citar um aforismo como inspiração para uma atividade.

### Pesquisa por IA
- Usufruir de Claude API para gerar resumos/análises de um aforismo.
- Adicionar "contexto histórico" ou "como aplicar isso hoje" ao modal.

---

## Bugs e Problemas Descobertos

*Nenhum código foi escrito ainda, então nenhum bug foi descoberto. Esta seção será preenchida conforme sessões futuras encontrarem problemas.*

| # | Descrição | Como Constatado | Solução Sugerida | Status |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Código Morto ou Desatualizado

*Nenhum código escrito ainda, logo nenhum morto.*

| # | Arquivo | Descrição | Status |
|---|---|---|---|
| — | — | — | — |

---

## Documentação Desatualizada

*Documentação inicial: Sobre_extAforismos.md (concepção), CLAUDE.md (protocolo), MANUAL_TECNICO.md (arquitetura). Ainda não há código.*

| # | Documento | Seção | Detalhe | Status |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Validações e Regras de Negócio Pendentes

Coisas que precisam de validação no formulário de cadastro, mas não foram implementadas/decididas:

| # | Validação | Decisão Necessária | Status |
|---|---|---|---|
| 1 | **Comprimento do aforismo** | Mínimo (ex: 5 caracteres)? Máximo (ex: 1000)? Nenhum? | ⏳ Aguardando |
| 2 | **Caracteres especiais** | Permitir todos ou restringir (ex: sem unicode complexo)? | ⏳ Aguardando |
| 3 | **Duplicatas** | Detectar aforismo idêntico já cadastrado? | ⏳ Aguardando |
| 4 | **Tags vazias** | Mostrar aviso se não tiver tags? | ⏳ Aguardando (recomendação: tags opcionais) |
| 5 | **Categorias órfãs** | Se excluir uma categoria, confirmar antes de mover todos os aforismos? | ⏳ Aguardando (padrão: mover para "Sem categoria" sem confirmar, como extListaDeCompras) |

---

## Armadilhas Conhecidas (Copiladas de Extensões Irmãs)

Para não cair nos mesmos buracos:

| # | Armadilha | Projeto | Solução |
|---|---|---|---|
| 1 | Duas chaves de armazenamento para os mesmos dados (um editor + um widget lendo de lugares diferentes) | extTotalPlanner | Usar um contrato único de dados desde o começo. Documentar todas as chaves em MANUAL_TECNICO.md §4.1. |
| 2 | Acessar `chrome.storage` direto em vários pontos do código | extGestorDeOrcamento (antes da refatoração) | Sempre usar `StorageService` singleton com injeção de dependência. |
| 3 | HTML do usuário não escapado antes de `innerHTML` | extGestorDeInvestimentos | Toda string passa por `esc()` (ver MANUAL_TECNICO.md §3.2). |
| 4 | Chaves de dados inconsistentes (maiúsculas diferentes) | extTotalPlanner (Contextos vs. Categorias) | Normalizar chaves + documentar no mapa de dados. Para tags, usar `normalizarTag()` desde o início. |
| 5 | Esquecer `@media print` e a página impressa fica ilegível | extTotalPlanner (ainda pendente no Relatório de Impressão) | Se planeja impressão (ideia pós-MVP aqui), fazer `@media print` junto com o CSS normal. |
| 6 | Tailwind sem JIT: classes arbitrárias não funcionam | extTotalPlanner | Evitar `text-[var(--...)]` e derivados. Usar CSS custom properties + classes simples. |

---

## Notas Diversas

- **Feedback do usuário:** as 4 decisões em aberto (§1 deste arquivo) vêm da seção 9 de `Sobre_extAforismos.md` e ainda aguardam resposta.
- **Próxima sessão:** comece lendo `CLAUDE.md` (onboarding) e `Sobre_extAforismos.md` (visão), depois consulte este arquivo e o histórico em `docs/historico/` antes de mexer em código.
