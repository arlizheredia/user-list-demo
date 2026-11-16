# Directorio de usuarios

**Demo:** https://arlizheredia.github.io/user-list-demo/

Pequeña aplicación en **React 19 + TypeScript** que consume la API pública
[JSONPlaceholder](https://jsonplaceholder.typicode.com/users):

1. Lista de usuarios con búsqueda por nombre (sin distinguir mayúsculas ni tildes).
2. Al elegir un usuario se muestran sus publicaciones y se puede crear una nueva
   mediante un formulario validado (título y texto obligatorios). Como la API no
   persiste los datos, la publicación nueva se añade al principio de la lista en local.
3. Estados de carga (esqueletos) y de error (con botón «Reintentar») visibles en
   cada petición.
4. 14 tests con Vitest + Testing Library (unitarios y de integración).

## Cómo ejecutarlo

Requisitos: [Bun](https://bun.sh) ≥ 1.3.

```bash
bun install        # instala dependencias
bun dev            # servidor de desarrollo en http://localhost:5173
bun run test       # ejecuta los tests una vez (bun run test:watch para modo watch)
bun run typecheck  # comprobación de tipos
bun run lint       # oxlint
bun run build      # build de producción en dist/ (incluye typecheck)
bun run preview    # sirve el build
```

Cada push a `main` ejecuta lint, tests y build en GitHub Actions y, si todo pasa,
publica la app en GitHub Pages (`.github/workflows/deploy.yml`).

> Usa `bun run test` (el script de Vitest), no `bun test`, que lanza el runner nativo de Bun.

## Stack

| Área | Elección |
| --- | --- |
| Build / dev | Vite 8, Bun como gestor de paquetes |
| UI | React 19, Tailwind CSS v4, componentes [shadcn](https://ui.shadcn.com) estilo `base-nova` |
| Primitivas accesibles | `@base-ui/react` (shadcn inicializado con `--base base`; **sin Radix**) |
| Iconos | `lucide-react` |
| Validación | `zod` 4 |
| Tests | Vitest 5, jsdom, Testing Library (`react`, `user-event`, `jest-dom`) |
| Lint | oxlint |

## Estructura

```
src/
├── App.tsx                    # Maqueta y estado de nivel superior
├── components/
│   ├── ui/                    # Componentes shadcn generados (Base UI)
│   ├── feedback/              # Carga, error con reintento, estado vacío
│   ├── users/                 # Lista, buscador y fila de usuario
│   └── posts/                 # Panel de detalle, formulario y lista de publicaciones
├── hooks/use-async.ts         # Hook de carga de datos cancelable
├── lib/
│   ├── schemas.ts             # Esquemas zod → tipos TypeScript
│   ├── api.ts                 # Cliente HTTP con validación de respuestas
│   ├── filter-users.ts        # Búsqueda por nombre
│   └── format.ts              # Iniciales para avatares
└── test/                      # Setup, fixtures y doble de fetch
```

## Decisiones

- **zod como fuente única de verdad.** Los tipos (`User`, `Post`, `NewPostInput`) se
  infieren de los esquemas. Además de validar el formulario, se validan las
  **respuestas de la API**: si cambiara su formato, la UI mostraría un error controlado
  en lugar de fallar en un render. Los esquemas solo declaran los campos que se usan.

- **Hook `useAsync` propio en lugar de una librería.** Para tres peticiones no
  compensaba añadir TanStack Query. El hook:
  - cancela la petición anterior con `AbortController` al cambiar de usuario o
    desmontar, lo que evita condiciones de carrera (ver publicaciones de A estando en B);
  - **deriva** el estado `loading` (el resultado guardado no pertenece a la petición
    actual) en vez de llamar a `setState` síncrono dentro del efecto, así nunca se
    pinta información de una petición anterior;
  - expone `retry` para el botón «Reintentar».

- **Formulario con `useActionState` (React 19).** La acción valida el `FormData` con
  zod y devuelve el nuevo estado; React gestiona el estado pendiente (botón
  deshabilitado con *spinner*). Como React reinicia el formulario tras cada acción,
  se devuelven los valores escritos cuando hay errores (para no perderlos) y valores
  vacíos tras un envío correcto. `noValidate` desactiva las burbujas nativas para
  mostrar mensajes coherentes, enlazados con `aria-invalid` y `aria-describedby`.

- **Publicaciones nuevas.** Se hace el `POST` real a la API (para ejercitar el flujo
  y sus errores) y la respuesta se guarda en local. JSONPlaceholder devuelve siempre
  `id: 101`, así que cada publicación local lleva un `localId` (`crypto.randomUUID()`)
  que se usa como `key`. Se guardan **por usuario en `App`**, de modo que no se
  pierden al cambiar de usuario y volver.

- **Búsqueda** insensible a mayúsculas y tildes (`normalize('NFD')`), con
  `useDeferredValue` para que el input no se bloquee si la lista creciera.

- **Accesibilidad.** Regiones `role="status"` durante la carga, `role="alert"` en los
  errores, `aria-pressed` en el usuario seleccionado, etiquetas en todos los campos y
  listas con nombre accesible. Los tests consultan por rol y etiqueta, así que
  también la verifican.

- **Tests sin red.** `fetch` se sustituye por un doble (`src/test/mock-fetch.ts`) que
  responde por ruta y método. Los tests de integración renderizan `<App />` completo y
  lo usan como lo haría una persona. Cubren: carga, búsqueda y estado vacío, error con
  reintento, carga de publicaciones, validación, creación (inserción al principio,
  `userId` enviado y formulario limpio) y fallo al guardar conservando lo escrito.

## Qué haría con más tiempo

- **TanStack Query** si la app creciera: caché entre selecciones, reintentos con
  *backoff*, invalidación y actualizaciones optimistas.
- **Selección en la URL** (`?user=3`) con un router, para poder compartir enlaces y usar
  el botón atrás.
- **MSW** en lugar del doble de `fetch`, para reutilizar los mismos *handlers* en tests,
  Storybook y desarrollo sin conexión.
- **Tests E2E** con Playwright (incluyendo comprobaciones de accesibilidad con axe) y CI
  en GitHub Actions con lint, typecheck, tests y build.
- **Paginación o virtualización** de publicaciones, edición/borrado de publicaciones y
  persistencia local (`localStorage`) de las creadas.
- Modo oscuro (las variables de tema de shadcn ya lo soportan) e internacionalización.

## Uso de la IA

He desarrollado el proyecto con **Claude Code** (Claude Opus 5.5) como asistente en
la terminal, con revisión de cada paso.

**Qué le pedí.** Le di el enunciado completo y las restricciones técnicas: Bun, shadcn
sobre `@base-ui/react` (no Radix), Tailwind, lucide-react, zod, Vitest, código
documentado en español, dependencias actualizadas y commits incrementales.

**Qué acepté.**
- La arquitectura por capas (esquemas → cliente API → hook → componentes) y el uso de
  `useActionState` para el formulario.
- El diseño del hook `useAsync` con estado derivado y cancelación.
- La batería de tests de integración centrada en el comportamiento visible.

**Qué corregí o verifiqué.**
- **CLI de shadcn bloqueado:** el primer `shadcn init` se quedó esperando un *prompt*
  interactivo. Lo relancé con `--preset nova` (el nombre `base-nova` no era válido como
  preset) y con stdin cerrado.
- **Dependencia inesperada:** shadcn generó `import { cn } from "cn"` en lugar del clásico
  `clsx` + `tailwind-merge`. Antes de aceptarlo comprobé en npm que `cn` es el paquete
  oficial del repositorio `shadcn-ui/cn`. También comprobé que ningún fichero importa Radix.
- **Código generado que no compilaba:** el componente `scroll-area` tenía un import sin
  usar que rompía `tsc`; como no lo necesitaba, lo eliminé.
- **Organización:** `getInitials` acabó inicialmente en `filter-users.ts`; lo moví a
  `format.ts`. Las dependencias que solo se usan en build (Tailwind, shadcn) pasaron a
  `devDependencies`.
- **Tests que pasan a la primera:** como los 14 tests pasaron sin fallos, introduje
  errores a propósito (quitar la validación del título e invertir el orden de la lista)
  para confirmar que los tests fallaban. Fallaron 3, como se esperaba.
- **Revisión visual:** recorrí el flujo real contra la API con un navegador sin interfaz
  (búsqueda, selección, validación y creación, en escritorio y móvil). Así vi que el
  contador de usuarios no reflejaba el filtro y lo cambié a «2 / 10».
