const CLAVE = 'pokeapi:favoritos';

export function leerFavoritos() {
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(valor) ? valor.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

export function guardarFavoritos(ids) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ids));
  } catch {
    return false;
  }
  return true;
}
