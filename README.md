# ⚽ PrimeFutebol

**Dashboard moderno para acompanhar o Campeonato Brasileiro Série A** — classificação atualizada, jogos da rodada atual (com placares ao vivo), calendário das próximas rodadas e artilheiros do campeonato.

![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)

---

## 🚀 Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| **Next.js** | 14 (App Router) | Framework React com SSR |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3 | Estilização utilitária + glassmorfismo |
| **Prisma** | 7 | ORM type-safe com PostgreSQL |
| **PostgreSQL** | — | Banco de dados (Neon) |
| **TanStack Query** | 5 | Cache e revalidação no frontend |
| **react-hot-toast** | 2 | Notificações |
| **p-limit** | 7 | Controle de concorrência em chamadas API |

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

---

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | Conexão PostgreSQL (Neon) | ✅ |
| `FOOTBALL_API_URL` | URL base da API (`https://api.football-data.org/v4`) | Para sync |
| `FOOTBALL_API_KEY` | Chave da API Football-Data.org | Para sync |
| `COMPETITION_CODE` | Código da competição (`BSA` = Brasileirão Série A) | Para sync |

### API Football-Data.org

O sistema usa a [Football-Data.org](https://www.football-data.org/) v4.

- **Free tier**: 10 requisições/minuto
- A sincronização busca dados de times, classificação, partidas e artilheiros
- Os dados ficam persistidos no PostgreSQL — o frontend sempre lê do banco
- As requisições à API externa rodam em **paralelo com limite de 2** (`p-limit`)

---

## 🔄 Arquitetura de Dados

```
API externa (Football-Data.org)
       │
       ▼
  POST /api/sync  ou  GET /api/cron  (agendado externamente)
       │
       ▼
  syncFootballData() — p-limit(2) — console.time() logs
       │
       ▼
  PostgreSQL (Neon)
       │
       ▼
  GET /api/standings, /api/matches/*, /api/scorers
       │
       ▼
  Frontend (React Query com staleTime)
```

### Sincronização Automática

- **Externo**: Configure um serviço gratuito como [cron-job.org](https://cron-job.org) para chamar `GET /api/cron` a cada 90 segundos
- **Manual (admin)**: Painel oculto com atalho `Ctrl+Shift+ç` — veja seção abaixo

---

## 🕹️ Painel Admin (oculto)

Um painel flutuante invisível para forçar sincronização manualmente:

- **Atalho**: `Ctrl + Shift + ç` (tecla "ç" do teclado ABNT2)
- **Console do navegador**: digite `__toggleAdminPanel()`
- **Botões**:
  - **Forçar Sync API** — busca dados da Football-Data.org e salva no banco
  - **Atualizar do Banco** — recarrega as queries do frontend (sem chamar API externa)
- Mostra timestamp e estatísticas do último sync forçado

---

## 📁 Estrutura de Pastas

```
primefutebol/
├── prisma/
│   ├── schema.prisma       # Modelagem do banco
│   └── migrations/         # Migrações PostgreSQL
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout global + header
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── providers.tsx   # Providers (React Query + Toaster)
│   │   ├── globals.css     # Estilos globais
│   │   ├── proximas-rodadas/
│   │   │   └── page.tsx    # Página de próximas rodadas
│   │   └── api/
│   │       ├── cron/route.ts           # Endpoint para cron externo
│   │       ├── sync/route.ts           # Sync manual (POST)
│   │       ├── standings/route.ts
│   │       ├── scorers/route.ts
│   │       └── matches/
│   │           ├── current-round/route.ts
│   │           └── upcoming/route.ts
│   ├── components/
│   │   ├── ui/             # Primitivos (BentoCard, GlassPanel, Badge)
│   │   ├── AdminPanel.tsx  # Painel admin oculto
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
├── prisma.config.ts        # Config do Prisma CLI
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
- ✅ **Sincronização automática** via cron externo a cada 90s
- ✅ **Painel admin oculto** com `Ctrl+Shift+ç`
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

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) |
| `FOOTBALL_API_KEY` | Chave da API Football-Data.org |
| `COMPETITION_CODE` | `BSA` |

### Cron na Vercel

Como a Vercel é serverless, o `node-cron` não funciona. Use um serviço externo gratuito:

1. Acesse [cron-job.org](https://cron-job.org) e crie uma conta
2. Crie um cron job com:
   - **URL**: `https://seu-dominio.vercel.app/api/cron`
   - **Intervalo**: a cada 1 minuto (ou 2 minutos)
   - **Método**: `GET`
3. Pronto — o sync rodará automaticamente

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

MIT — 2025 Primefox Soluções em T.I.
