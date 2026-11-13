# thePueblo — contexto del producto

Grupo 3, Hackathon TechLab II. Este documento explica **qué** construimos y **por qué**.
Cómo se construye: [ARCHITECTURE.md](ARCHITECTURE.md). Qué se hace y en qué orden: [PLAN.md](PLAN.md).

## En una frase

Un mapa de las Islas Canarias lleno de pequeños encuentros sociales que cualquiera puede crear y a los que cualquiera puede unirse, para que personas de distintos orígenes e idiomas se conozcan de verdad, en persona o en línea.

Piensa en GuruWalk o Google Maps, pero los pines son encuentros creados por vecinos e instituciones.

## El problema

A quien llega a las islas (y a muchos que nacieron aquí) le cuesta conocer gente: no sabe qué pasa cerca, no sabe si alguien allí hablará su idioma, y las actividades oficiales y los encuentros informales están en sitios distintos.

## Dos lados

| Lado | Quién | Qué hace |
|---|---|---|
| **Personas** (el núcleo) | Cualquiera que quiera colaborar y conocer gente a su alrededor | Crea un perfil, encuentra encuentros y se une, crea los suyos, chatea con el grupo, encuentra gente parecida |
| **Instituciones** | Ayuntamientos, cabildos, ONG, centros culturales | Publican eventos y encuentros **oficiales**, que llevan la insignia "Oficial" |

## Funcionalidades

Cada funcionalidad tiene un identificador para poder citarla en ramas y PR.

### Perfil y alta
- **F1 Cuenta.** Acceso con correo y contraseña (el acceso con Google se puede añadir más adelante).
- **F2 Alta.** Elegir intereses entre las categorías de encuentros, los **idiomas que hablas** (obligatorio), tu isla y unas preguntas cortas que ayudan a emparejar: en persona / en línea / ambos, cuándo sueles tener tiempo, una línea sobre lo que te gustaría hacer con otras personas.
- **F3 Cuenta de institución.** En el alta puedes indicar "Represento a una institución". Podrá publicar eventos oficiales una vez verificada (a mano durante el hackathon).

### Descubrir
- **F4 Mapa.** Mapa de las Islas Canarias con un pin por evento.
- **F5 Botones de categoría.** Una fila de botones sobre el mapa (como "Restaurantes / Supermercados" en Google Maps), uno por categoría: deporte, idiomas, política y debate, impro, música, comida… Al pulsar uno se filtran el mapa y la lista.
- **F6 Cerca de mí.** Usa la ubicación del dispositivo para ordenar los eventos por distancia. Otros órdenes: los más próximos en fecha, los que tienen más gente. Filtros: solo oficiales, solo en línea, "hablan mis idiomas".
- **F7 Lista de eventos.** Los mismos eventos, como tarjetas bajo el mapa.

### Eventos
- **F8 Crear evento.** Título, descripción, categoría, fecha y hora, en persona (lugar en el mapa) o en línea (enlace), aforo opcional, imagen de portada opcional (subida).
- **F9 Aviso de eventos parecidos.** Antes de publicar, un modelo pequeño que se ejecuta **en el dispositivo** busca eventos parecidos y sugiere unirse a uno en lugar de crear un duplicado.
- **F10 Unirse / salir.**
- **F11 Banderas de idiomas.** Cada evento muestra las banderas de los idiomas que hablan quienes se han unido, con su número, para que veas si alguien allí habla tu idioma.
- **F12 Reseñas.** Quienes asistieron dejan una valoración con estrellas y un comentario.
- **F13 Eventos oficiales.** Los eventos de instituciones verificadas llevan la insignia "Oficial" y se pueden filtrar.

### Juntos
- **F14 Chat de grupo.** Al unirte a un evento entras en su chat de grupo (como un grupo de WhatsApp) con el resto de personas apuntadas.
- **F15 Gente como tú.** Una lista de perfiles parecidos al tuyo (intereses e idiomas en común).

