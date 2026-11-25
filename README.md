# Portal Nova 📰

Portal de notícias moderno com painel administrativo — piloto para venda.

## Recursos

- 🌓 **Modo escuro/claro** com um clique
- 🎞️ **Ticker de "Últimas"** no topo, estilo jornal de TV
- 🏠 **Home organizada**: manchete gigante, grid de destaques, últimas notícias, blocos por editoria, "Mais lidas da semana", banner de anúncios e newsletter
- 📄 **Página da matéria**: subtítulos, citações destacadas, **fotos e vídeos ilimitados com legenda em cima e embaixo**, galeria com lightbox (contador "1 de N"), tempo de leitura, compartilhar/WhatsApp, matérias relacionadas e tags
- 🗂️ **Páginas por editoria** (Cidade, Política, Economia, Esportes, Entretenimento, Tecnologia, Saúde)
- ⚙️ **Painel admin** (`/admin`):
  - Dashboard com métricas e barras de audiência
  - **Botões de ação rápida dinâmicos** (adicionar, reordenar, remover)
  - Lista de matérias com estados 🟡 rascunho / 🔵 revisão / 🟢 publicado, publicar/editar/excluir
- ✍️ **Editor de publicação** (`/admin/publicar`): título, subtítulo, editoria, autor, tags, capa com legenda, inserção de parágrafo/subtítulo/citação/foto/vídeo/galeria, reordenação de blocos e **prévia ao vivo**

## Rodando

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # produção
```

## Estrutura

```
app/            páginas (home, matéria, editoria, admin)
components/     header com ticker, footer, cards, renderizador de mídia
lib/            tipos, dados de exemplo (seed), loja de dados (localStorage)
```

> Os dados do demo ficam no `localStorage` do navegador (matérias de exemplo em `lib/seed.ts`). Para produção multiusuário, o próximo passo é plugar um banco de dados (Postgres/Supabase) e autenticação no /admin.
