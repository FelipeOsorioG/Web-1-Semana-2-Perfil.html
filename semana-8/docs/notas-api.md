# Notas de la API: PokéAPI

Documentación: https://pokeapi.co/docs/v2

1. **¿Cuál es la URL de la lista?**
   `https://pokeapi.co/api/v2/pokemon?limit=24` (24 por página).
2. **¿Dónde está el array?**
   En `datos.results`. Cada elemento es solo `{ name, url }`.
3. **¿Dónde está la página siguiente?**
   En `datos.next` (es `null` en la última página). En `api.js` la devuelvo como `{ info: { next }, results }` para que `app.js` use `datos.info.next`.
4. **¿Cada elemento trae todo lo que pinta la tarjeta?**
   No. La lista no trae imagen ni tipos. Hay que pedir el detalle de cada uno (`p.url`) con el patrón lista → detalles usando `Promise.all`.
   - Imagen: `sprites.other['official-artwork'].front_default`
   - Tipos: `types[].type.name` (el filtro usa el primero, `types[0].type.name`)
   - Peso: `weight / 10` kg · Altura: `height / 10` m

## Paso «Cargar más»

La API sí pagina, así que el paso se hace: el botón pide `datos.next` y desaparece cuando es `null`.

## Un pokémon que no existe

Responde 404 con `{"status": 404, "message": "Not Found"}`. `pedirJSON` lo convierte en error con `respuesta.ok`.
