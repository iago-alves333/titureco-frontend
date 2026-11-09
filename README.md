# Titureco — Frontend

Interface web da plataforma **Titureco** para descoberta geoespacial, reserva e avaliação de atrações turísticas com guias locais.

## Principais Funcionalidades

- **Turista:**
  - Feed paginado (`useInfiniteQuery`) com busca com debounce e ordenação sincronizada na URL (`?q=&sort=`).
  - Mapa interativo (**Leaflet + MarkerCluster**) para buscar atrações próximas por raio em km (PostGIS), com marcador de posição atual, círculo de alcance e lista lateral sincronizada.
  - Reserva de passeios por data/horário e gestão em **Minhas Reservas** (filtro por status e cancelamento).
  - Avaliações (1 a 5 estrelas + comentário) habilitadas após conclusão da reserva, com suporte a edição e exclusão do próprio review.
- **Guia:**
  - Dashboard com indicadores, gráfico de distribuição de reservas por status, edição e exclusão de atrações.
  - Cadastro e edição de atrações diretamente no mapa interativo.
  - Gestão de participantes por atração (confirmação e conclusão de reservas).
- **Admin:**
  - Painel administrativo (`/admin/users`) para listagem paginada de usuários, promoção de turistas a guias e exclusão com validação de vínculos.
- **Autenticação & UX:**
  - JWT com rotação automática de `refreshToken` em interceptor Axios (fila única para chamadas concorrentes em `401`).
  - Validação de formulários espelhando a API com **React Hook Form + Zod**.
  - Tema claro/escuro persistido e código dividido por rota (`React.lazy`).

## Stack Tecnológica

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** + **shadcn/ui** (`@base-ui/react`)
- **TanStack Query v5** (cache, paginação infinita e invalidação)
- **React Hook Form** + **Zod**
- **React Leaflet v5** + **Leaflet.markercluster**
- **Sonner** (notificações toast)

## Como executar localmente

1. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Instale as dependências e inicie o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```
3. Scripts disponíveis:
   - `npm run dev` — servidor local em `http://localhost:5173`
   - `npm run build` — checagem de tipos (`tsc -b`) e build de produção com code-splitting
   - `npm run lint` — análise estática com `oxlint`
   - `npm test` — testes unitários com o runner nativo do Node (`node --test`)
