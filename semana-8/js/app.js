// js/app.js · La interfaz: DOM y eventos. Importa lo que necesita de los otros tres módulos.
// Las rutas empiezan con ./ y terminan en .js: en el navegador las dos cosas son obligatorias.
// datos.js ya no existe: ahora los pokémon los trae api.js desde la red.
import { URL_POKEMON, obtenerPokemones } from './api.js';
import { filtrarPokemones, contarDobleTipo, buscarPorId } from './logica.js';
import { leerFavoritos, guardarFavoritos, esFavorito, alternarFavorito } from './favoritos.js';

// ============ ESTADO ============
const filtros = { texto: '', tipo: '' };

// Los pokémon ahora son ESTADO que llega de la red. Empieza vacío, y es let (no const)
// porque cuando llegue la respuesta lo vamos a reemplazar por lo que mande la API.
let pokemones = [];
let cargando = false; // ¿hay una petición en camino?
let error = null;     // null = todo bien; si algo falla, aquí queda el mensaje

// La próxima página por pedir. Empieza en la primera; después la dice la API en next.
// Cuando next llega como null, ya no hay más páginas.
let siguiente = URL_POKEMON;

// Los favoritos NO vienen de la red: vienen de localStorage. Se leen una vez al arrancar.
let favoritos = leerFavoritos();

// Qué está mirando la persona: 'todos' (lo que llegó de la API) o 'favoritos' (lo guardado)
let vista = 'todos';

// ============ PRESENTACIÓN ============
// Cada tipo de la API → texto en español + clases COMPLETAS de Tailwind
// (nunca armadas por pedazos: Tailwind solo genera las clases que encuentra escritas enteras)
const TIPOS = {
  normal:   { texto: 'Normal',    clases: 'bg-stone-200 text-stone-700' },
  fire:     { texto: 'Fuego',     clases: 'bg-orange-100 text-orange-700' },
  water:    { texto: 'Agua',      clases: 'bg-sky-100 text-sky-700' },
  electric: { texto: 'Eléctrico', clases: 'bg-yellow-100 text-yellow-700' },
  grass:    { texto: 'Planta',    clases: 'bg-emerald-100 text-emerald-700' },
  ice:      { texto: 'Hielo',     clases: 'bg-cyan-100 text-cyan-700' },
  fighting: { texto: 'Lucha',     clases: 'bg-red-100 text-red-700' },
  poison:   { texto: 'Veneno',    clases: 'bg-purple-100 text-purple-700' },
  ground:   { texto: 'Tierra',    clases: 'bg-amber-100 text-amber-700' },
  flying:   { texto: 'Volador',   clases: 'bg-indigo-100 text-indigo-700' },
  psychic:  { texto: 'Psíquico',  clases: 'bg-pink-100 text-pink-700' },
  bug:      { texto: 'Bicho',     clases: 'bg-lime-100 text-lime-700' },
  rock:     { texto: 'Roca',      clases: 'bg-zinc-200 text-zinc-700' },
  ghost:    { texto: 'Fantasma',  clases: 'bg-violet-100 text-violet-700' },
  dragon:   { texto: 'Dragón',    clases: 'bg-blue-100 text-blue-700' },
  dark:     { texto: 'Siniestro', clases: 'bg-slate-300 text-slate-800' },
  steel:    { texto: 'Acero',     clases: 'bg-gray-200 text-gray-700' },
  fairy:    { texto: 'Hada',      clases: 'bg-rose-100 text-rose-700' },
};

// Si algún día la API trae un tipo que no está en TIPOS, no rompemos la tarjeta
const tipoInfo = (nombre) => TIPOS[nombre] ?? { texto: nombre, clases: 'bg-slate-200 text-slate-600' };

const imagenDe = (p) => p.sprites.other['official-artwork'].front_default;

// Recibe UN pokémon y devuelve el HTML de SU tarjeta, con ${…} donde antes iba un dato escrito a mano.
// Tiene llaves { } y return: antes de armar el HTML hay que averiguar si es favorito.
const tarjetaHTML = (p) => {
  const fav = esFavorito(favoritos, p.id);
  const chips = p.types
    .map((t) => `<span class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoInfo(t.type.name).clases}">${tipoInfo(t.type.name).texto}</span>`)
    .join('');
  // El corazón va absolute arriba a la derecha (por eso el article es relative).
  // data-fav lleva el id, como data-id en "Ver detalle". aria-pressed: botón que se prende y se apaga.
  return `
  <article class="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow group transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800">
    <div class="overflow-hidden bg-slate-100 dark:bg-slate-700">
      <img src="${imagenDe(p)}" alt="${p.name}"
           class="aspect-square w-full object-contain p-4 transition group-hover:scale-105">
    </div>
    <button type="button" data-fav="${p.id}" aria-pressed="${fav}"
            aria-label="${fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
            class="absolute top-2 right-2 grid size-10 place-items-center rounded-full bg-white/90 text-2xl shadow transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-900/80 ${fav ? 'text-rose-600' : 'text-slate-500'}">${fav ? '♥' : '♡'}</button>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <h3 class="text-lg font-bold text-slate-900 capitalize dark:text-white">${p.name}</h3>
      <div class="flex flex-wrap gap-1">${chips}</div>
      <p class="text-sm text-slate-500 dark:text-slate-400">${p.weight / 10} kg · ${p.height / 10} m</p>
      <button type="button" data-id="${p.id}"
              class="mt-auto rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Ver detalle
      </button>
    </div>
  </article>`;
};

