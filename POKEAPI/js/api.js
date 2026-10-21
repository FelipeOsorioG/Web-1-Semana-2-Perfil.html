import { pokemonLocales } from './datos.js';

const TAMANO_PAGINA = 12;

export async function obtenerPagina(url = 'local://pokemon?offset=0') {
  const parametros = new URLSearchParams(url.split('?')[1] || 'offset=0');
  const offset = Number(parametros.get('offset')) || 0;
  const pokemon = pokemonLocales.slice(offset, offset + TAMANO_PAGINA);
  const siguienteOffset = offset + TAMANO_PAGINA;
  return {
    pokemon,
    siguiente: siguienteOffset < pokemonLocales.length ? `local://pokemon?offset=${siguienteOffset}` : null,
    total: pokemonLocales.length
  };
}

export async function obtenerPorNombre(consulta) {
  const normalizado = String(consulta).trim().toLowerCase().replace(/^#/, '');
  if (!normalizado) return null;
  return pokemonLocales.find((pokemon) => pokemon.name === normalizado || String(pokemon.id) === normalizado) ?? null;
}
