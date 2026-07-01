# ⚽ PrimeFutebol

**Dashboard moderno para acompanhar o Campeonato Brasileiro Série A** — classificação atualizada, jogos da rodada atual (com placares ao vivo), calendário das próximas rodadas e artilheiros do campeonato.

![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma) ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

---

## 🚀 Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| **Next.js** | 14 (App Router) | Framework React com SSR |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3 | Estilização utilitária + glassmorfismo |
| **Prisma** | 5 | ORM type-safe com SQLite |
| **SQLite** | — | Banco de dados local |
| **TanStack Query** | 5 | Cache e revalidação no frontend |
| **react-hot-toast** | 2 | Notificações |

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/freddymais/primefutebol.git
cd primefutebol

# Instale as dependências
npm install

# Copie o arquivo de ambiente e configure sua chave da API
cp .env.example .env

# Execute as migrações do banco
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **[http://localhost:3000](http://localhost:3000)**

> **Nota:** O banco inicia vazio. Clique no botão **"Sincronizar Resultados"** no dashboard para buscar dados da API Football-Data.org (times, classificação, partidas, artilheiros).

---

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | Conexão SQLite (`file:./prisma/dev.db`) | ✅ |
| `FOOTBALL_API_URL` | URL base da API (`https://api.football-data.org/v4`) | Para sync |
| `FOOTBALL_API_KEY` | Chave da API Football-Data.org | Para sync |
| `COMPETITION_CODE` | Código da competição (`BSA` = Brasileirão Série A) | Para sync |

### API Football-Data.org

O sistema usa a [Football-Data.org](https://www.football-data.org/) v4.

- **Free tier**: 10 requisições/minuto, dados de times, classificação, partidas e artilheiros
- O botão "Sincronizar" no dashboard dispara a sync completa
- A sync persiste os dados no SQLite local — não é necessário re-sincronizar a cada acesso

---

## 📁 Estrutura de Pastas

```
primefutebol/
├── prisma/
│   ├── schema.prisma       # Modelagem do banco
│   └── dev.db              # Banco SQLite local
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout global + header
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── providers.tsx   # Providers (React Query + Toaster)
│   │   ├── globals.css     # Estilos globais
│   │   ├── proximas-rodadas/
│   │   │   └── page.tsx    # Página de próximas rodadas
│   │   └── api/
│   │       ├── standings/route.ts
│   │       ├── scorers/route.ts
│   │       ├── matches/
│   │       │   ├── current-round/route.ts
│   │       │   └── upcoming/route.ts
│   │       └── sync/route.ts
│   ├── components/
│   │   ├── ui/             # Primitivos (BentoCard, GlassPanel, Badge)
│   │   ├── StandingsTable.tsx
│   │   ├── TopScorersTable.tsx
│   │   ├── MatchCard.tsx
│   │   └── SyncButton.tsx
│   ├── lib/
│   │   ├── db.ts           # Camada de acesso a dados
│   │   ├── types.ts        # Tipos e utilitários
│   │   └── footballApiAdapter.ts  # Integração com Football-Data.org
│   └── types/
│       └── css.d.ts        # Declaração de tipos para CSS
├── public/
│   └── logoPrime.png       # Logo do app
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
└── README.md
```

---

## 📊 Funcionalidades

- ✅ **Dashboard** com classificação, rodada atual e artilheiros
- ✅ **Tabela completa** com PG, J, V, E, D, GP, GC, SG, últimos 5 jogos
- ✅ **Zonas destacadas** (G4, G6, Sul-americana, Z4)
- ✅ **Placares ao vivo** com badge pulsante
- ✅ **Artilheiros do campeonato** com ranking e barra de gols
- ✅ **Sincronização manual** com botão e feedback toast
- ✅ **Próximas rodadas** com seletor e visualização completa
- ✅ **Responsivo** — colapsa para coluna única em mobile
- ✅ **Glassmorfismo** com microinterações e transições
- ✅ **Skeleton loaders** em todos os componentes

---

## 🚢 Deploy

### Vercel

```bash
npm i -g vercel
vercel
```

Configure as variáveis de ambiente no painel da Vercel:
- `DATABASE_URL`: `file:./prisma/dev.db` (SQLite funciona apenas em ambientes com filesystem persistente)
- `FOOTBALL_API_KEY`: sua chave
- `COMPETITION_CODE`: `BSA`

> ⚠️ SQLite não é recomendado para produção em plataformas serverless (Vercel, Netlify). Para produção real, considere migrar para PostgreSQL ou Turso.

---

## 🎨 Design System

### Glassmorfismo

- Fundo: `backdrop-filter: blur(16px)` com `rgba(255,255,255,0.06)`
- Borda: 1px com `rgba(255,255,255,0.12)`
- Border-radius: 16px–20px
- Sombra suave e difusa

### Paleta

| Cor | Hex | Uso |
|---|---|---|
| Deep | `#0B0E14` | Fundo principal |
| Green | `#00E676` | G4/Libertadores, acentos |
| Yellow | `#FFD600` | Acentos secundários |
| Blue | `#448AFF` | Sul-americana |
| Red | `#FF5252` | Zona de rebaixamento |

---

## 📄 Licença

MIT — 2025 PrimeFutebol