// Clases COMPLETAS del enlace activo e inactivo del menú (las mismas que ya tiene el HTML)
const CLASES_ENLACE = {
  activo: 'block rounded-lg px-3 py-2 font-medium text-indigo-600 md:p-0 dark:text-indigo-400',
  inactivo: 'block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 md:p-0 md:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800',
};

// La lista que se está mirando: de ella salen las tarjetas, el contador y el pokémon del modal
const listaActual = () => (vista === 'favoritos' ? favoritos : pokemones);

// ============ DOM ============
// --- Menú móvil: mostrar/ocultar y avisar al lector de pantalla ---
const btnMenu = document.getElementById('btn-menu');
const menu = document.getElementById('menu');

btnMenu.addEventListener('click', function () {
  menu.classList.toggle('hidden'); // si tiene hidden se lo quita, si no se lo pone
  const abierto = !menu.classList.contains('hidden');
  btnMenu.setAttribute('aria-expanded', abierto); // true / false
});

// --- Vistas: "Pokémon" y "Favoritos" del menú. Delegación: un listener en el ul ---
const titulo = document.querySelector('#titulo');
const enlacesVista = document.querySelectorAll('[data-vista]');

menu.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('[data-vista]');
  if (!enlace) return; // "Acerca de" no tiene data-vista: sigue siendo un enlace normal
  evento.preventDefault(); // que el href no mueva la página
  vista = enlace.dataset.vista; // 'todos' o 'favoritos'
  menu.classList.add('hidden'); // en el celular, cerrar el menú después de elegir
  btnMenu.setAttribute('aria-expanded', false);
  render();
});

// --- Modal ---
const modal = document.getElementById('modal-detalle');

// Llena el modal con UN pokémon y lo abre.
// Destructuring: saca las propiedades del objeto a variables, en una sola línea.
const abrirDetalle = (pokemon) => {
  const { id, name, types, weight, height } = pokemon;
  document.getElementById('modal-nombre').textContent = name;
  document.getElementById('modal-img').src = imagenDe(pokemon);
  document.getElementById('modal-img').alt = name;
  document.getElementById('modal-numero').textContent = `#${id}`;
  document.getElementById('modal-tipos').textContent = types.map((t) => tipoInfo(t.type.name).texto).join(' · ');
  document.getElementById('modal-peso').textContent = `${weight / 10} kg`;
  document.getElementById('modal-altura').textContent = `${height / 10} m`;
  modal.showModal();
};

// Clic en el fondo oscuro: el target es el propio <dialog>, no algo de adentro
modal.addEventListener('click', function (e) {
  if (e.target === modal) modal.close();
});

// --- Grilla ---
const grilla = document.querySelector('#grilla');
const contador = document.querySelector('#contador');
const btnMas = document.querySelector('#btn-mas');

