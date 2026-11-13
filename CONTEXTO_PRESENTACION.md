# flejethepueblo — contexto para la presentación

Documento de apoyo para preparar la presentación del Grupo 3 (Hackathon TechLab II).
Recoge qué hace la app, cómo está hecha, qué está terminado y qué falta, con el estado
comprobado en el código el 13-11-2026.

Fuentes: [CONTEXT.md](CONTEXT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [PLAN.md](PLAN.md),
[TODO.md](TODO.md) y el código de `src/`.

---

## 1. En una frase

Un mapa de las Islas Canarias lleno de pequeños encuentros sociales que cualquiera puede
crear y a los que cualquiera puede unirse, para que personas de distintos orígenes e idiomas
se conozcan de verdad, en persona o en línea.

Se parece a Google Maps o GuruWalk, pero los pines son encuentros creados por vecinas, vecinos
e instituciones.

## 2. El problema

- Quien llega a las islas (y muchas personas que nacieron aquí) cuesta que conozcan gente.
- No saben qué pasa cerca de casa.
- No saben si alguien allí hablará su idioma.
- Las actividades oficiales y los encuentros informales están en sitios distintos.

## 3. Quién lo usa

| Lado | Quién | Qué hace |
|---|---|---|
| **Personas** (el núcleo) | Cualquiera que quiera conocer gente | Crea su perfil, busca encuentros, se une, crea los suyos, chatea con el grupo, encuentra gente parecida |
| **Instituciones** | Ayuntamientos, cabildos, ONG, centros culturales | Publican encuentros **oficiales** con la insignia "Oficial" |

## 4. Principios de diseño

1. **Mínimo y limpio.** Pocas pantallas y una acción clara en cada una. Pensado primero para el móvil.
2. **Funciona en cualquier dispositivo.** Móvil, tableta y portátil. Lo que usa IA se degrada con elegancia y nunca bloquea la app.
3. **El idioma se ve.** Las banderas de los idiomas aparecen donde aparezca una persona o un evento.
4. **La inclusión se ve.** Iconos de accesibilidad, banderas y pronombres muestran quién puede participar y cómo.
5. **Privado por defecto.** Nunca guardamos la ubicación exacta de una persona, solo su isla. La discapacidad de nadie se guarda: el filtro "accesible para mí" se usa en el momento y no queda guardado.
6. **Lectura fácil.** Frases cortas, palabras corrientes, letra pensada para baja visión (Atkinson Hyperlegible Next).

## 5. Funcionalidades en detalle

Estado comprobado en el código. **Hecho** = funciona en la app. **Parcial** = hay una parte, falta otra. **Pendiente** = todavía no.

### Perfil y alta

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F1 | Cuenta | Entrar o crear cuenta con correo y contraseña (`/login/`). Acceso con Google: opcional, no hecho | Hecho |
| F2 | Alta | Alta en 7 pasos cortos con barra de progreso, botón para volver y opción de saltar lo opcional. Pide intereses, idiomas (obligatorio), isla y preguntas para emparejar (cómo prefiere encontrarse, cuándo tiene tiempo, qué le gustaría hacer). Edición en `/profile/` | Hecho |
| F3 | Cuenta de institución | Casilla "Sí, represento a una institución" en el alta. La verificación se hace a mano en la consola de Firebase | Parcial |

### Descubrir

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F4 | Mapa | Mapa de las Islas Canarias (MapLibre, teselas de OpenFreeMap, sin clave). Un pin por evento presencial | Hecho |
| F5 | Botones de categoría | Fila de botones sobre el mapa, uno por categoría. Filtran mapa y lista | Hecho |
| F6 | Cerca de mí y orden | Orden: **Antes** (por fecha), **Cerca** (por distancia con la ubicación del dispositivo), **Más gente**. Filtros: solo oficiales, solo en línea, "hablan mis idiomas", "accesible para mí" | Hecho |
| F7 | Lista de eventos | Tarjetas bajo el mapa con imagen, categoría, fecha, lugar, banderas e iconos de inclusión | Hecho |

### Eventos

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F8 | Crear evento | Título, descripción, categoría, día y hora, en persona (se marca el lugar tocando el mapa) o en línea (enlace), aforo opcional, iconos de inclusión, foto de portada opcional (máx. 5 MB) | Hecho |
| F9 | Aviso de eventos parecidos | Antes de publicar, avisar de encuentros parecidos y sugerir unirse. Hoy el formulario no lo hace; está previsto en B5 | Pendiente |
| F10 | Unirse y salir | Una sola acción; la lista de asistentes se actualiza al momento | Hecho |
| F11 | Banderas de idiomas | Banderas de los idiomas de quienes van, con su número | Hecho |
| F12 | Reseñas | Estrellas (1–5) y comentario de quienes asistieron. Reglas y tipos ya escritos; pantalla no hecha | Pendiente |
| F13 | Eventos oficiales | Insignia "Oficial", filtro "solo oficiales". Solo una institución verificada puede marcarlo al crear | Parcial |

### Juntos

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F14 | Chat de grupo | Chat en tiempo real (Firestore `onSnapshot`) solo para asistentes. Pantalla `/chats/` y componente de burbujas: sin hacer | Pendiente |
| F15 | Gente como tú | Perfiles con intereses e idiomas en común, misma isla. Página `/people/` y tarjeta: sin hacer | Pendiente |

### Asistente

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F16 | xatsí, el asistente | Nombre del asistente. Dos modos en `/assistant/`: **"Sugiéreme algo"** (usa tu perfil) y **búsqueda libre** ("algo al aire libre este fin de semana"). Hoy busca por **palabras**: ignora tildes, mayúsculas y palabras vacías ("algo", "este", "fin"). Responde al instante y sin descargar nada. Búsqueda por significado y frase redactada: pendientes | Parcial |

### Diversidad e inclusión

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F17 | Iconos de inclusión | Al crear un evento, quien organiza marca lo que ofrece: silla de ruedas, lengua de signos, adaptado a personas ciegas o con baja visión, subtítulos o bucle magnético, lenguaje inclusivo, perspectiva de género. Iconos SVG (lucide-react). Se pueden filtrar en el mapa | Hecho |
| F18 | Pronombres | Opcionales en el alta y el perfil, con sugerencias ("she/her", "they/them"…). Se muestran con el nombre (`PersonName`). En el chat: pendiente, porque el chat no existe aún | Parcial |

### Comunidad y seguridad

| ID | Funcionalidad | Qué hace | Estado |
|---|---|---|---|
| F19 | Intercambio de saberes | Encuentros donde alguien enseña lo que sabe. Formato todavía sin decidir (categoría nueva o campo del perfil) | Pendiente |
| F20 | Conecta ahora | Eventos que empiezan pronto o ya están en marcha cerca de ti; encuentros rápidos de pocas horas | Pendiente |
| F21 | Auto-moderación y strikes | Aviso antes de publicar un texto que parezca ofensivo; reportes; tres reportes confirmados bloquean la publicación. Contar strikes necesita Cloud Functions o revisión manual | Pendiente |
| F22 | Píldoras informativas | Tarjetas cortas sobre lenguaje inclusivo y trato respetuoso, en momentos clave. Texto escrito por el equipo, sin IA | Pendiente |
| F23 | Lectura fácil y pictogramas | Tipografía y un icono por categoría: hechos. Revisión de todos los textos: pendiente | Parcial |
| F24 | Protección de datos | Página de privacidad, casilla de consentimiento al registrarse y botón "Borrar mi cuenta" | Pendiente |

### Otros detalles de producto

- **Dos niveles de cuenta:** persona e institución. Solo una institución verificada puede publicar como oficial.
- **Seguridad en las reglas:** cada persona solo edita su propio perfil, no puede marcarse "verificada", y solo se apunta a sí misma (nunca por encima del aforo).
- **Chat solo para asistentes:** leer y escribir en el chat exige estar en la lista de asistentes.

## 6. Categorías (14)

Deporte · Aire libre · Idiomas · Política y debate · Impro y teatro · Música · Comida · Tecnología · Arte · Juegos · Voluntariado · Familias · Bienestar · Cultura.

Una sola lista en `src/lib/categories.ts` alimenta los intereses del alta, los botones del mapa y el formulario de evento. Cada una tiene un icono y un emoji de respaldo.

## 7. Recorrido por la app (pantallas)

| Ruta | Pantalla | Qué ve la persona |
|---|---|---|
| `/login/` | Acceso | Entrar o crear cuenta |
| `/onboarding/` | Alta | 7 pasos: intereses, idiomas, isla, preguntas, pronombres, institución |
| `/` | Inicio | Mapa, botones de categoría, orden, filtros y lista de encuentros |
| `/event/?id=` | Detalle | Información, banderas, iconos de inclusión, unirse o salir |
| `/event/new/` | Crear evento | Formulario con mapa, foto e iconos de inclusión |
| `/assistant/` | xatsí | Buscar o pedir una sugerencia |
| `/profile/` | Mi perfil | Ver y editar mis datos |
| `/chats/` | Mis chats | Pendiente |
| `/people/` | Gente como tú | Pendiente |

Navegación inferior en móvil (`BottomNav`) con las secciones principales, con icono y texto.

## 8. Guion de la demo (≈ 3 minutos)

1. Entrar o crear cuenta → alta: elegir intereses e idiomas.
2. Mapa de las islas → pulsar **Intercambio de idiomas** → los pines se filtran.
3. Ordenar por **Cerca**.
4. Crear un evento con mapa, iconos de inclusión y foto.
5. Unirse → la fila de banderas gana tus idiomas.
6. xatsí: "algo al aire libre este fin de semana" → tarjetas reales, con el portátil sin conexión.
7. Un evento oficial, con su insignia.

**Cambios respecto al guion original de PLAN.md:** el aviso de eventos parecidos (paso 4 original), el chat en directo con dos dispositivos (paso 6) y "Gente como tú" (paso 9) **no están hechos todavía**. Hay que decidir si se muestran o se quitan del guion.

## 9. Cómo está hecho (arquitectura, en simple)

```
Navegador (móvil, tableta, portátil)
 └─ App estática de Next.js (React + TypeScript)
     ├─ Interfaz: shadcn/ui + Tailwind (tokens de color, sin colores fijos)
     ├─ Mapa: MapLibre (react-map-gl) + OpenFreeMap
     └─ IA local (prevista): Transformers.js en un Web Worker
                    │ SDK de Firebase (sin servidor propio)
 Firebase (proyecto thepueblo-6f94e)
     ├─ Auth: correo y contraseña
     ├─ Firestore: perfiles, eventos, chat, reseñas (base en Madrid)
     ├─ Storage: fotos de eventos (bucket en US-EAST1, sin coste)
     └─ Hosting: archivos estáticos
```

**Puntos fuertes para contar:**
- **Sin servidor propio.** Todo es archivos estáticos. Lo protegen las reglas de seguridad de Firestore y Storage.
- **Un solo código para todo.** Next.js exporta una web estática que funciona en móvil y en portátil.
- **Tiempo real sin librerías extra.** `onSnapshot` de Firestore da el chat en directo.
- **Ramas y despliegues automáticos.** Cada cambio en `develop` se despliega solo en la web de pruebas.

**Reglas de la web estática:** sin rutas de API, sin server actions, sin segmentos `[id]` (se usa `?id=`), y todo lo que toca Firebase, el mapa o la IA se ejecuta en el navegador.

**Modelo de datos:** `users`, `events`, y dentro de cada evento `messages` (chat) y `reviews` (reseñas). Unirse y salir son una sola actualización atómica, sin transacciones.

**Decisiones técnicas que se pueden defender:**
- Sin librería de estado: bastan React y los listeners de Firestore.
- Sin kit de interfaz de chat: el chat es una tarea pequeña y propia.
- Sin geocodificación: el lugar se marca tocando el mapa.
- Sin traducción de la interfaz: está toda en español, y el contenido lo escribe cada persona en su idioma.

## 10. Seguridad y privacidad

- **Reglas de Firestore y Storage** desplegadas y probadas con `scripts/rules-check.mjs` (18 comprobaciones en Storage).
- **Imágenes:** solo imágenes, máximo 5 MB, y solo dentro de la carpeta de quien las sube.
- **Ubicación:** nunca se guarda la posición exacta de una persona, solo su isla.
- **Discapacidad:** nunca se guarda. El filtro "accesible para mí" se elige en el momento.
- **IA en el dispositivo:** lo que se escribe a xatsí no sale del dispositivo (cuando la IA esté conectada).
- **Clave de la cuenta de servicio:** solo en GitHub como secreto, nunca en el repositorio. Hay que borrarla al terminar el hackathon.

## 11. Inteligencia artificial: qué hay hoy y qué falta

Esta parte hay que contarla **con cuidado**. Hoy **no hay ningún modelo cargado** en la app.

| Uso | Hoy | Previsto |
|---|---|---|
| xatsí, búsqueda | Por palabras: ignora tildes y palabras vacías | Reordenar por significado con embeddings (`multilingual-e5-small`, ~118 MB) |
| xatsí, "Sugiéreme algo" | Según perfil (intereses, isla, idiomas) | Igual, con búsqueda por significado |
| xatsí, redacción | Texto fijo | Dos o tres frases con un modelo de chat (LFM2-350M o Gemma 3 1B), solo en dispositivos con WebGPU |
| Aviso de eventos parecidos (F9) | No está en el formulario | Embedding del título y descripción, comparado con los eventos próximos |
| Gente como tú (F15) | No hecho | Puntuación simple (intereses, idiomas, isla), sin modelo |
| Moderación de textos (F21) | No hecho | Aviso local antes de publicar |

**Regla de oro que se puede contar:** las tarjetas siempre salen de datos reales de Firestore. Un modelo pequeño que redacte mal nunca puede inventarse un evento.

**Riesgo abierto:** que Transformers.js se empaquete bien con Next 16, y la velocidad real de los modelos en un móvil. Aún no está probado (PLAN, Fase 0).

## 12. Estado del proyecto (13-11-2026)

**Hecho**
- Base técnica: Next.js estático, Firebase (Auth, Firestore, Storage, Hosting), CI con despliegue automático a pruebas.
- Acceso, alta en pasos, perfil editable.
- Mapa con pines, botones de categoría, lista, orden y filtros.
- Crear evento con mapa, foto e iconos de inclusión; unirse y salir.
- Banderas de idiomas, iconos de inclusión, pronombres, eventos oficiales (insignia y filtro).
- xatsí por palabras con "Sugiéreme algo".
- Datos de ejemplo: 3 personas y 12 actividades (`scripts/seed.mjs`).
- Tipografía accesible y color de marca.
- Reglas de seguridad desplegadas y comprobadas.

**Pendiente, por prioridad de la demo**
1. B4 Chat de grupo y "mis chats" (F14).
2. B5 Aviso de eventos parecidos (F9).
3. C7 Gente como tú (F15).
4. B6 Reseñas (F12).
5. C3 y C6: modelo de embeddings y redacción (F16).
6. Protección de datos: página de privacidad, consentimiento y borrar cuenta (F24).
7. Moderación, strikes y píldoras (F21, F22).
8. Conecta ahora, intercambio de saberes, filtro por fechas (F19, F20 y mejoras de F6).

**Recorte si falta tiempo (orden de PLAN.md):** Gente como tú con puntuación simple; reseñas; redacción con el modelo de chat (mantener la búsqueda por significado); filtros extra; publicación de instituciones (en su lugar, dos eventos oficiales con el script).

## 13. Equipo, ramas y entornos

- **Tres bloques de trabajo** en paralelo, en carpetas distintas para no pisarse:
  - **Bloque A, Descubrir:** mapa, categorías, lista, orden y filtros. Casi terminado.
  - **Bloque B, Eventos y chat:** crear, unirse, banderas e inclusión hechos; chat, reseñas y eventos parecidos pendientes.
  - **Bloque C, Personas e IA:** alta y perfil hechos; xatsí por palabras hecho; IA real y "Gente como tú" pendientes.
- **Ramas:** `develop` es la rama de trabajo y se sube directamente, sin pull request. `main` solo recibe `develop` cuando el responsable lo pide.
- **Entornos:**
  - Pruebas (`develop`): https://thepueblo-6f94e--develop-1ttzfnbg.web.app
  - Producción (`main`): https://thepueblo-6f94e.web.app (pendiente de actualizar desde `develop`)
- **Historia:** 15 commits en dos días (12 y 13 de noviembre de 2026).

## 14. Cómo se verá en la presentación (esquema sugerido)

1. **Portada:** flejethepueblo. Encuentros para conocer gente en las islas.
2. **El problema:** llegar a una isla y no saber a quién conocer ni en qué idioma.
3. **La idea:** un mapa de encuentros creados por vecinos e instituciones.
4. **Dos lados:** personas e instituciones.
5. **Demo en vivo:** los siete pasos del guion.
6. **Inclusión por diseño:** banderas, iconos de accesibilidad, pronombres, lectura fácil.
7. **Privacidad:** qué guardamos y qué no.
8. **Cómo está hecho:** sin servidor propio, Firebase, Next.js, IA en el dispositivo.
9. **IA que no inventa:** búsqueda real hoy; modelos en camino.
10. **Estado honesto:** lo hecho, lo que viene y lo que se recortaría.
11. **Equipo y próximos pasos.**

## 15. Puntos que conviene revisar antes de presentar

- **TODO.md está desfasado en algunos puntos.** Marca sin hacer la opción "Represento a una institución" (C1) y el aviso de institución (B7), pero el código ya tiene ambas partes en parte. Conviene actualizarlo.
- **PLAN.md dice F1–F16 y CONTEXT.md tiene F1–F24.** Son números del mismo catálogo, pero la presentación debe usar una sola lista.
- **La IA aparece en ARCHITECTURE.md como Transformers.js.** En la conversación del equipo se habló de usar Cloudflare Workers AI para xatsí. Es una decisión abierta: hay que elegir una antes de presentar la parte de IA.
- **El guion de la demo incluye funciones no hechas** (aviso de parecidos, chat en directo, Gente como tú). O se hacen, o se quitan del guion.
- **Los datos de ejemplo** llevan la misma contraseña de demostración para todas las cuentas. Es normal para una demo; no debe llegar a producción.
- **Producción todavía no está actualizada** desde `develop` (pendiente `git push origin develop:main`).

---

*Documento generado el 13-11-2026 a partir del estado del repositorio en la rama `develop`.*
