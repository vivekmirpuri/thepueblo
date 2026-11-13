<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas del proyecto (hackathon)

Lee antes de editar: `CONTEXT.md` (qué y por qué), `ARCHITECTURE.md` (cómo) y `PLAN.md` (tareas y bloques).

- La documentación (`*.md`) se escribe en español. El código y sus comentarios, en inglés.
- **Todo el texto que ve el usuario va en español**: etiquetas, botones, mensajes de error, `aria-label`, textos alternativos. Los identificadores del código (ids de categoría, nombres de variables) siguen en inglés. Fechas con `Intl.DateTimeFormat("es-ES", …)`. El `<html lang="es">` ya está puesto.
- Escribe en lectura fácil: frases cortas, palabras corrientes, sin tecnicismos, y lenguaje inclusivo ("personas" mejor que "usuarios").
- Los archivos compartidos (`package.json`, `src/app/layout.tsx`, `globals.css`, `src/lib/*` salvo `src/lib/ai`, `src/components/ui`, `src/components/shared`, configuraciones, workflows) solo se cambian con el visto bueno explícito del usuario.
- Se trabaja directamente en `develop` y se hace push sin pull request. Antes de cada push: `git pull --rebase origin develop` y `npm run lint && npm run build`. `main` solo recibe `develop` (`git push origin develop:main`) cuando el usuario lo pida.
- Solo exportación estática: sin rutas de API, server actions, APIs de servidor en tiempo de petición ni segmentos dinámicos (`[id]`); usa parámetros `?id=`.
- Interfaz: usa los componentes de `src/components/ui/` (shadcn/ui, preset `base-nova`, sobre Base UI: no hay `asChild`, usa la prop `render`). Añade los que falten con `npx shadcn@latest add <nombre>`. Iconos: `lucide-react`. Animación: `motion/react`, con moderación. Avisos: `sonner`. Mapa: `react-map-gl/maplibre`. Estilos con tokens del tema (`bg-background`, `text-muted-foreground`), nunca colores hexadecimales. No añadas otro kit de interfaz.
- Los archivos marcados PLACEHOLDER empiezan con un comentario que dice qué construir y con qué librerías; síguelo y borra la palabra PLACEHOLDER cuando el archivo sea real. Las funciones que llaman a `todo()` aún no existen.
- Las páginas (`src/app/**/page.tsx`) son contenedores que cargan datos y guardan estado; los componentes de `src/components/` solo reciben props; solo `src/lib/` habla con Firebase o con el modelo.
- Referencia de componentes de shadcn: https://ui.shadcn.com/docs/components
- Mantén estables los contratos de `PLAN.md`; si hay que cambiar uno, dilo antes de cambiarlo.
- Nunca subas claves de cuentas de servicio ni las leas en la conversación.
