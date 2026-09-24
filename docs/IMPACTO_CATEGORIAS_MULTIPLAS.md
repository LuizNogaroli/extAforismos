# Impacto Visual: Categorias Múltiplas na Listagem

Com a decisão de usar **múltiplas categorias por aforismo**, a apresentação muda em três places:

## 1. Card da Listagem

**Antes (categoria única):**
```
┌────────────────────────────────────────────────────┐
│ S │ Sêneca · Cartas a Lucílio · c. 65 d.C. │ Moral │
│   │ "Não é porque as coisas são difíceis… " │ ❦ Ler │
│   │ #coragem #ação #superacao              │       │
└────────────────────────────────────────────────────┘
```

**Depois (múltiplas categorias):**
```
┌────────────────────────────────────────────────────┐
│ S │ Sêneca · Cartas a Lucílio · c. 65 d.C. │ Estoicismo │
│   │ "Não é porque as coisas são difíceis… " │ Ação       │
│   │ #coragem #ação #superacao              │ ❦ Ler     │
└────────────────────────────────────────────────────┘
```

Opcionalmente, as categorias podem aparecer como **pills/selos** (como tags):
```
┌────────────────────────────────────────────────────┐
│ S │ Sêneca · Cartas · c. 65 d.C. │ 🏷 Estoicismo  │
│   │ "Não é porque as… "            │ 🏷 Ação        │
│   │ #coragem #ação #superacao      │ ❦ Ler        │
└────────────────────────────────────────────────────┘
```

## 2. Cabeçalho de Filtros

**Antes:**
```
┌──────────────────────────────────────┐
│ 🔍 Busca: [_________]                │
├──────────────────────────────────────┤
│ Categoria:  [● Moral  ◯ Política...] │
│ Tags:       ☐ coragem ☐ virtude ... │
│ Autor:      [dropdown]               │
│ Época:      [intervalo]              │
│ Favoritos:  ☐                        │
│ Ordenar:    [recentes ▼]             │
└──────────────────────────────────────┘
```

**Depois (múltiplas categorias com checkboxes):**
```
┌──────────────────────────────────────┐
│ 🔍 Busca: [_________]                │
├──────────────────────────────────────┤
│ Categorias: ☐ Moral  ☐ Política ...  │
│             ☐ Amor   ☐ Conhecimento │
│ Tags:       ☐ coragem ☐ virtude ... │
│ Autor:      [dropdown]               │
│ Época:      [intervalo]              │
│ Favoritos:  ☐                        │
│ Ordenar:    [recentes ▼]             │
└──────────────────────────────────────┘
```

**Filtros ativos** (igual a tags):
```
Filtros ativos: [Moral ✕] [Estoicismo ✕] [#coragem ✕]  [Limpar tudo]
```

## 3. Modal de Leitura (Sem mudança essencial)

O modal continua o mesmo, mas pode listar **todas as categorias** do aforismo:

```
╔════════════════════════════════════╗
║  ❦ ESTOICISMO / AÇÃO ❦            ║  ← categorias separadas por /
║                                   ║
║    N ão é porque as coisas são    ║
║      difíceis que não ousamos;    ║
║      é porque não ousamos que     ║
║      elas são difíceis.           ║
║                                   ║
║          ── ✥ ──                  ║
║                                   ║
║    — SÊNECA, Cartas a Lucílio     ║
║             c. 65 d.C.            ║
║                                   ║
║  #coragem  #ação  #superacao      ║
╚════════════════════════════════════╝
```

Ou com pills de categoria:
```
╔════════════════════════════════════╗
║       🏷 Estoicismo · 🏷 Ação      ║
║                                   ║
║    N ão é porque as coisas são    ║
║      difíceis que não ousamos;    ║
║      …
```

## 4. Lógica de Filtro

**Filtro de categorias com múltiplas seleções = OR**

Se o usuário escolhe `[Moral] [Estoicismo]`, o app mostra aforismos que têm **qualquer uma** dessas categorias:

```js
// Pseudo-código
categoriasSelecionadas = [Moral, Estoicismo];
aforismoTemAlgumaCategoria = aforismo.categoriaIds.some(id => 
  categoriasSelecionadas.includes(id)
);
```

**Combinação com outros filtros = AND**

Se também selecionar tags, a lógica é:
- (Categoria = Moral OU Estoicismo) **E** (Tag = coragem OU ação) **E** (Busca contém X)

## 5. Coleção de Exemplo

A seed de 10 aforismos pré-carregados usa múltiplas categorias:

```js
// Exemplo
{
  id: "afor-seneca-1",
  texto: "Não é porque as coisas são difíceis…",
  autor: "Sêneca",
  categoriaIds: ["cat-estoicismo", "cat-acao"],  // 2 categorias
  tags: ["coragem", "ação", "superacao"],
  // …
}
```

Isso demonstra já no primeiro uso que cada aforismo pode ter várias categorias.

---

## Impacto na Migração de Dados

Se um usuário já tinha dados salvos com o schema **antigo** (`categoriaId: "uuid"` único), precisa migrar:

```js
// Migração de v1 → v2
{ categoriaId: "uuid-1" }  →  { categoriaIds: ["uuid-1"] }
{ categoriaId: null }      →  { categoriaIds: [] }
```

O `MANUAL_TECNICO.md` §3.6 tem o código completo de migração com a flag `aforismos_migrado_v2`.

---

**Resultado:** interface mais flexível, sem perda de funcionalidade. Tags ficam para rótulos livres e transversais, categorias para agrupamentos temáticos que cada aforismo pode pertencer a múltiplos.
