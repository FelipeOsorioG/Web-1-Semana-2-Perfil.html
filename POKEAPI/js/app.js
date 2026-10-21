import { obtenerPagina, obtenerPorNombre } from './api.js';
import { alternarIdFavorito, buscarPorId, capitalizar, filtrarPokemon, formatearNumero } from './logica.js';
import { guardarFavoritos, leerFavoritos } from './favoritos.js';

const grid = document.querySelector('#pokemon-grid');
const panelEstado = document.querySelector('#status-panel');
const resumen = document.querySelector('#results-summary');
const contador = document.querySelector('#loaded-count');
const contadorFavoritos = document.querySelector('#favorite-count');
const botonMas = document.querySelector('#load-more');
const formulario = document.querySelector('#search-form');
const campoBusqueda = document.querySelector('#search-input');
const filtroTipo = document.querySelector('#type-filter');
const titulo = document.querySelector('#results-title');
const dialogo = document.querySelector('#pokemon-dialog');
const dialogContent = document.querySelector('#dialog-content');
const menu = document.querySelector('#menu-links');
const menuToggle = document.querySelector('#menu-toggle');
const themeToggle = document.querySelector('#theme-toggle');

let pokemon = [];
let siguiente = 'local://pokemon?offset=0';
let cargando = false;
let error = null;
let vista = 'all';
let favoritos = leerFavoritos();
let peticionBusqueda = 0;

const nombresTipos = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico', grass: 'Planta', ice: 'Hielo',
  fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero', fairy: 'Hada'
};

function mostrarEstado(tipo, mensaje, detalle = '') {
  panelEstado.classList.remove('hidden');
  panelEstado.replaceChildren();
  if (tipo === 'loading') {
    const loader = document.createElement('span');
    loader.className = 'loader';
    loader.setAttribute('aria-hidden', 'true');
    panelEstado.append(loader);
  } else {
    const icono = document.createElement('span');
    icono.className = 'empty-icon';
    icono.textContent = tipo === 'error' ? '⚠️' : '🔎';
    panelEstado.append(icono);
  }
  const texto = document.createElement('p');
  texto.className = 'mt-3 font-bold';
  texto.textContent = mensaje;
  panelEstado.append(texto);
  if (detalle) {
    const descripcion = document.createElement('p');
    descripcion.className = 'mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400';
    descripcion.textContent = detalle;
    panelEstado.append(descripcion);
  }
  if (tipo === 'error') {
    const reintentar = document.createElement('button');
    reintentar.type = 'button';
    reintentar.className = 'mt-4 rounded-full bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700';
    reintentar.textContent = 'Reintentar';
    reintentar.addEventListener('click', () => cargar(siguiente ?? 'local://pokemon?offset=0'));
    panelEstado.append(reintentar);
  }
}

function tarjetaHTML(p) {
  const imagen = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
  const tipos = p.types.map(({ type }) => `<span class="type-chip type-${type.name}">${nombresTipos[type.name] ?? capitalizar(type.name)}</span>`).join('');
  const esFavorito = favoritos.includes(p.id);
  return `<article class="pokemon-card group">
    <div class="pokemon-art">
      <span class="pokemon-number">${formatearNumero(p.id)}</span>
      <button type="button" class="favorite-button ${esFavorito ? 'is-favorite' : ''}" data-fav="${p.id}" aria-label="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}: ${p.name}" aria-pressed="${esFavorito}">${esFavorito ? '♥' : '♡'}</button>
      <img src="${imagen}" alt="Ilustración de ${p.name}" loading="lazy" ${imagen ? '' : 'hidden'}>
    </div>
    <div class="pokemon-card-body">
      <h3 class="pokemon-name">${capitalizar(p.name)}</h3>
      <div class="type-list">${tipos}</div>
      <p class="pokemon-meta">Altura ${(p.height / 10).toFixed(1)} m · Peso ${(p.weight / 10).toFixed(1)} kg</p>
      <button type="button" data-detail="${p.id}" class="detail-button">Ver detalles</button>
    </div>
  </article>`;
}

