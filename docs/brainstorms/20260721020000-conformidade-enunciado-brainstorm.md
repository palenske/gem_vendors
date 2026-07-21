# Brainstorm — Conformidade do Projeto vs Enunciado do Teste Técnico

## 1. What We're Building

Esta análise valida se o projeto "Localizador de Revendedoras" está fundamentado nos requisitos do teste técnico (`start/enunciado_teste.md`). O objetivo é mapear conformidade, identificar gaps críticos e definir o escopo do trabalho restante para atender todos os critérios de avaliação.

O teste técnico pede uma aplicação que permita ao usuário informar seu endereço e encontrar as revendedoras mais próximas, exibindo resultados em um mapa ou com link de rota. A aplicação deve ser construída com React/Next.js, TypeScript, Node.js e Git, com interface responsiva e tratamento adequado de erros.

## 2. Current State

### Backend (`apps/api`) — ✅ FUNCIONAL

| Componente | Status | Caminho |
|------------|--------|---------|
| Schema Prisma (Reseller model) | ✅ Completo | `apps/api/prisma/schema.prisma` |
| Seed script (CSV → Postgres + geocodificação) | ✅ Completo | `apps/api/prisma/seed.ts` |
| CEP lookup (ViaCEP) | ✅ Completo | `apps/api/src/modules/cep/cep.service.ts` |
| Geocoding (Nominatim) | ✅ Completo | `apps/api/src/modules/geo/geocoding.service.ts` |
| Haversine distance | ✅ Completo | `apps/api/src/modules/geo/geo.service.ts` |
| Search endpoint (GET /api/v1/resellers/search) | ✅ Completo | `apps/api/src/modules/resellers/resellers.service.ts` |
| Search DTO (CEP, rua, número, bairro) | ✅ Completo | `apps/api/src/modules/resellers/dto/search-resellers.dto.ts` |
| Response DTOs (com routeUrl) | ✅ Completo | `apps/api/src/modules/resellers/dto/reseller-response.dto.ts` |
| HttpExceptionFilter global | ✅ Completo | `apps/api/src/common/filters/http-exception.filter.ts` |
| ValidationPipe global | ✅ Completo | `apps/api/src/main.ts` |
| Unit tests | ✅ 6 arquivos spec | `apps/api/src/**/*.spec.ts` |
| E2E test | ✅ 1 arquivo | `apps/api/test/resellers-search.e2e-spec.ts` |

### Frontend (`apps/app`) — ❌ SCAFFOLD APENAS

| Componente | Status | Caminho |
|------------|--------|---------|
| Expo Router layout | ✅ Scaffold | `apps/app/app/_layout.tsx` |
| Tab screens | ❌ Placeholder (EditScreenInfo) | `apps/app/app/(tabs)/index.tsx` |
| Search form | ❌ NÃO EXISTE | — |
| Results list | ❌ NÃO EXISTE | — |
| Map component | ❌ NÃO EXISTE | — |
| NativeWind | ❌ NÃO INSTALADO | — |
| React Hook Form + Yup | ❌ NÃO INSTALADO | — |
| react-native-maps / react-leaflet | ❌ NÃO INSTALADO | — |
| API integration service | ❌ NÃO EXISTE | — |

### Shared (`packages/shared`) — ✅ FUNCIONAL

| Componente | Status | Caminho |
|------------|--------|---------|
| Types (Reseller, SearchResult, etc.) | ✅ Completo | `packages/shared/src/types/reseller.ts` |

### Documentação — ⚠️ INCOMPLETA

| Documento | Status | Caminho |
|-----------|--------|---------|
| architecture.md | ✅ Completo | `docs/architecture.md` |
| integrations.md | ✅ Completo | `docs/integrations.md` |
| infrastructure.md | ✅ Completo | `docs/infrastructure.md` |
| environments.md | ✅ Completo | `docs/environments.md` |
| glossary.md | ✅ Completo | `docs/glossary.md` |
| Root README.md | ❌ NÃO EXISTE | — |
| API README.md | ⚠️ Template padrão NestJS | `apps/api/README.md` |
| AI usage documentation | ❌ NÃO EXISTE | — |

### Git — ✅ FUNCIONAL

- Conventional Commits: ✅ (10 commits com `feat:`, `fix:`, `test:`, `chore:`)
- Versionamento: ✅ (histórico limpo e organizado)

## 3. Architecture & Infrastructure

A arquitetura backend está sólida e adere aos padrões do AGENTS.md:

