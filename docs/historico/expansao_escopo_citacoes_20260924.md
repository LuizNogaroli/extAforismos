# Expansão de Escopo — Aforismos + Citações de Livros

**Data:** 2026-09-24  
**Solicitado por:** Usuário  
**Status:** Decisão tomada, implementação pendente

## O Que Muda

**De:** "Caderno de aforismos" (frases curtas e densas)  
**Para:** "Caderno de citações" (aforismos + trechos interessantes de livros)

## Motivação

- Aforismos são frases independentes (máximas filosóficas)
- Citações de livros são trechos contextualizados dentro de uma obra
- Ambas merecem ser coletadas e organizadas juntas
- Muitas vezes as fronteiras se misturam (um trecho pode ser tão denso quanto um aforismo)

## Novo Modelo de Dados

### Schema de Citação (unificado)

```js
{
  id: "uuid",
  
  // Tipo de conteúdo
  tipo: "aforismo" | "citacao",  // [NOVO]
  
  // Conteúdo
  texto: "...",                    // obrigatório
  contexto: "...",                 // [NOVO] explicação do trecho no livro
  
  // Autoria
  autor: "...",
  obra: "...",                     // obrigatório (nome do livro)
  pagina: 42,                      // [NOVO] número da página (para citações)
  edicao: "1ª edição, 2020",      // [NOVO] edição do livro
  
  // Cronologia
  epoca: "1880",
  anoReferencia: 1880,
  anoPublicacao: 1880,             // [NOVO] ano de publicação da obra
  
  // Idioma original
  idiomaOriginal: "francês",
  textoOriginal: "...",
  
  // Organização
  categoriaIds: [],                // moral, política, amor, conhecimento, etc.
  tags: [],                        // metadados adicionais
  generoLiterario: "",             // [NOVO] romance, ensaio, poesia, filosofia, etc.
  
  // Pessoal
  favorito: false,
  notas: "Reflexão pessoal...",
  leitura_completa: false,         // [NOVO] li o livro todo?
  
  // Timestamps
  createdAt: "...",
  updatedAt: "...",
}
```

### Exemplos Contrastantes

**Aforismo (tradicional):**
```js
{
  tipo: "aforismo",
  texto: "Não é porque as coisas são difíceis que não ousamos...",
  autor: "Sêneca",
  obra: "Cartas a Lucílio",
  categoriaIds: ["estoicismo", "acao"],
  tags: ["coragem", "superacao"],
}
```

**Citação de Livro:**
```js
{
  tipo: "citacao",
  texto: "Todos os seres humanos nascem livres e iguais em dignidade e direitos...",
  contexto: "Abertura da Declaração Universal dos Direitos Humanos",
  autor: "Assembleia Geral das Nações Unidas",
  obra: "Declaração Universal dos Direitos Humanos",
  pagina: 1,
  edicao: "Resolução 217 A (III)",
  anoPublicacao: 1948,
  generoLiterario: "documento",
  categoriaIds: ["politica", "direitos"],
  tags: ["humanidade", "igualdade", "liberdade"],
}
```

**Citação de Romance:**
```js
{
  tipo: "citacao",
  texto: "Era o melhor dos tempos, era o pior dos tempos...",
  contexto: "Abertura do romance, estabelecendo o contraste da era",
  autor: "Charles Dickens",
  obra: "Um Conto de Duas Cidades",
  pagina: 1,
  edicao: "Penguin Classics, 2003",
  anoPublicacao: 1859,
  generoLiterario: "romance",
  categoriaIds: ["tempo", "contraste"],
  tags: ["abertura", "dualidade"],
}
```

## Impacto na UI

### Cabeçalho de Filtros (nova coluna)

```
Tipo: ☐ Aforismo  ☐ Citação  ☐ Ambos
```

### Card da Listagem (novo campo)

```
[S] Sêneca · Cartas · c. 65 d.C.  │  Aforismo  │
    "Não é porque as coisas..."   │  Estoicismo│
    #coragem #acao                │  ❦ Ler    │
```

Ou para citação:

```
[D] Dickens · Um Conto... · 1859   │  Citação   │
    "Era o melhor dos tempos..."   │  Romance   │
    #abertura #dualidade          │  p. 1      │
```

### Modal de Leitura (novo campo)

Para citações, adicionar:

```
Livro: Um Conto de Duas Cidades
Página: 1
Edição: Penguin Classics, 2003
Contexto: Abertura do romance, estabelecendo...
```

## Mudanças na Seed

Expandir `seedAforismos` para `seedCitacoes`:
- Manter os 10 aforismos existentes (tipo: "aforismo")
- Adicionar 5-10 citações de livros clássicos (tipo: "citacao")

Exemplos de fontes:
- *1984* — George Orwell (1949)
- *Jane Eyre* — Charlotte Brontë (1847)
- *Dom Casmurro* — Machado de Assis (1899)
- *Grande Sertão: Veredas* — Guimarães Rosa (1956)
- *O Cortiço* — Aluísio Azevedo (1890)

## Impacto Técnico

### Mínimo (recomendado)

1. Adicionar campo `tipo: "aforismo" | "citacao"` no schema
2. Adicionar filtro de tipo nos filtros
3. Adicionar campos `contexto`, `pagina`, `generoLiterario` (opcionais)
4. Renomear `seedAforismos` para `seedCitacoes`
5. Atualizar labels no cabeçalho (de "Aforismos" para "Citações")

### Mudanças Arquiteturais

- **Sem breaking change:** campo `tipo` é opcional (padrão: "aforismo")
- **Migração:** automática (aforismos existentes = tipo "aforismo")
- **UI adaptável:** modal detecta tipo e mostra campos relevantes
- **Nomenclatura:** considerar renomear arquivo de `AforismoManager.js` para `CitacaoManager.js` (ou manter para não quebrar)

## Próximos Passos

### Fase 1 (v0.2.0 — Beta de Citações)
1. ✅ Documentar expansão de escopo (este arquivo)
2. ⏳ Atualizar schema (adicionar `tipo`, `contexto`, `pagina`, `generoLiterario`)
3. ⏳ Migração automática (aforismos = tipo "aforismo")
4. ⏳ Atualizar UI (filtro de tipo, campos condicionais no modal)
5. ⏳ Expandir seed (adicionar citações de livros clássicos)
6. ⏳ Testar compatibilidade com dados antigos

### Fase 2+ (Futuro)
- Integração com Skoob/Goodreads para metadata de livros
- Recomendações de livros baseado em citações favoritas
- Visualização por livro/autor
- Estatísticas (quantas citações por livro, gênero, década)

## Decisões em Aberto

1. **Nomenclatura:** Manter "Aforismos" ou mudar para "Citações"?
   - Recomendação: "Citações" é mais abrangente
   
2. **Campo `generoLiterario`:** Deixar aberto (texto livre) ou usar enum?
   - Recomendação: enum inicial (romance, poesia, ensaio, filosofia, documento)
   
3. **Campo `pagina`:** Obrigatório para citações?
   - Recomendação: opcional (nem sempre se sabe ou importa)

4. **Seed inicial:** Só aforismos clássicos ou misturar com citações?
   - Recomendação: manter aforismos, adicionar ~5 citações de livros brasileiros

---

**Estado Anterior:** MVP de aforismos (10 exemplos)  
**Estado Novo:** Preparado para suportar aforismos + citações de livros  
**Próxima Ação:** Aguardar aprovação para início da Fase 1