function listaActual() {
  return vista === 'favorites' ? pokemon.filter((p) => favoritos.includes(p.id)) : filtrarPokemon(pokemon, { texto: campoBusqueda.value, tipo: filtroTipo.value });
}

function render() {
  contadorFavoritos.textContent = String(favoritos.length);
  const lista = listaActual();
  titulo.textContent = vista === 'favorites' ? 'Tus Pokémon favoritos' : 'Pokédex';
  resumen.textContent = vista === 'favorites' ? `${lista.length} Pokémon guardados en este navegador` : `Mostrando ${lista.length} de ${pokemon.length} Pokémon cargados`;
  contador.textContent = `${lista.length} Pokémon`;
  grid.innerHTML = lista.map(tarjetaHTML).join('');
  panelEstado.classList.add('hidden');
  if (error) {
    mostrarEstado('error', 'No encontramos resultados.', error);
  } else if (!cargando && lista.length === 0) {
    if (vista === 'favorites') mostrarEstado('empty', 'Todavía no tienes favoritos.', 'Pulsa el corazón de cualquier Pokémon para guardarlo aquí.');
    else mostrarEstado('empty', 'No encontramos Pokémon.', 'Prueba con otro nombre, número o tipo, o limpia los filtros.');
  }
  botonMas.classList.toggle('hidden', vista === 'favorites' || !siguiente);
  botonMas.disabled = cargando;
  botonMas.textContent = cargando ? 'Cargando…' : 'Cargar más Pokémon';
}

async function cargar(url = siguiente) {
  if (!url || cargando) return;
  cargando = true;
  error = null;
  botonMas.disabled = true;
  if (pokemon.length === 0) mostrarEstado('loading', 'Cargando Pokémon…', 'Cargando los datos locales del explorador.');
  try {
    const datos = await obtenerPagina(url);
    const ids = new Set(pokemon.map((p) => p.id));
    pokemon = [...pokemon, ...datos.pokemon.filter((p) => !ids.has(p.id))];
    siguiente = datos.siguiente;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
  } finally {
    cargando = false;
    render();
  }
}

function abrirDetalle(p) {
  if (!p) return;
  const imagen = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
  const tipos = p.types.map(({ type }) => `<span class="type-chip type-${type.name}">${nombresTipos[type.name] ?? capitalizar(type.name)}</span>`).join('');
  const stats = p.stats.map(({ base_stat, stat }) => `<div class="stat-row"><span>${capitalizar(stat.name.replace('-', ' '))}</span><div class="stat-track"><div class="stat-fill" style="width:${Math.min(base_stat, 150) / 150 * 100}%"></div></div><strong>${base_stat}</strong></div>`).join('');
  dialogContent.innerHTML = `<div class="dialog-top"><button type="button" class="dialog-close" data-close-dialog aria-label="Cerrar detalles">×</button><img src="${imagen}" alt="Ilustración de ${p.name}"></div>
    <div class="dialog-body"><p class="text-sm font-black uppercase tracking-widest text-red-600">${formatearNumero(p.id)}</p><h2 class="mt-1 text-3xl font-black capitalize">${p.name}</h2><div class="type-list mt-3">${tipos}</div>
    <div class="mt-5 grid grid-cols-2 gap-3"><div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><p class="text-xs text-slate-500 dark:text-slate-400">Altura</p><p class="mt-1 text-lg font-extrabold">${(p.height / 10).toFixed(1)} m</p></div><div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><p class="text-xs text-slate-500 dark:text-slate-400">Peso</p><p class="mt-1 text-lg font-extrabold">${(p.weight / 10).toFixed(1)} kg</p></div></div>
    <h3 class="mt-6 text-lg font-black">Estadísticas base</h3><div class="mt-2">${stats}</div><h3 class="mt-6 text-lg font-black">Habilidades</h3><p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${p.abilities.map(({ ability }) => capitalizar(ability.name.replace('-', ' '))).join(', ')}</p>
    <button type="button" data-dialog-fav="${p.id}" class="mt-6 w-full rounded-xl ${favoritos.includes(p.id) ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white' : 'bg-red-600 text-white hover:bg-red-700'} px-5 py-3 font-extrabold">${favoritos.includes(p.id) ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos'}</button></div>`;
  if (!dialogo.open) dialogo.showModal();
}

