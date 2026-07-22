# Localizador de Revendedoras

Aplicação para encontrar revendedoras próximas ao endereço informado. Suporta busca por CEP, rua, número e bairro, com ordenação por distância e mapa interativo.

## Uso de Inteligência Artificial

A IA foi utilizada para auxiliar no desenvolvimento de componentes e código padrões, mas todas as decisões foram revisadas e validadas manualmente. Não há uso de credenciais de IA no projeto.

---

## Tecnologias

- **Frontend:** React Native, Expo, TypeScript
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL
- **Arquitetura:** Monorepo com pnpm workspaces

---

## Pré-requisitos

- Node.js 18+
- npm ou pnpm
- PostgreSQL (instalar localmente ou configurar no Railway/Supabase)

---

## Instalação

1. **Clone o repositório:**

```bash
git clone <URL_DO_REPOSITORIO>
cd localizador-revendedoras
```

2. **Instale as dependências:**

```bash
pnpm install
```

---

## Configuração

1. Copie o arquivo de exemplo:

```bash
cp apps/api/.env.example .env
```

2. Edite o `.env` e configure o PostgreSQL:
   - Se tiver local: Instalar PostgreSQL e criar banco `localizador_revendedoras`
   - Se usar online: Cole a connection string do seu banco

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/localizador_revendedoras?schema=public"
NOMINATIM_USER_AGENT="localizador-revendedoras-dev"
```

---

## Execução

### 1. Criar tabelas no banco

```bash
cd apps/api
pnpm prisma migrate dev
```

### 2. Popular o banco com dados

```bash
cd apps/api
pnpm prisma:seed
```

Isso vai criar 200 revendedoras fictícias no banco.

### 3. Iniciar a API

Em uma terminal:

```bash
cd apps/api
pnpm start:dev
```

A API vai rodar em `http://localhost:3000`

### 4. Iniciar o aplicativo

Em outra terminal:

```bash
cd apps/app
pnpm web
```

Ou para mobile:

```bash
cd apps/app
pnpm start
```

### 5. Acessar

**Web:** Acesse `http://localhost:8081`

**Mobile:** Instale o [Expo Go](https://expo.dev/go) e escaneie o QR code

---

## Como testar

1. Preencha o formulário com:
   - CEP: `01001-001` (São Paulo)
   - Ou Rua: `Avenida Paulista`, Número: `1000`, Bairro: `Bela Vista`

2. Clique em "Buscar Revendedoras"

3. Veja a lista de revendedoras ordenadas por distância

4. Clique em "Ver rota" para abrir no Google Maps

---

## Estrutura do projeto

```
localizador-revendedoras/
├── apps/
│   ├── api/          # Backend (NestJS)
│   └── app/          # Frontend (React Native + Expo)
├── packages/
│   └── shared/       # Tipos compartilhados
├── data/
│   └── Base_200_Revendedoras_Fake.csv
└── docs/             # Documentação técnica
```

---

## Scripts disponíveis

```bash
# Instalar dependências
pnpm install

# Iniciar API
pnpm --filter api start:dev

# Iniciar App (web)
pnpm --filter app web

# Iniciar App (mobile)
pnpm --filter app start

# Rodar testes
pnpm test

# Criar migrates
cd apps/api && pnpm prisma migrate dev
```

---

## Documentação adicional

- `docs/architecture.md` — Arquitetura do sistema
- `docs/integrations.md` — APIs externas utilizadas (ViaCEP, Nominatim)
- `apps/app/DESIGN.md` — Design system e cores

---

## Decisões técnicas

O projeto utiliza **React Native + Expo** em vez de Next.js/React puro, conforme diferencial solicitado no enunciado. Isso permite desenvolvimento mobile nativo com suporte a web através do Expo Web.