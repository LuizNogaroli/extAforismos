/**
 * Seed de Categorias Iniciais (10 sugestões)
 *
 * Usado quando o usuário abre a extensão pela primeira vez.
 * Fase 1 (v0.2.0): adiciona Filmes e Ditos Populares
 * Ver: docs/MANUAL_TECNICO.md §3.6
 */

const seedCategorias = [
  {
    id: 'cat-moral',
    nome: 'Moral',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-politica',
    nome: 'Política',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-amor',
    nome: 'Amor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-conhecimento',
    nome: 'Conhecimento',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-estoicismo',
    nome: 'Estoicismo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-morte',
    nome: 'Morte',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-tempo',
    nome: 'Tempo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-virtude',
    nome: 'Virtude',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-filmes',
    nome: 'Filmes',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-ditos',
    nome: 'Ditos Populares',
    createdAt: new Date().toISOString(),
  },
];