function alternarFavorito(id) {
  favoritos = alternarIdFavorito(favoritos, id);
  guardarFavoritos(favoritos);
  render();
  if (dialogo.open) {
    const p = buscarPorId(pokemon, id);
    abrirDetalle(p);
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const consulta = campoBusqueda.value.trim().toLowerCase().replace(/^#/, '');
  if (!consulta || vista === 'favorites') {
    vista = 'all';
    render();
    return;
  }
  const local = filtrarPokemon(pokemon, { texto: consulta, tipo: filtroTipo.value });
  if (local.length) {
    vista = 'all';
    render();
    return;
  }
  if (!/^[a-z0-9-]+$/.test(consulta)) {
    vista = 'all';
    render();
    return;
  }
  const token = ++peticionBusqueda;
  cargando = true;
  mostrarEstado('loading', 'Buscando Pokémon…', 'Buscando en el catálogo local incluido en el proyecto.');
  try {
    const encontrado = await obtenerPorNombre(consulta);
    if (token !== peticionBusqueda) return;
    if (encontrado) {
      if (!pokemon.some((p) => p.id === encontrado.id)) pokemon = [...pokemon, encontrado];
      campoBusqueda.value = encontrado.name;
    } else {
      error = 'No encontramos ese Pokémon en el catálogo local. Prueba otro nombre o número.';
    }
    vista = 'all';
  } catch (e) {
    if (token === peticionBusqueda) error = 'No se pudo completar la búsqueda local.';
  } finally {
    if (token === peticionBusqueda) {
      cargando = false;
      render();
      if (error && !pokemon.some((p) => p.name === consulta || String(p.id) === consulta)) mostrarEstado('empty', 'Pokémon no encontrado.', error);
      error = null;
    }
  }
});

campoBusqueda.addEventListener('input', () => {
  error = null;
  peticionBusqueda++;
  vista = 'all';
  render();
});
filtroTipo.addEventListener('change', () => { error = null; vista = 'all'; render(); });
document.querySelector('#clear-filters').addEventListener('click', () => {
  error = null;
  campoBusqueda.value = '';
  filtroTipo.value = '';
  vista = 'all';
  render();
  campoBusqueda.focus();
});
botonMas.addEventListener('click', () => cargar());

grid.addEventListener('click', (evento) => {
  const favorito = evento.target.closest('[data-fav]');
  if (favorito) {
    alternarFavorito(Number(favorito.dataset.fav));
    return;
  }
  const detalle = evento.target.closest('[data-detail]');
  if (detalle) abrirDetalle(buscarPorId(pokemon, detalle.dataset.detail));
});

dialogContent.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-close-dialog]')) dialogo.close();
  const boton = evento.target.closest('[data-dialog-fav]');
  if (boton) alternarFavorito(Number(boton.dataset.dialogFav));
});
dialogo.addEventListener('click', (evento) => {
  if (evento.target === dialogo) dialogo.close();
});

document.querySelectorAll('[data-view]').forEach((boton) => {
  boton.addEventListener('click', () => {
    vista = boton.dataset.view;
    document.querySelectorAll('[data-view]').forEach((elemento) => elemento.classList.toggle('active', elemento === boton));
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    menuToggle.setAttribute('aria-expanded', 'false');
    render();
  });
});
menuToggle.addEventListener('click', () => {
  const abierto = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!abierto));
  menu.classList.toggle('hidden', abierto);
  menu.classList.toggle('flex', !abierto);
});
themeToggle.addEventListener('click', () => {
  const oscuro = document.documentElement.classList.toggle('dark');
  themeToggle.textContent = oscuro ? '☀ Tema' : '☾ Tema';
  try { localStorage.setItem('pokeapi:tema', oscuro ? 'dark' : 'light'); } catch {}
});
try {
  if (localStorage.getItem('pokeapi:tema') === 'dark') {
    document.documentElement.classList.add('dark');
    themeToggle.textContent = '☀ Tema';
  }
} catch {}

cargar();
