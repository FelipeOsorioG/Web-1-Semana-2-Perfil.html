// js/app.js · La interfaz: DOM y eventos. Importa lo que necesita de los otros dos módulos.
// Las rutas empiezan con ./ y terminan en .js: en el navegador las dos cosas son obligatorias.
import { pokemones } from './datos.js';
import { filtrarPokemones, contarDobleTipo, buscarPorId } from './logica.js';

// ============ ESTADO ============
const filtros = { texto: '', tipo: '' };

// ============ PRESENTACIÓN ============
// Cada tipo de la API → texto en español + clases COMPLETAS de Tailwind
// (nunca armadas por pedazos: Tailwind solo genera las clases que encuentra escritas enteras)
const TIPOS = {
  normal: { texto: 'Normal', clases: 'bg-stone-200 text-stone-700' },
  fire: { texto: 'Fuego', clases: 'bg-orange-100 text-orange-700' },
  water: { texto: 'Agua', clases: 'bg-sky-100 text-sky-700' },
  electric: { texto: 'Eléctrico', clases: 'bg-yellow-100 text-yellow-700' },
  grass: { texto: 'Planta', clases: 'bg-emerald-100 text-emerald-700' },
  ice: { texto: 'Hielo', clases: 'bg-cyan-100 text-cyan-700' },
  fighting: { texto: 'Lucha', clases: 'bg-red-100 text-red-700' },
  poison: { texto: 'Veneno', clases: 'bg-purple-100 text-purple-700' },
  ground: { texto: 'Tierra', clases: 'bg-amber-100 text-amber-700' },
  flying: { texto: 'Volador', clases: 'bg-indigo-100 text-indigo-700' },
  psychic: { texto: 'Psíquico', clases: 'bg-pink-100 text-pink-700' },
  bug: { texto: 'Bicho', clases: 'bg-lime-100 text-lime-700' },
  rock: { texto: 'Roca', clases: 'bg-zinc-200 text-zinc-700' },
  ghost: { texto: 'Fantasma', clases: 'bg-violet-100 text-violet-700' },
  dragon: { texto: 'Dragón', clases: 'bg-blue-100 text-blue-700' },
  dark: { texto: 'Siniestro', clases: 'bg-slate-300 text-slate-800' },
  steel: { texto: 'Acero', clases: 'bg-gray-200 text-gray-700' },
  fairy: { texto: 'Hada', clases: 'bg-rose-100 text-rose-700' },
};

// Si algún día la API trae un tipo que no está en TIPOS, no rompemos la tarjeta
const tipoInfo = (nombre) => TIPOS[nombre] ?? { texto: nombre, clases: 'bg-slate-200 text-slate-600' };

const imagenDe = (p) => p.sprites.other['official-artwork'].front_default;

// Recibe UN pokémon y devuelve el HTML de SU tarjeta: es la tarjeta de la semana 6
// copiada tal cual, con ${…} en cada lugar donde antes iba un dato escrito a mano.
const tarjetaHTML = (p) => `
  <article class="flex flex-col overflow-hidden rounded-2xl bg-white shadow group transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800">
    <div class="overflow-hidden bg-slate-100 dark:bg-slate-700">
      <img src="${imagenDe(p)}" alt="${p.name}"
           class="aspect-square w-full object-contain p-4 transition group-hover:scale-105">
    </div>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <h3 class="text-lg font-bold text-slate-900 capitalize dark:text-white">${p.name}</h3>
      <div class="flex flex-wrap gap-1">${p.types.map((t) => `<span class="w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoInfo(t.type.name).clases}">${tipoInfo(t.type.name).texto}</span>`).join('')}</div>
      <p class="text-sm text-slate-500 dark:text-slate-400">${p.weight / 10} kg · ${p.height / 10} m</p>
      <button type="button" data-id="${p.id}"
              class="mt-auto rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Ver detalle
      </button>
    </div>
  </article>`;

// ============ DOM ============
// --- Menú móvil: mostrar/ocultar y avisar al lector de pantalla ---
const btnMenu = document.getElementById('btn-menu');
const menu = document.getElementById('menu');

btnMenu.addEventListener('click', function () {
  menu.classList.toggle('hidden'); // si tiene hidden se lo quita, si no se lo pone
  const abierto = !menu.classList.contains('hidden');
  btnMenu.setAttribute('aria-expanded', abierto); // true / false
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

// render: ESTADO → pantalla. Ya no recibe la lista: la calcula a partir de filtros.
// Regla del patrón: cuando algo cambia, se cambia el estado y se llama render(). Nada más.
const render = () => {
  const visibles = filtrarPokemones(pokemones, filtros);

  if (visibles.length === 0) {
    // Estado vacío: nunca dejes la pantalla en blanco sin explicar por qué
    grilla.innerHTML = `<p class="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ningún Pokémon coincide con la búsqueda.</p>`;
  } else {
    grilla.innerHTML = visibles.map(tarjetaHTML).join('');
  }

  contador.textContent = `${visibles.length} de ${pokemones.length} Pokémon · ${contarDobleTipo(visibles)} con doble tipo`;
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
  const boton = evento.target.closest('[data-id]'); // ¿el clic fue en (o dentro de) un botón con data-id?
  if (!boton) return; // clic en otra parte de la grilla: nada que hacer
  const pokemon = buscarPorId(pokemones, Number(boton.dataset.id));
  abrirDetalle(pokemon);
});

// Primer pintado
render();
