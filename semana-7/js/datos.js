// js/datos.js · SOLO datos. En la semana 8 este archivo desaparece: los datos llegarán con fetch.
// Cada objeto copia la forma de https://pokeapi.co/api/v2/pokemon/{id} (solo los campos que usamos;
// la API trae muchos más). weight en hectogramos y height en decímetros: se divide entre 10.
export const pokemones = [
  {
    id: 1, name: 'bulbasaur', weight: 69, height: 7,
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' } } },
  },
  {
    id: 4, name: 'charmander', weight: 85, height: 6,
    types: [{ type: { name: 'fire' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' } } },
  },
  {
    id: 7, name: 'squirtle', weight: 90, height: 5,
    types: [{ type: { name: 'water' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' } } },
  },
  {
    id: 25, name: 'pikachu', weight: 60, height: 4,
    types: [{ type: { name: 'electric' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' } } },
  },
  {
    id: 39, name: 'jigglypuff', weight: 55, height: 5,
    types: [{ type: { name: 'normal' } }, { type: { name: 'fairy' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png' } } },
  },
  {
    id: 94, name: 'gengar', weight: 405, height: 15,
    types: [{ type: { name: 'ghost' } }, { type: { name: 'poison' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png' } } },
  },
  {
    id: 133, name: 'eevee', weight: 65, height: 3,
    types: [{ type: { name: 'normal' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' } } },
  },
  {
    id: 143, name: 'snorlax', weight: 4600, height: 21,
    types: [{ type: { name: 'normal' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png' } } },
  },
  {
    id: 122, name: 'mr-mime', weight: 545, height: 13,
    types: [{ type: { name: 'psychic' } }, { type: { name: 'fairy' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png' } } },
  },
  {
    id: 68, name: 'machamp', weight: 1300, height: 16,
    types: [{ type: { name: 'fighting' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png' } } },
  },
  {
    id: 149, name: 'dragonite', weight: 2100, height: 22,
    types: [{ type: { name: 'dragon' } }, { type: { name: 'flying' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png' } } },
  },
  {
    id: 131, name: 'lapras', weight: 2200, height: 25,
    types: [{ type: { name: 'water' } }, { type: { name: 'ice' } }],
    sprites: { other: { 'official-artwork': { front_default:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png' } } },
  },
];