// render: ESTADO → pantalla. Ya no recibe la lista: la calcula a partir de filtros.
// Regla del patrón: cuando algo cambia, se cambia el estado y se llama render(). Nada más.
const render = () => {
  // Título y enlace activo según la vista
  titulo.textContent = vista === 'favoritos' ? 'Tus Pokémon favoritos' : 'Pokémon';
  enlacesVista.forEach((enlace) => {
    const activo = enlace.dataset.vista === vista;
    enlace.className = activo ? CLASES_ENLACE.activo : CLASES_ENLACE.inactivo;
    enlace.setAttribute('aria-current', activo ? 'page' : 'false');
  });

  // Botón "Cargar más": visible solo si hay tarjetas y la API dijo que hay otra página.
  // Mientras carga se desactiva (así nadie pide la misma página dos veces).
  // En la vista de favoritos no tiene sentido: los favoritos no se paginan.
  btnMas.hidden = vista === 'favoritos' || siguiente === null || pokemones.length === 0;
  btnMas.disabled = cargando;
  btnMas.textContent = cargando ? 'Cargando…' : error ? 'No se pudo cargar. Reintentar' : 'Cargar más';

  // La grilla solo muestra "cargando" o "error" si todavía no hay NINGÚN pokémon.
  // Si ya hay tarjetas, se quedan quietas y el aviso lo da el botón.
  // Los favoritos no dependen de la red: en esa vista nunca hay "cargando" ni "error".
  const sinDatos = vista === 'todos' && pokemones.length === 0;

  // Estado 1 · CARGANDO: la petición salió y todavía no vuelve
  if (cargando && sinDatos) {
    grilla.innerHTML = `<p class="col-span-full animate-pulse rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">Cargando Pokémon…</p>`;
    contador.textContent = '';
    return;
  }

  // Estado 2 · ERROR: un mensaje amable y una salida (Reintentar). El detalle técnico, en pequeño.
  if (error && sinDatos) {
    grilla.innerHTML = `
    <div class="col-span-full rounded-2xl bg-white p-8 text-center dark:bg-slate-800">
      <p class="font-semibold text-rose-600 dark:text-rose-400">No pudimos cargar los Pokémon.</p>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Revisa tu conexión e inténtalo de nuevo. (${error})</p>
      <button type="button" data-reintentar
              class="mt-4 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Reintentar
      </button>
    </div>`;
    contador.textContent = '';
    return;
  }

  // Estado 3 · VACÍO o ÉXITO: sobre la lista de la vista actual
  const lista = listaActual();
  const visibles = filtrarPokemones(lista, filtros);

  if (visibles.length === 0) {
    // Estado vacío: nunca dejes la pantalla en blanco sin explicar por qué (y di qué hacer)
    const mensaje = vista === 'favoritos' && favoritos.length === 0
      ? 'Aún no tienes favoritos. Toca el ♡ de cualquier tarjeta.'
      : 'Ningún Pokémon coincide con la búsqueda.';
    grilla.innerHTML = `<p class="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">${mensaje}</p>`;
  } else {
    grilla.innerHTML = visibles.map(tarjetaHTML).join('');
  }

  contador.textContent = `${visibles.length} de ${lista.length} ${vista === 'favoritos' ? 'favoritos' : 'Pokémon'} · ${contarDobleTipo(visibles)} con doble tipo`;
};

// --- Buscador y filtro: cada evento cambia el ESTADO y llama a render() ---
const formBusqueda = document.querySelector('#form-busqueda');
const inputBusqueda = document.querySelector('#busqueda');
const selectTipo = document.querySelector('#filtro-tipo');

// input se dispara con CADA tecla; evento.target es el campo y .value lo que tiene escrito
inputBusqueda.addEventListener('input', (evento) => {
  filtros.texto = evento.target.value;
  render();
});

// change se dispara cuando el select cambia de opción
selectTipo.addEventListener('change', (evento) => {
  filtros.tipo = evento.target.value;
  render();
});

// Enter dentro del formulario lo envía y RECARGA la página: preventDefault lo impide
formBusqueda.addEventListener('submit', (evento) => evento.preventDefault());

// Delegación: UN listener en la grilla, que nunca se borra. Los botones se destruyen y se
// crean en cada render, pero su clic "burbujea" hasta la grilla y aquí lo atrapamos.
grilla.addEventListener('click', (evento) => {
  // ¿Clic en "Reintentar"? Ese botón también lo crea render(): la misma delegación lo atrapa
  if (evento.target.closest('[data-reintentar]')) {
    cargar();
    return;
  }

  // ¿Clic en un corazón? Cambia el estado, lo guarda en localStorage y vuelve a pintar
  const corazon = evento.target.closest('[data-fav]');
  if (corazon) {
    const pokemon = buscarPorId(listaActual(), Number(corazon.dataset.fav));
    favoritos = alternarFavorito(favoritos, pokemon);
    guardarFavoritos(favoritos);
    render();
    return;
  }

  const boton = evento.target.closest('[data-id]'); // ¿el clic fue en (o dentro de) un botón con data-id?
  if (!boton) return; // clic en otra parte de la grilla: nada que hacer
  const pokemon = buscarPorId(listaActual(), Number(boton.dataset.id));
  abrirDetalle(pokemon);
});

// "Cargar más" pide la página que diga siguiente. Es la MISMA función cargar()
btnMas.addEventListener('click', () => cargar());

// ============ CARGA ============
// async: dentro de esta función se puede usar await. Mientras espera a la red, la página
// sigue viva: await pausa ESTA función, no el navegador.
// Siempre igual: cambiar el estado → render().
// Pide la página "siguiente": la primera vez es la 1, después la 2, la 3…
const cargar = async () => {
  cargando = true; // 1. "estoy pidiendo"…
  error = null;
  render();        // …y se pinta YA, antes de esperar a la red

  try {
    const datos = await obtenerPokemones(siguiente);
    // 2a. llegó bien. Spread: un array NUEVO con los que ya había + los que llegaron
    pokemones = [...pokemones, ...datos.results];
    siguiente = datos.info.next; // la API nos dice cuál es la próxima página (o null)
  } catch (e) {
    // Aquí caen los dos tipos de error: sin red (fetch falla) y HTTP (el throw de pedirJSON)
    error = e.message; // 2b. falló: guardamos el mensaje
    console.error(e);  // y lo dejamos en la consola para quien programa
  }

  cargando = false; // 3. bien o mal, ya no estamos cargando
  render();
};

cargar();
