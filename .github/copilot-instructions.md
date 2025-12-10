## Visão rápida do projeto

- Estrutura: app/ é um app React + TypeScript criado com Vite. Código-fonte em `app/src/`.
- Ferramentas principais: Vite (dev/build), TypeScript, React 19, React Router, TailwindCSS, Axios.

## Onde começar (arquitetura e papéis)

- Ponto de entrada: `app/src/main.tsx` — envolve `AuthProvider` e `BrowserRouter`.
- Rotas principais: `app/src/App.tsx` — páginas: `/login`, `/register`, `/operador`, `/admin`.
- Autenticação global: `app/src/context/AuthContext.tsx` (usa localStorage keys `token` e `user`). Use `useAuth()` (em `app/src/context/useAuth.ts`) para acessar `user`, `token`, `login`, `logout`.
- Chamadas HTTP: `app/src/services/api.ts` exporta uma instância Axios com `baseURL` a partir de `VITE_API_URL` e um interceptor que injeta o header `Authorization: Bearer <token>` a partir de `localStorage`.

## Padrões e convenções úteis (projetospecific)

- Sempre importe a instância `api` de `app/src/services/api.ts` para chamadas ao backend — isso garante o header de autenticação automático.
- Respostas de login esperadas: objeto com `access_token` e `user` (veja `AuthContext.login`). Ao integrar, alinhe com esse shape.
- Chaves de localStorage: `token` e `user` (JSON stringified). Não altere sem atualizar `AuthContext`.
- Rotas privadas: use o componente `PrivateRouter` (`app/src/components/PrivateRouter.tsx`) que verifica `isAuthenticated` do contexto.
- Componentes de UI seguem padrões simples:
  - Modais retornam `null` quando fechados (ex.: `RNCModal.tsx`).
  - Tabelas recebem props tipadas (`RNCTable.tsx` usa `RNCTableProps` em `app/src/types/rncTable.ts`).
- Dados de domínio (tipos) estão em `app/src/types/` — preferir reutilizá-los ao criar novas chamadas/estado.

## Fluxos de dados e exemplos concretos

- Buscar peça por código (debounce): `RNCModal.tsx` faz `GET /part/code/{code}` com debounce de ~900ms — siga esse padrão ao implementar busca automática.
- Criar RNC: `RNCModal` envia `POST /rnc/create_rnc` com payload contendo `part_id`, `title`, `observations`, `critical_level`, `date_of_occurrence`, `open_by_id`, `condition`.
- Exemplo mínimo de chamada usando convenção do projeto:

  import api from "../services/api";
  const res = await api.get(`/part/code/${code}`); // usa baseURL + interceptors

- Verifique diferenças de rota: em arquivos aparecem `/part/code/` e comentários com `/parts/` — sempre confirmar a API backend antes de codar.

## Comandos dev / build / lint

- No diretório `app/` use (npm/yarn/pnpm conforme preferência):

  npm run dev    # inicia Vite (desenvolvimento com HMR)
  npm run build  # roda `tsc -b` e `vite build`
  npm run preview
  npm run lint

- Variáveis de ambiente:
  - `VITE_API_URL` controla o `baseURL` do Axios (`app/src/services/api.ts`). Padrão fallback: `http://localhost:8000`.

## Boas práticas para o agente (instruções específicas)

- Reutilizar tipos existentes: antes de criar novos types, procure em `app/src/types/`.
- Reutilizar `api` sempre que fizer requisições HTTP, não crie instâncias Axios alternativas sem necessidade.
- Ao modificar autenticação, atualize tanto `AuthContext.tsx` quanto quaisquer chamadas diretas que setem `api.defaults.headers.common`.
- Ao adicionar telas, registre a rota em `app/src/App.tsx`. Use `PrivateRouter` para rotas que requerem autenticação.
- Padrão de texto: mensagens/labels estão em português; preserve o idioma ao gerar UI.

## Erros comuns encontrados no código (para evitar)

- Hardcode de token/headers: use o fluxo de `AuthContext`/`api` para consistência.
- Endpoints inconsistentes: confira `/part/code/` vs `/parts/` antes de integrar.

## Arquivos importantes para referência rápida

- `app/src/services/api.ts` — instância Axios e interceptor
- `app/src/context/AuthContext.tsx` — login/logout e persistência
- `app/src/types/` — shapes de dados (user, rnc, part, rncModal, rncTable)
- `app/src/components/RNCModal.tsx`, `RNCTable.tsx`, `PrivateRouter.tsx`
- `app/src/App.tsx`, `app/src/main.tsx`

Se alguma parte estiver incompleta ou há endpoints/backend que eu não consegui ver, me diga qual rota/funcionalidade devemos alinhar e eu atualizo estas instruções conforme necessário.
