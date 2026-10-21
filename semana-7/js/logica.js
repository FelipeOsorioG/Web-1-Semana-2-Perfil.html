// js/logica.js · Funciones PURAS: reciben datos y devuelven datos.
// Prueba de fuego: aquí no aparece la palabra document. Se podrían usar en un programa sin pantalla.

// Dos filter encadenados. Los nombres de la PokéAPI ya vienen en minúsculas.
// El filtro es el primer tipo del pokémon: grass, fire, water…
export const filtrarPokemones = (lista, { texto, tipo }) => {
  const buscado = texto.trim().toLowerCase();
  return lista
    .filter((p) => p.name.includes(buscado))
    .filter((p) => tipo === '' || p.types[0].type.name === tipo);
};

// reduce: recorre la lista llevando un acumulador (total) que empieza en 0.
// Aquí cuenta los pokémon que tienen dos tipos.
export const contarDobleTipo = (lista) =>
  lista.reduce((total, p) => (p.types.length === 2 ? total + 1 : total), 0);

// find: el PRIMER elemento que cumple, o undefined si ninguno
export const buscarPorId = (lista, id) => lista.find((p) => p.id === id);
