# thePueblo — hackathon

Next.js (React + TypeScript + Tailwind) → exportación estática → Firebase Hosting.

- **Producción** (`main`): https://thepueblo-6f94e.web.app
- **Pruebas** (`develop`): https://thepueblo-6f94e--develop-1ttzfnbg.web.app
- **Vistas previas:** cada pull request recibe su propia URL temporal, publicada como comentario en el PR.

| Lee esto | Para |
|---|---|
| [CONTEXT.md](CONTEXT.md) | Qué construimos y por qué |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, paquetes, modelo de datos, IA local, hosting |
| [PLAN.md](PLAN.md) | Fases, los tres bloques de tareas, guion de la demo |

## Puesta en marcha (una vez)

```bash
git clone https://github.com/vivekmirpuri/thepueblo.git && cd thepueblo
npm install
npm run dev   # http://localhost:3000
```

Firebase está listo para usar desde `src/lib/firebase.ts` (`auth`, `db`, `storage`).

## Cómo trabajamos sin pisarnos

1. **Sal de `develop` y nunca hagas push a `main` ni a `develop`.** `git switch develop && git pull && git switch -c <nombre>/<funcionalidad>` → push → abre un PR hacia `develop` → revisa la URL de vista previa → fusiona con "Squash and merge". Cuando el entorno de pruebas funcione, `develop` pasa a `main` con un PR (merge commit, no squash). Las dos ramas exigen un PR y la compilación en verde.
2. **Archivos compartidos = PR pequeños, avisa antes en el chat:** `package.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/*`, `src/components/ui/`, `src/components/shared/`, `next.config.ts`, `firebase.json`.
3. **Actualiza a menudo:** `git pull --rebase origin develop` antes de empezar y antes de abrir un PR. Los PR pequeños se fusionan rápido y casi nunca chocan.

## Comandos útiles

```bash
npm run dev                      # web en local
npm run lint && npm run build    # lo que ejecuta el CI
node scripts/rules-check.mjs     # prueba las reglas de seguridad desplegadas
```

Las reglas de seguridad las despliega a mano la persona responsable del proyecto, nunca el CI: `firebase deploy --only firestore,storage`.

## Reglas de la web estática

Es una exportación estática (`output: "export"`): sin rutas de API, sin server actions, sin `cookies()`/`headers()`, sin segmentos de ruta dinámicos como `[id]` (usa `?id=`). Se habla con Firebase desde el navegador (componentes `"use client"`). Si algún día hace falta código de servidor, usa Cloud Functions o cambia a Firebase App Hosting.

## Secretos

El despliegue usa el secreto de GitHub `FIREBASE_SERVICE_ACCOUNT`. **Nunca subas al repositorio una clave `.json` de cuenta de servicio** (están en `.gitignore`). La configuración web de `src/lib/firebase.config.json` es pública por diseño: los datos se protegen con las reglas de seguridad.
