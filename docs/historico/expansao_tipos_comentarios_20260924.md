# Expansão: Filmes + Ditos Populares + Sistema de Comentários

**Data:** 2026-09-24  
**Situação:** Feedback do usuário durante implementação de v0.2.0  
**Status:** Aprovado, Fase 1.1

## Novos Tipos de Conteúdo

Além de **aforismos** e **citações de livros**, suportar também:

### 4. `tipo: "filme"`
Diálogos icônicos, cenas marcantes, frases memoráveis de filmes/séries.

```js
{
  tipo: "filme",
  texto: "May the Force be with you.",
  contexto: "Frase recorrente na saga Star Wars",
  autor: "Vários personagens",
  obra: "Star Wars (série)",  // ex: "Star Wars Episode IV"
  ano: 1977,
  anoPublicacao: 1977,
  generoLiterario: "ficção científica",  // reutilizamos este para gênero de filme
  pagina: null,  // não aplicável para filmes
  edicao: "Edição original",
  categoriaIds: ["cat-conhecimento"],
  tags: ["sabedoria", "jedi"],
  notas: "Uma das frases mais icônicas do cinema",
  comentarios: [...],  // novo array de comentários
}
```

### 5. `tipo: "dito"`
Frases da cultura popular, provérbios, ditos consagrados.

```js
{
  tipo: "dito",
  texto: "Quem aviso já dá, já tem culpa.",
  contexto: "Ditado popular brasileiro sobre responsabilidade",
  autor: "Sabedoria popular",
  obra: "Tradição oral brasileira",  // ou deixar genérico
  anoPublicacao: null,  // pode ser desconhecido
  categoriaIds: ["cat-ditos"],
  tags: ["sabedoria", "responsabilidade"],
  notas: "Dito popular — origem incerta mas muito comum",
  comentarios: [...]
}
```

## Novo Campo: Comentários (Sistema Phase 1.1)

Cada aforismo/citação/filme/dito pode ter múltiplos comentários (análises, contexto, curiosidades).

### Schema de Comentário

```js
{
  id: "uuid",
  tipo: "interpretacao" | "curiosidade" | "contexto" | "erro",  // categoria de comentário
  texto: "Este aforismo é frequentemente citado como base para...",
  autor: "Você" | "Outro usuário" (por enquanto sempre "Você"),
  createdAt: "2026-09-24T...",
  upvotes: 0,  // futuro: sistema de votação
  pinned: false,  // futuro: comentários importantes fixos no topo
}
```

### UI: Container de Comentários

Inspirado em extListaDeCompras (que tem container de "preços" para cada item):

```
┌─────────────────────────────────────┐
│  ❦ Aforismo:  "Não é porque..."  ❦  │
│  — Sêneca                           │
│                                     │
│  ────── Comentários (3) ──────      │
│                                     │
│  [Interpretação]                    │
│  "Este aforismo conecta-se com...   │
│   a filosofia estóica..."           │
│  — Você                             │
│                                     │
│  [Curiosidade]                      │
│  "Sêneca era escravo de Nero..."    │
│  — Você                             │
│                                     │
│  [+ Novo Comentário]  [Mostrar...]  │
└─────────────────────────────────────┘
```

## Impacto Técnico

### Schema v3 → v4

Novo campo em cada aforismo/citação/filme/dito:

```js
comentarios: [
  {
    id: "uuid",
    tipo: "interpretacao" | "curiosidade" | "contexto" | "erro",
    texto: "...",
    autor: "Você",
    createdAt: "ISO-8601",
  }
]
```

### Novo Filtro

Na listagem, adicionar filtro:

```
Tipo: ☐ Aforismo  ☐ Livros  ☐ Filmes  ☐ Ditos  ☐ Todos
```

### Sem Suporte a Comentários Públicos (Fase 1.1)

- Comentários são locais (armazenados na extensão)
- Sempre autor = "Você"
- Sem sincronização com nuvem ou outros usuários
- Futuro (Fase 2): integração com comentários compartilhados?

### Sem Upvotes/Votação (Fase 1.1)

- Simples listagem linear de comentários
- Futuro (Fase 2): sistema de votação, comentários fixos (pinned)

## Exemplos de Seeds (Fase 1.1)

### Filme

```js
{
  id: 'film-1',
  tipo: 'filme',
  texto: 'Just keep swimming.',
  contexto: 'Mantra de Dory para superar dificuldades',
  autor: 'Dory (Ellen DeGeneres)',
  obra: 'Finding Nemo',
  pagina: null,
  edicao: 'Edição original',
  anoPublicacao: 2003,
  anoReferencia: 2003,
  generoLiterario: 'animação',
  categoriaIds: ['cat-acao', 'cat-conhecimento'],
  tags: ['perseverança', 'esperança'],
  comentarios: [],
  favorito: false,
  leitura_completa: false,
}
```

### Dito Popular

```js
{
  id: 'dito-1',
  tipo: 'dito',
  texto: 'Deus ajuda quem cedo madruga.',
  contexto: 'Provérbio sobre o valor da diligência',
  autor: 'Sabedoria popular',
  obra: 'Tradição oral',
  pagina: null,
  edicao: null,
  anoPublicacao: null,
  anoReferencia: null,
  generoLiterario: 'provérbio',
  categoriaIds: ['cat-ditos', 'cat-conhecimento'],
  tags: ['trabalho', 'virtude'],
  comentarios: [],
  favorito: false,
  leitura_completa: false,
}
```

## Próximos Passos

### Fase 1.1 (v0.2.0 Expandido)
1. ✅ Documentar nova expansão (este arquivo)
2. ⏳ Atualizar schema v3 → v4 (adicionar campo `comentarios: []`)
3. ⏳ Migração automática (todos recebem `comentarios: []`)
4. ⏳ Expandir seed com filmes e ditos (1-2 de cada)
5. ⏳ Atualizar UI de filtros (novo filtro "Tipo")
6. ⏳ Adicionar container de comentários no modal
7. ⏳ Formulário para novo comentário no modal

### Fase 2 (Futuro)
- Sistema de votação em comentários
- Comentários fixos (pinned) no topo
- Sincronização de comentários entre dispositivos
- Integração com análises externas (Wikipedia, etc.)

---

**Integração com Seed:** As seeds agora incluem:
- 10 aforismos clássicos
- 6 citações de livros (Dickens, Machado, Rosa, Orwell, Azevedo, Brontë)
- +1 citação/filme (será adicionado no MVP)
- +1 dito popular (será adicionado no MVP)

**Nomenclatura:** Considerar renomear a extensão/arquivo de "AforismoManager" para "CitacaoManager" (mais genérico). Por enquanto mantém-se "AforismoManager" por compatibilidade.
