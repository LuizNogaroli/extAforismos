# Expansão: Iconografia + Biblioteca com Afiliados

**Data:** 2026-09-24  
**Feedback:** Usuário durante Fase 2  
**Status:** Planejado, Fase 3

## Novas Seções por Item

### 1. Iconografia (Galeria de Imagens)

Cada aforismo/citação/filme/dito pode ter uma galeria de imagens associadas:

**UI No Modal:**
```
┌─────────────────────────────────┐
│  ❦ Aforismo:  "Não é porque..." │
│  — Sêneca                       │
│                                 │
│  📸 Iconografia (2 imagens)     │
│  [thumbnail 1] [thumbnail 2]    │
│  [Adicionar imagem]             │
│                                 │
│  💬 Comentários (3)             │
│  ...                            │
│                                 │
│  📚 Biblioteca Recomendada (4)  │
│  ...                            │
└─────────────────────────────────┘
```

**Schema v4 → v5:**
```js
{
  id: "uuid",
  ...campos existentes...,
  
  // Iconografia (NEW)
  imagens: [
    {
      id: "uuid",
      url: "data:image/png;base64,...",  // data URI para evitar servidor
      descricao: "Sêneca — busto romano",
      width: 300,
      height: 400,
      addedAt: "ISO-8601"
    }
  ],

  // Biblioteca (NEW)
  livrosRecomendados: [
    {
      id: "uuid",
      titulo: "Cartas a Lucílio",
      autor: "Sêneca",
      isbn: "...",
      marketplace: "amazon",  // amazon, skoob, livraria-cultura
      urlAfiliado: "https://amazon.com.br/...?tag=...",
      comoRelacionado: "Obra original do aforismo",
      addedAt: "ISO-8601"
    }
  ]
}
```

### 2. Biblioteca (Livros Recomendados)

Cada item pode ter até N livros recomendados com links de afiliados:

**Marketplaces Suportados:**
- Amazon (maior audiência, comissão ~1-5%)
- Skoob (comunidade de leitores)
- Livraria Cultura
- Futuro: Sebos online, Project Gutenberg (públicos), etc.

**Strategy de Afiliação:**
1. Usar link de afiliado do usuário (configurável nas preferências)
2. Se não houver link, usar link padrão (share da receita com user depois)
3. Mostrar disclosure: "Este é um link de afiliado"
4. Rastrear cliques (cliente-side, no localStorage)

**UI Na Biblioteca:**
```
┌──────────────────────────────┐
│ 📚 Livros Recomendados:      │
│                              │
│ [Capa] Cartas a Lucílio      │
│        Sêneca               │
│        Por: Obra original   │
│        [Amazon] [Skoob]     │
│                              │
│ [Capa] Meditações           │
│        Marcus Aurelius      │
│        Por: Contexto histórico
│        [Amazon] [Skoob]     │
│                              │
│ [+ Adicionar livro]          │
└──────────────────────────────┘
```

## Impacto Técnico

### Schema

- v4 → v5: adiciona `imagens[]` e `livrosRecomendados[]`
- Migração automática: ambos iniciam vazios `[]`
- No localStorage: dados locais (imagens como data URI)

### Armazenamento

**Imagens:**
- Data URI encoding (base64) para evitar servidor externo
- Limite: ~5MB por extensão (localStorage limit ~5-10MB)
- Compactação opcional: JPEG em vez de PNG

**Livros:**
- Apenas metadata (título, autor, ISBN, URL)
- Links de afiliados como URLs simples
- Futuro: integração com API Skoob/Goodreads

### Monetização

**Modelo Atual (MVP):**
- Links de afiliados configuráveis
- Disclosure obrigatório ("link de afiliado")
- Rastreamento de cliques (localStorage)
- Relatório simples: "Você tem X cliques em livros"

**Futuro (Fase 4+):**
- Dashboard de afiliação com estatísticas
- Integração com plataformas (Rakuten, Impact, etc.)
- Split de receita se extensão for distribuída
- Recomendações automáticas via IA (Goodreads API)

## UI/UX Considerations

### Ordem das Seções no Modal

1. **Conteúdo Principal** (texto, autor, obra, época)
2. **Badge de Tipo** (Aforismo, Citação, Filme, Dito)
3. **Iconografia** (galeria de imagens)
4. **Comentários** (análises e contexto)
5. **Biblioteca** (livros recomendados)
6. **Ações** (Compartilhar, Favoritar, Editar)

### Responsividade

**Mobile:**
- Iconografia: carrossel horizontal (swipe)
- Biblioteca: stack vertical com cards compactos

**Desktop:**
- Iconografia: grid 2 colunas
- Biblioteca: grid 2-3 colunas

## Próximos Passos

### Fase 3 (v0.3.0 — Iconografia + Biblioteca)

1. ⏳ Atualizar schema v4 → v5
2. ⏳ Migração automática (imagens[], livrosRecomendados[])
3. ⏳ UI: seção de iconografia no modal
   - Mostrar imagens como galeria
   - Botão "Adicionar imagem" (file upload → data URI)
   - Botão "Deletar imagem"
4. ⏳ UI: seção de biblioteca no modal
   - Listagem de livros com covers
   - Botão "Adicionar livro" (form: título, autor, ISBN, marketplace, URL)
   - Botão "Deletar livro"
   - Links de afiliados com `rel="noopener noreferrer"`
5. ⏳ Testes: imagens grandes, múltiplos livros, responsividade

### Fase 4 (v0.4.0 — Preferências e Monetização)

- Dashboard de afiliação (cliques, conversões)
- Editor de Links de Afiliados (preferências)
- Integração com API Goodreads (recomendações automáticas)
- Analytics básicos (localStorage)

### Fase 5+ (Futuro)

- Extensão distribuída com suporte a múltiplos publishers
- Split de receita
- Integração com redes de afiliação maiores

## Considerações de Segurança

### Imagens

- Data URI: sem risco de XSS (validar base64)
- Limite de tamanho: máx 500KB por imagem (localStorage)
- Validar tipo: apenas PNG, JPEG, WebP

### Livros e Links

- Validar URLs: apenas HTTPS, whitelista de domínios (amazon.*, skoob.*, etc.)
- Escaper URLs em href attributes
- Disclosure obrigatório de afiliação (comply com FTC/CONAR)

## Nomenclatura

- "Iconografia" em vez de "Galeria" ou "Fotos" (mais alinhado com conceito literário/visual)
- "Biblioteca Recomendada" em vez de "Leitura Adicional" (marketing)
- "Livros Relacionados" é alternativa

---

**Prioridade:** Alta (monetização é estratégica)  
**Complexidade:** Média (schema, UI, storage)  
**Tempo Estimado:** 2-3 sessões
