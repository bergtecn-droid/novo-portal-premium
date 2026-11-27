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

## 🔐 Painel admin protegido por senha

O `/admin` exige login.

- Senha padrão do demo: `nova-admin-2025` — troque em produção!
- **Trocar pelo painel:** painel admin → seção **"🔑 Senha do administrador"**
  (pede a senha atual + a nova; precisa da nuvem/Vercel Blob ativa).
- Alternativa: variável de ambiente `ADMIN_PASSWORD` (Vercel: *Project →
  Settings → Environment Variables*) + redeploy.
- A sessão dura 30 dias (cookie `HttpOnly`). Ao trocar a senha, a antiga deixa
  de valer em todos os aparelhos.

## 🔒 Bloqueio do portal (site inteiro com senha)

Além do painel, o SITE PÚBLICO também pode ser trancado: o visitante só vê as
matérias depois de digitar a senha de acesso.

- **Como ligar:** painel admin → seção **"🔒 Bloqueio do portal"** → crie a
  senha de acesso e clique em **Bloquear o portal**.
- **Como desligar:** mesma seção → **Desbloquear o portal** (ou crie outra senha
  com "Trocar senha").
- O `/admin` nunca é bloqueado (continua com a senha do administrador).
- O bloqueio vale para **todos os visitantes** quando a nuvem (Vercel Blob)
  está ativa — a senha de acesso sobe junto com as configurações.
- Alternativa rápida sem nuvem: variável de ambiente `PORTAL_LOCK_PASSWORD`
  (Vercel: *Settings → Environment Variables*) + redeploy.

## 🎨 Temas sazonais

O portal tem 9 temas (Padrão, Natal, Ano Novo, Páscoa, Festa Junina, Verão, Outono, Inverno, Primavera) que trocam a cor de destaque de todo o site.

- Configurado no painel admin → seção **"🎨 Tema do portal"**.
- Modo **Automático**: o tema muda sozinho pelo calendário (Natal em dezembro, Ano Novo em janeiro, Páscoa em abril, Junina em junho/julho e as estações no resto do ano).
- As cores são variáveis CSS (`--accent`, `--accent-soft`, `--accent-deep`, `--accent-wash`, `--accent-strong`) definidas em `app/globals.css` — novos temas são uma linha nova de CSS.

## 🌐 Acessos

- Portal: `https://novo-portal-premium.vercel.app`
- Admin: `https://novo-portal-premium.vercel.app/admin`

## 🗄️ Armazenamento na nuvem (compartilhamento entre dispositivos)

As matérias publicadas pelo painel sincronizam automaticamente com o servidor
quando o armazenamento Vercel Blob está ativado (até lá, ficam salvas no
navegador de quem publicou).

### Ativar em 2 minutos (no plano Hobby, grátis):

1. Acesse o projeto em [vercel.com/dashboard](https://vercel.com/dashboard)
2. Aba **Storage** → **Create Database** → escolha **Blob** → **Continue**
   → nome qualquer (ex: `portal-nova`) → **Create**
3. Na tela seguinte, clique em **Connect to Project** e selecione
   `novo-portal-premium` → **Connect**
4. Faça um **Redeploy** (aba Deployments → ⋯ → Redeploy) para a variável
   `BLOB_READ_WRITE_TOKEN` ser injetada

Pronto: ao publicar matéria no painel, ela sobe para o servidor e o link
compartilhado no WhatsApp abre para qualquer pessoa (com foto na prévia,
quando a capa estiver disponível publicamente).