- **Módulos NestJS** por domínio: `resellers`, `cep`, `geo`, `health`
- **Controller → Service** separation: controllers orquestram, services contêm lógica
- **DTOs validados** com class-validator + class-transformer
- **Prisma + PostgreSQL** via PrismaPg adapter
- **Geocodificação** apenas no seed (pré-computada), não em tempo de busca
- **Haversine** puro em memória (sem PostGIS)
- **Shared types** em `packages/shared`

**Gap arquitetural**: O frontend não possui nenhuma infraestrutura de busca, mapa ou integração com a API. Todo o trabalho de UI/UX precisa ser construído do zero.

## 4. Integration Impact

### Conformidade por Critério de Avaliação

| Critério | Peso | Status | Notas |
|----------|------|--------|-------|
| Funcionamento da busca e ordenação por distância | 25% | ✅ Backend OK | Frontend não expõe a busca |
| Qualidade do front-end e responsividade | 20% | ❌ NÃO ATENDIDO | Scaffold apenas, sem UI de busca |
| Organização e qualidade do código | 20% | ✅ Backend OK | Frontend é template padrão |
| Back-end, API e tratamento de dados | 15% | ✅ ATENDIDO | Completo e testado |
| Git, documentação e facilidade de execução | 10% | ⚠️ PARCIAL | Git OK, README ausente |
| Uso consciente de IA e diferenciais | 10% | ❌ NÃO ATENDIDO | Sem documentação de IA |

### Conformidade por Requisito Funcional

| Requisito | Status | Detalhe |
|-----------|--------|---------|
| Usar Base de Revendedoras | ✅ | CSV importado via seed |
| Busca por CEP | ✅ | DTO + service + ViaCEP |
| Busca por Rua/avenida | ✅ | DTO + service + Nominatim |
| Busca por Número | ✅ | DTO + service (incluído no geocoding) |
| Busca por Bairro | ✅ | DTO + service + Nominatim |
| Resultados ordenados por distância | ✅ | Haversine + sort |
| Exibir mapa ou link de rota | ⚠️ | routeUrl existe na API, mas frontend não exibe |
| Interface responsiva | ❌ | Frontend não implementado |
| Código componentizado | ⚠️ | Backend sim, frontend não |
| Projeto versionado | ✅ | Git com Conventional Commits |
| Tratamento de erros | ✅ | HttpExceptionFilter + validação |
| README com instruções | ❌ | Ausente |
| App publicada | ❌ | Não deployada |
| Documentar uso de IA | ❌ | Ausente |

## 5. Key Decisions

1. **✅ DECIDED:** Backend está completo e aderente ao enunciado — todos os endpoints funcionam, testados, com tratamento de erros
2. **✅ DECIDED:** A搜索 funciona por CEP, rua, número e bairro conforme solicitado
3. **✅ DECIDED:** Ordenação por distância via Haversine está implementada
4. **✅ DECIDED:** Route URL (Google Maps) é gerada no backend
5. **⚠️ OPEN:** Frontend precisa de implementação completa — search form, results list, map component
6. **⚠️ OPEN:** NativeWind, React Hook Form, Yup, react-native-maps/leaflet precisam ser instalados
7. **⚠️ OPEN:** Root README.md precisa ser criado com instruções de instalação/execução e documentação de IA
8. **⚠️ OPEN:** API README precisa ser substituído pelo template padrão NestJS

## 6. Open Questions

1. **Frontend scope**: O frontend deve ser implementado como parte desta validação, ou apenas documentado como gap?
2. **Deploy**: A aplicação precisa estar publicada para esta análise ser considerada completa?
3. **React Native vs Web**: O AGENTS.md define Expo + Expo Router. O teste pede "Next.js ou React" — Expo Web atende?

## 7. Next Steps

### Para atender 100% do enunciado:

1. **Instalar dependências frontend**: NativeWind, React Hook Form + Yup, react-native-maps (native) / react-leaflet (web)
2. **Implementar search form**: Formulário com campos CEP, rua, número, bairro
3. **Implementar results list**: Lista de revendedoras com distância
4. **Implementar map component**: Mapa com pins das revendedoras (Map.web.tsx / Map.native.tsx)
5. **Integrar com API**: Service para chamar GET /api/v1/resellers/search
6. **Criar root README.md**: Instruções de instalação, execução, decisões técnicas, uso de IA
7. **Substituir API README**: Remover template NestJS, adicionar documentação do projeto
8. **Responsividade**: Mobile-first com NativeWind breakpoints
9. **Deploy**: Publicar app (Vercel para web, Expo Go para mobile)

### Recomendação

Executar `/pwf-plan` para gerar plano de implementação do frontend e documentação restante.
