# flejethepueblo — lista de tareas

Todo lo que falta, en un solo sitio. Marca `[x]` al terminar y haz push a `develop`.
Los identificadores (A1, B4, F17…) son los de [PLAN.md](PLAN.md) y [CONTEXT.md](CONTEXT.md). Las tareas marcadas **nuevo** salen de la tabla de apartados del equipo y aún no estaban en el plan.

## 0. Configuración (responsable del proyecto, en consolas)

- [x] Proyecto Firebase en el plan **Blaze**.
- [ ] Poner una alerta de presupuesto en la cuenta de facturación.
- [x] Bucket de Storage creado (`US-EAST1`, ubicación sin coste).
- [x] Reglas de Storage desplegadas y probadas (18 comprobaciones).
- [ ] Opcional: activar acceso con Google en Authentication.
- [ ] Cuando `develop` esté bien: `git push origin develop:main` para actualizar producción.

## 1. Base (antes de repartir el trabajo)

- [ ] **Prueba de IA**: Transformers.js en un Web Worker con Next 16, calcular el embedding de una frase.
- [x] `src/lib/auth.tsx` real (`AuthProvider`, `useUser`) y pantalla `/login/`.
- [x] Alta (`/onboarding/`) y perfil (`/profile/`), con burbujas de intereses, idiomas y pronombres.
- [x] `getProfile` y `saveProfile` en `src/lib/db.ts`.
- [ ] Funciones de lectura de eventos: `listUpcomingEvents`, `getEvent`.
- [x] `EventCard` completa, con el icono de la categoría.
- [ ] `scripts/seed.mjs`: ~20 personas falsas y ~30 eventos.

## 2. Por apartado

### Actividades del pueblo — eventos creados por personas
- [ ] B1 Formulario de crear evento (lugar en el mapa, portada subida).
- [ ] B2 Detalle del evento: unirse / salir.
- [ ] B5 Aviso de eventos parecidos antes de publicar (modelo local).

### Actividades institucionales
- [ ] B7 Insignia "Oficial"; las instituciones verificadas publican eventos oficiales.
- [ ] C1 Opción "Represento a una institución" en el alta.

### Apartado de distintas actividades (categorías)
- [ ] A1 Mapa de las Islas Canarias con pines.
- [ ] A2 Botones de categoría sobre el mapa (tipo Google Maps).
- [ ] A3 Lista de eventos bajo el mapa.

### Filtro de fechas y actividades
- [ ] A4 Ordenar por cercanía / fecha / más gente.
- [ ] A5 Filtros: oficiales, en línea, "hablan mis idiomas", "accesible para mí".
- [ ] **Nuevo** — Filtro por rango de fechas: hoy, este fin de semana, esta semana, elegir fechas.

### Intercambios de saberes — **nuevo**
- [ ] Decidir el formato: categoría nueva "Intercambio de saberes" (enseño X / quiero aprender Y) o campo del perfil. Lo más simple: una categoría más en `src/lib/categories.ts`.
- [ ] Si va en el perfil: campos `canTeach` y `wantsToLearn` en `UserProfile`, y que el algoritmo de afinidad los cruce.

### Conecta ahora — **nuevo**
- [ ] Botón "Conecta ahora": eventos que empiezan en las próximas 2 horas cerca de ti, o que ya están en marcha.
- [ ] Opción de crear un encuentro rápido ("estoy en X, ¿alguien se apunta a un café?") con fin automático a las 2 horas.

### Chat grupal
- [ ] B4 Chat de grupo por evento + lista "mis chats".

### Algoritmo de afinidad
- [ ] C7 Gente como tú: intereses + idiomas + isla en común.
- [ ] **Nuevo** — Sumar intercambio de saberes (lo que yo quiero aprender y la otra persona enseña).

### Apartado IA
- [ ] C3 Worker de IA y embeddings.
- [ ] C4 Asistente: búsqueda libre → tarjetas.
- [ ] C5 Asistente: "Sugiéreme algo" según el perfil.
- [ ] C6 Redacción con el modelo de chat (opcional).

## 3. Desarrollo transversal

### Idioma / bandera
- [x] `LanguageFlags` hecho.
- [ ] B3 Mostrar banderas en tarjetas y detalle.

### Lectura fácil / lenguaje inclusivo — **nuevo**
- [ ] Textos de la interfaz cortos, frases simples, sin tecnicismos (criterios de lectura fácil).
- [x] Idioma de la interfaz: **español** (`<html lang="es">`, etiquetas y navegación ya traducidas).
- [ ] Revisar todos los textos con lenguaje inclusivo.

### Pictogramas — **nuevo**
- [x] Un icono SVG por categoría (`lucide-react`), en las burbujas de intereses y en cada actividad.
- [ ] Valorar pictogramas de ARASAAC si hace falta algo más sencillo (licencia CC BY-NC-SA, pide atribución).
- [ ] Pictogramas en los botones principales de navegación (ya tienen icono + texto).

### Accesibilidad
- [x] Iconos de inclusión (`InclusionBadges`) y lista en `src/lib/inclusion.ts`.
- [ ] B8 Elegir iconos en el formulario y mostrarlos en tarjeta y detalle.
- [ ] Revisión: contraste, tamaño de toque, navegación con teclado, lector de pantalla (textos alternativos).

### Pronombres
- [x] `PersonName` hecho.
- [x] Pronombres opcionales en el alta y en el perfil.

### Reviews de actividades pasadas
- [ ] B6 Reseñas con estrellas y comentario, solo para quien asistió y cuando el evento ha terminado.

### Auto-moderadores y strikes — **nuevo**
- [ ] El modelo local revisa el texto antes de publicar un evento o un mensaje y avisa si parece ofensivo (no bloquea solo: avisa y sugiere otra redacción).
- [ ] Botón "Reportar" en eventos, mensajes y perfiles → colección `reports`.
- [ ] Strikes: al llegar a 3 reportes confirmados, la cuenta queda bloqueada para publicar. Contar strikes **no** puede hacerse desde el navegador (cualquiera podría cambiar el número): necesita una Cloud Function (posible con Blaze) o revisión a mano en la consola para la demo.
- [ ] Reglas de seguridad para `reports` y para bloquear a quien tenga `blocked: true`, con sus comprobaciones en `scripts/rules-check.mjs`.

### Píldoras informativas — **nuevo**
- [ ] Tarjetas cortas que aparecen en momentos clave (al crear un evento, al entrar en un chat): lenguaje inclusivo, qué es ofensivo, cómo tratar con respeto.
- [ ] Contenido en un archivo `src/lib/tips.ts` (texto escrito por el equipo, sin IA).

### Protección de datos — **nuevo**
- [ ] Página de privacidad: qué guardamos (perfil, isla, eventos, mensajes), qué no (ubicación exacta, discapacidad) y que la IA se ejecuta en el dispositivo.
- [ ] Casilla de consentimiento en el registro.
- [ ] Botón "Borrar mi cuenta" en el perfil (las reglas ya permiten borrar tu propio documento).

### Sostenibilidad — **nuevo**
- [ ] Decidir qué significa en la app. Propuesta simple: categoría "Sostenibilidad" y un icono "accesible en transporte público / a pie" en `src/lib/inclusion.ts`.

## 4. Antes de la demo

- [ ] Datos de ejemplo cargados; dos cuentas de prueba con idiomas distintos.
- [ ] Probar en un móvil real y en el portátil de la demo (modelos ya en caché).
- [ ] `git push origin develop:main`.
- [ ] Ensayar dos veces el guion de [PLAN.md](PLAN.md).
