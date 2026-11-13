# thePueblo — hackathon

Next.js (React + TypeScript + Tailwind) → exportación estática → Firebase Hosting.

- **Producción** (`main`): https://thepueblo-6f94e.web.app
- **Pruebas** (`develop`): https://thepueblo-6f94e--develop-1ttzfnbg.web.app
- **Vistas previas (opcional):** si abres un pull request, recibe su propia URL temporal, publicada como comentario en el PR.

| Lee esto | Para |
|---|---|
| [CONTEXT.md](CONTEXT.md) | Qué construimos y por qué |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, paquetes, modelo de datos, IA local, hosting |
| [TODO.md](TODO.md) | La lista de tareas pendientes, por apartado |
| [PLAN.md](PLAN.md) | Fases, los tres bloques de tareas, guion de la demo |

## Puesta en marcha (una vez)

```bash
git clone https://github.com/vivekmirpuri/thepueblo.git && cd thepueblo
npm install
npm run dev   # http://localhost:3000
```

Firebase está listo para usar desde `src/lib/firebase.ts` (`auth`, `db`, `storage`).

## Cómo trabajamos sin pisarnos

1. **Trabaja en `develop` y haz push directo.** Cada push a `develop` se despliega solo en el entorno de pruebas. Cuando las pruebas vayan bien, pasa a producción con `git push origin develop:main`. No hace falta pull request; ábrelo solo si quieres una URL de vista previa o que alguien revise algo.
2. **Archivos compartidos: cambios pequeños y avisa antes en el chat:** `package.json`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/*`, `src/components/ui/`, `src/components/shared/`, `next.config.ts`, `firebase.json`.
3. **Actualiza siempre antes de subir:** `git pull --rebase origin develop` antes de empezar y justo antes de cada `git push`. Commits pequeños y frecuentes casi nunca chocan.
4. **Antes de hacer push, compila:** `npm run lint && npm run build`. Nada bloquea un push roto, así que comprobarlo es cosa de cada uno.

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
