# Localizador de Revendedoras

Aplicação para encontrar revendedoras próximas ao endereço informado. Suporta busca por CEP, rua, número e bairro, com ordenação por distância e mapa interativo.

## Uso de Inteligência Artificial

### Como a IA foi utilizada

**1. Planejamento e Arquitetura**
- A IA auxiliou na planificação e implementação do projeto, com base na arquitetura definida pelo desenvolvedor
- O opencode com harness customizado (conjunto de regras, workflows e skills) foi utilizado no fluxo:
  - Brainstorm → Definições conceituais (revisão manual) → Construção de plano → Implementação → Revisão
- Arquitetura, integrações e escolha das tecnologias e frameworks foram estruturadas pelo desenvolvedor, com base em sua experiência, definindo um prompt inicial com toda a estrutura detalhada

**2. Desenvolvimento de Scripts**
- IA utilizada para codificar o script de conversão da base CSV em seed do Prisma
- Script popula a base de dados com 200 revendedoras fictícias, incluindo geocodificação automática via Nominatim

**3. Stack de Testes**
- IA auxiliou no desenvolvimento da stack de testes de integração com Jest + Supertest
- Testes E2E cobrem todas as principais rotas da API: health, CEP lookup, e busca de revendedoras

### Decisões Revisadas Manualmente

Todas as decisões críticas foram revisadas e validadas manualmente pelo desenvolvedor:
- Arquitetura do monorepo e separação de responsabilidades
- Escolha das tecnologias (NestJS, React Native/Expo, Prisma, PostgreSQL)
- Definição do design system e componentes
- Estrutura de componentes e organização do código
- Validação de schemas de dados e DTOs

### Uso de Credenciais

Não há uso de credenciais de IA (API keys, tokens) no projeto. Todas as decisões foram validadas manualmente sem dependência de serviços externos de IA.

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
git clone https://github.com/palenske/gem_vendors.git
cd gem_vendors/revendedoras
```

> **Nota**: Repositório: https://github.com/palenske/gem_vendors

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

A API vai rodar em `http://localhost:3000` (não está deployada em produção no momento)

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

**Web (Local):** Acesse `http://localhost:8081`

**Web (Deployed):** A aplicação frontend está disponível em produção em [https://gem-vendors.vercel.app/](https://gem-vendors.vercel.app/)

**Mobile:** Instale o [Expo Go](https://expo.dev/go) e escaneie o QR code

---

## Como testar

 1. Preencha o formulário com:
    - CEP: `01001-001` (São Paulo)
    - Ou Rua: `Avenida Paulista`, Número: `1000`, Bairro: `Bela Vista`

 2. Clique em "Buscar Revendedoras"

 3. Veja a lista de revendedoras ordenadas por distância

 4. Clique em "Ver rota" para abrir no Google Maps

**Nota:** Testes E2E disponíveis em `/apps/api/test/resellers-search.e2e-spec.ts`

---

## Aplicação Online

A aplicação frontend está deployada e funcionando em produção:

**[Localizador de Revendedoras — Vercel](https://gem-vendors.vercel.app/)**

- **URL:** https://gem-vendors.vercel.app/
- **Stack:** React Native + Expo (Expo Web)
- **Funcionalidades:**
  - Busca por CEP, Rua, Número, Bairro
  - Ordenação por distância
  - Mapa interativo
  - Design system responsivo

> **Nota:** Atualmente, apenas o frontend está deployado. O backend (API) não está acessível na URL https://gem-vendors-api.up.railway.app/. Para testar a busca de revendedoras funcionalmente, você deve executar o projeto localmente com a API rodando.

---

## Estrutura do projeto

```
gem_vendors/revendedoras/
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
- `docs/checklist-revisao.md` — Checklist de revisão do projeto
- `apps/app/DESIGN.md` — Design system e cores

## Testes

O projeto possui:
- **Testes unitários** (7 arquivos .spec.ts) para cada módulo
- **Teste E2E** em `/apps/api/test/resellers-search.e2e-spec.ts` para busca de revendedoras
- **Script de seed** para popular o banco de dados com 200 revendedoras fictícias

Para rodar os testes:

```bash
# Testes unitários
pnpm test

# Testes unitários específicos
cd apps/api
pnpm test
```

## Links de Acesso

- **Aplicação Web:** https://gem-vendors.vercel.app/
- **Repositório Git:** https://github.com/palenske/gem_vendors
- **Clone HTTP:** https://github.com/palenske/gem_vendors.git

**Nota:** O backend não está acessível em produção. Para testar a busca de revendedoras, execute o projeto localmente.

---

---

## Decisões Técnicas

O projeto utiliza **React Native + Expo** em vez de Next.js/React puro, conforme diferencial solicitado no enunciado. Isso permite desenvolvimento mobile nativo com suporte a web através do Expo Web.

### Por que React Native/Expo?

- Desenvolvimento mobile nativo com componente reutilizável entre web e mobile
- Pré-configuração de ambiente de desenvolvimento e configuração
- Suporte a Expo Go para testes rápidos no dispositivo
- Capacidade de publicar aplicação web através do Expo Web
- Deploy em Vercel com Expo Web (pré-configurado)

### Por que NestJS?

- Arquitetura baseada em módulos com boas práticas de desenvolvimento
- Integração nativa com TypeScript
- ORM Prisma para abstração do banco de dados
- Fácil testabilidade com Jest e Supertest

### Por que PostgreSQL + Prisma?

- PostgreSQL para robustez e performance em queries de geolocalização
- Prisma para mapeamento de tipos seguro e migrações versionadas
- PrismaPg adapter específico para PostgreSQL 7.x

---

## Deploy e Publicação

### Aplicação Online

A aplicação **frontend** está publicada e funcionando em produção:

- **Frontend (Vercel):** [https://gem-vendors.vercel.app/](https://gem-vendors.vercel.app/)
- **Repositório:** https://github.com/palenske/gem_vendors
- **Clone HTTP:** https://github.com/palenske/gem_vendors.git

### Status do Backend

O backend **não está** deployado na URL https://gem-vendors-api.up.railway.app/ no momento. Para testar a busca de revendedoras de forma completa, é necessário executar o projeto localmente.

### Como ela foi deployada

**Frontend (Vercel):**
- Expo Web build automatizado via Vercel
- Deploy continuo com git integration (repositório: https://github.com/palenske/gem_vendors)

**Backend (em desenvolvimento):**
- NestJS API rodando localmente em desenvolvimento
- Configuração de PostgreSQL e Prisma para desenvolvimento local
- Scripts de seed e testes configurados

### Deploy Local (para desenvolvimento)

**Para API:**
 1. Configurar PostgreSQL local ou online
 2. Criar arquivo `.env` com variáveis:
    ```env
    DATABASE_URL="postgresql://usuario:senha@localhost:5432/localizador_revendedoras?schema=public"
    NOMINATIM_USER_AGENT="localizador-revendedoras-dev"
    ```
 3. Iniciar API:
    ```bash
    cd apps/api
    pnpm start:dev
    ```

**Para Frontend (web):**
```bash
cd apps/app

# Iniciar em modo desenvolvimento
pnpm web

# O servidor web local ficará disponível em http://localhost:8081
```

**Para Frontend (mobile):**
```bash
cd apps/app

# Iniciar em modo desenvolvimento
pnpm start
```

---

## Contribuindo

Este é um projeto técnico/acadêmico para avaliação de competências. Pull requests não são aceitos.

---

## Licença

Este é um projeto de avaliação técnica.