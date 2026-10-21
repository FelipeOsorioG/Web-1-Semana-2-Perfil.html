export function filtrarPokemon(lista, { texto = '', tipo = '' } = {}) {
  const consulta = texto.trim().toLowerCase().replace(/^#/, '');
  return lista.filter((pokemon) => {
    const coincideTexto = !consulta || pokemon.name.toLowerCase().includes(consulta) || String(pokemon.id) === consulta;
    const coincideTipo = !tipo || pokemon.types.some((elemento) => elemento.type.name === tipo);
    return coincideTexto && coincideTipo;
  });
}

export function buscarPorId(lista, id) {
  return lista.find((pokemon) => pokemon.id === Number(id));
}

export function alternarIdFavorito(favoritos, id) {
  return favoritos.includes(Number(id))
    ? favoritos.filter((favorito) => favorito !== Number(id))
    : [...favoritos, Number(id)];
}

export function formatearNumero(id) {
  return `N.º ${String(id).padStart(4, '0')}`;
}

export function capitalizar(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}
