// js/api.js · Todo lo que habla con la API vive aquí. Ni una línea de DOM.
// Versión para la PokéAPI: la lista NO trae imágenes ni tipos (solo { name, url }),
// así que son dos tandas: 1) la lista, 2) el detalle de cada pokémon, todos a la vez.

// 24 por página. La respuesta: { count, next, previous, results: [{ name, url }, …] }
export const URL_POKEMON = 'https://pokeapi.co/api/v2/pokemon?limit=24';

// fetch espera dos veces: que el servidor CONTESTE y que llegue el CUERPO.
// Para fetch un 404 o un 500 NO es un error: lo convertimos en error revisando respuesta.ok.
export const pedirJSON = async (url) => {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`); // 404, 500…: lo convertimos en error
  }
  const datos = await respuesta.json();
  return datos;
};

export const obtenerPokemones = async (url) => {
  // Tanda 1: la lista (UNA petición)
  const lista = await pedirJSON(url);

  // Tanda 2: map convierte cada { name, url } en una PROMESA de su detalle.
  // Las 24 peticiones salen a la vez; ninguna espera a la otra.
  const promesas = lista.results.map((p) => pedirJSON(p.url));

  // Promise.all espera a que lleguen TODAS y devuelve un array con los 24 detalles,
  // en el mismo orden de la lista. Si UNA falla, falla todo (y cae en el catch de cargar).
  const detalles = await Promise.all(promesas);

  // Devolvemos la forma { info: { next }, results } para que cargar() en app.js
  // siga usando datos.results y datos.info.next.
  return { info: { next: lista.next }, results: detalles };
};