### Diversidad e inclusión
- **F17 Iconos de inclusión y accesibilidad.** Al crear un evento, quien organiza marca lo que ofrece: accesible en silla de ruedas, lengua de signos, adaptado a personas ciegas o con baja visión, subtítulos o bucle magnético, lenguaje inclusivo, perspectiva de género. Se muestran como iconos SVG pequeños junto a las banderas de idiomas, y en el mapa se puede filtrar por ellos.
- **F18 Pronombres.** Al registrarse, cada persona puede añadir sus pronombres (opcional). Aparecen junto a su nombre en todas partes: chat, asistentes, "Gente como tú" y perfil.

### Comunidad y seguridad
- **F19 Intercambio de saberes.** Encuentros donde alguien enseña algo que sabe y otras personas aprenden.
- **F20 Conecta ahora.** Eventos que empiezan pronto o ya están en marcha cerca de ti, y encuentros rápidos de pocas horas.
- **F21 Auto-moderación y strikes.** El modelo local avisa antes de publicar un texto que parece ofensivo; los reportes confirmados suman strikes y a los tres se bloquea la publicación.
- **F22 Píldoras informativas.** Tarjetas cortas sobre lenguaje inclusivo y trato respetuoso en momentos clave.
- **F23 Lectura fácil y pictogramas.** Textos simples y un pictograma por categoría.
- **F24 Protección de datos.** Página de privacidad, consentimiento al registrarse y borrar la cuenta.

### Asistente
- **F16 Chatbot.** Dos modos: "Sugiéreme algo" (usa tu perfil) y búsqueda libre ("algo al aire libre este fin de semana en Tenerife, en inglés"). Se ejecuta en el dispositivo.

## Categorías de encuentros (primera versión)

Deporte · Aire libre y senderismo · Intercambio de idiomas · Política y debate · Impro y teatro · Música · Comida y cocina · Tecnología · Arte y manualidades · Juegos · Voluntariado · Familias · Bienestar · Cultura y patrimonio

Una sola lista, definida una vez en el código, que usan los intereses del alta, los botones de categoría y el formulario de eventos.

## Principios

- **Mínimo y limpio.** Pocas pantallas, una acción evidente por pantalla, pensado primero para el móvil.
- **Funciona en cualquier dispositivo.** Móvil, tableta, portátil. Las partes de IA se degradan con elegancia en vez de bloquear.
- **El idioma se ve.** Los idiomas que habla cada persona aparecen allí donde aparezca una persona o un evento.
- **La inclusión se ve.** Las banderas de idiomas, los iconos de accesibilidad y los pronombres hacen visible quién puede participar y cómo. Nunca guardamos la discapacidad de una persona: el filtro "accesible para mí" se elige en el momento y no se guarda.
- **Privado por defecto.** Nunca guardamos la ubicación exacta de una persona, solo su isla. Los chats de grupo solo los leen sus miembros. La IA se ejecuta en el dispositivo, así que lo que le escribes no sale de él.

## Fuera del alcance del hackathon

Pagos, notificaciones push, mensajes privados uno a uno, subida de foto de perfil, panel de moderación (los strikes se revisan en la consola), apps nativas, traducir la interfaz a varios idiomas (la interfaz está en un idioma; el contenido es lo que escriba cada persona).

## Glosario

| Término | Significado |
|---|---|
| **Evento / encuentro** | Lo mismo. Una quedada con hora, categoría y un lugar o un enlace. En el código se llama `Meetup`. |
| **Evento oficial** | Evento creado por una institución verificada. |
| **Asistente (persona)** | Usuario que se ha unido a un evento. |
| **Categoría** | Uno de los tipos fijos de encuentro de arriba. Los *intereses* de un usuario son categorías. |
| **Isla** | Una de las ocho Islas Canarias; la ubicación más gruesa que guardamos de una persona. |
| **Modelo local** | Un modelo que se ejecuta en el navegador, en el dispositivo del usuario, no en un servidor. |
