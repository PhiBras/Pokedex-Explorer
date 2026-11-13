/**
 * BattleAnimator & ArticulatedRig v4.0 — Motor de Animações Fiéis aos Jogos Oficiais (Zero Hash / Zero Cálculo Aleatório)
 *
 * Princípios v4.0:
 * 1. Coreografia Canônica Explícita por Golpe: Cada golpe é mapeado para seu efeito real dos jogos
 *    (ex: Fire Blast em estrela 大, Draco Meteor com meteoros caindo do céu, Solar Beam com carga solar e laser
 *    contínuo, Aura Sphere/Shadow Ball como esferas concentradas, Water Shuriken com shurikens múltiplas,
 *    Earthquake com fissuras e pilares sísmicos, Swords Dance com espadas orbitando, Protect com escudo, etc.).
 * 2. Anatomia Real por Espécie (PokeAPI `species.shape` + Perfis Oficiais): Usa o formato corporal oficial
 *    da Pokédex (`wings`, `quadruped`, `upright`, `humanoid`, `serpentine`, `fish`, `arms`, `tentacles`, `ball`,
 *    `heads`) e os pontos reais de disparo (canhões duplos do Blastoise, boca do Charizard, flor dorsal do
 *    Venusaur, bochechas do Pikachu, palmas do Lucario, etc.), sem nenhuma geração por hash.
 * 3. Sprite Íntegro Sem Cortes: Rig hierárquico de 3 pivôs sem `clip-path`, eliminando qualquer rasgo em asas ou caudas.
 */

const TYPE_PALETTES = {
  FOGO:     { outline: '#7f1d1d', outer: '#ea580c', mid: '#facc15', core: '#fef9c3' },
  FIRE:     { outline: '#7f1d1d', outer: '#ea580c', mid: '#facc15', core: '#fef9c3' },
  AGUA:     { outline: '#1e3a8a', outer: '#0284c7', mid: '#38bdf8', core: '#e0f2fe' },
  WATER:    { outline: '#1e3a8a', outer: '#0284c7', mid: '#38bdf8', core: '#e0f2fe' },
  PLANTA:   { outline: '#14532d', outer: '#16a34a', mid: '#84cc16', core: '#fef08a' },
  GRASS:    { outline: '#14532d', outer: '#16a34a', mid: '#84cc16', core: '#fef08a' },
  ELETRICO: { outline: '#713f12', outer: '#eab308', mid: '#fef08a', core: '#ffffff' },
  ELECTRIC: { outline: '#713f12', outer: '#eab308', mid: '#fef08a', core: '#ffffff' },
  VOADOR:   { outline: '#1e293b', outer: '#64748b', mid: '#cbd5e1', core: '#ffffff' },
  FLYING:   { outline: '#1e293b', outer: '#64748b', mid: '#cbd5e1', core: '#ffffff' },
  DRAGAO:   { outline: '#312e81', outer: '#4f46e5', mid: '#06b6d4', core: '#ecfeff' },
  DRAGON:   { outline: '#312e81', outer: '#4f46e5', mid: '#06b6d4', core: '#ecfeff' },
  GELO:     { outline: '#164e63', outer: '#06b6d4', mid: '#a5f3fc', core: '#ffffff' },
  ICE:      { outline: '#164e63', outer: '#06b6d4', mid: '#a5f3fc', core: '#ffffff' },
  VENENO:   { outline: '#3b0764', outer: '#7e22ce', mid: '#c084fc', core: '#f3e8ff' },
  POISON:   { outline: '#3b0764', outer: '#7e22ce', mid: '#c084fc', core: '#f3e8ff' },
  FANTASMA: { outline: '#1e1b4b', outer: '#4338ca', mid: '#818cf8', core: '#e0e7ff' },
  GHOST:    { outline: '#1e1b4b', outer: '#4338ca', mid: '#818cf8', core: '#e0e7ff' },
  PSIQUICO: { outline: '#831843', outer: '#db2777', mid: '#f472b6', core: '#fce7f3' },
  PSYCHIC:  { outline: '#831843', outer: '#db2777', mid: '#f472b6', core: '#fce7f3' },
  SOMBRIO:  { outline: '#09090b', outer: '#27272a', mid: '#71717a', core: '#e4e4e7' },
  DARK:     { outline: '#09090b', outer: '#27272a', mid: '#71717a', core: '#e4e4e7' },
  ACO:      { outline: '#1e293b', outer: '#475569', mid: '#94a3b8', core: '#f8fafc' },
  STEEL:    { outline: '#1e293b', outer: '#475569', mid: '#94a3b8', core: '#f8fafc' },
  PEDRA:    { outline: '#451a03', outer: '#78350f', mid: '#b45309', core: '#fde68a' },
  ROCK:     { outline: '#451a03', outer: '#78350f', mid: '#b45309', core: '#fde68a' },
  TERRA:    { outline: '#422006', outer: '#854d0e', mid: '#ca8a04', core: '#fef08a' },
  GROUND:   { outline: '#422006', outer: '#854d0e', mid: '#ca8a04', core: '#fef08a' },
  LUTADOR:  { outline: '#7f1d1d', outer: '#b91c1c', mid: '#f87171', core: '#fee2e2' },
  FIGHTING: { outline: '#7f1d1d', outer: '#b91c1c', mid: '#f87171', core: '#fee2e2' },
  INSETO:   { outline: '#365314', outer: '#65a30d', mid: '#a3e635', core: '#ecfccb' },
  BUG:      { outline: '#365314', outer: '#65a30d', mid: '#a3e635', core: '#ecfccb' },
  FADA:     { outline: '#831843', outer: '#ec4899', mid: '#f9a8d4', core: '#ffffff' },
  FAIRY:    { outline: '#831843', outer: '#ec4899', mid: '#f9a8d4', core: '#ffffff' },
  NORMAL:   { outline: '#3f3f46', outer: '#71717a', mid: '#d4d4d8', core: '#ffffff' },
};

/**
 * Mapeamento direto do `shape.name` oficial da PokeAPI (`GET /api/v2/pokemon-species/{id}`)
 */
const POKEAPI_SHAPE_RIGS = {
  'wings':      { bodyType: 'winged',    dualEmitter: false, muzzleX: 0.72, muzzleY: 0.35, rigLean: 1.15 },
  'bug-wings':  { bodyType: 'winged',    dualEmitter: false, muzzleX: 0.68, muzzleY: 0.38, rigLean: 1.10 },
  'quadruped':  { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.38, rigLean: 1.00 },
  'upright':    { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.66, muzzleY: 0.40, rigLean: 1.05 },
  'humanoid':   { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.05 },
  'arms':       { bodyType: 'floating',  dualEmitter: true,  muzzleX: 0.64, muzzleY: 0.44, rigLean: 1.00 },
  'legs':       { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.62, muzzleY: 0.45, rigLean: 1.00 },
  'serpentine': { bodyType: 'serpentine',dualEmitter: false, muzzleX: 0.72, muzzleY: 0.30, rigLean: 1.20 },
  'fish':       { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.72, muzzleY: 0.44, rigLean: 1.05 },
  'ball':       { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.60, muzzleY: 0.46, rigLean: 0.90 },
  'blob':       { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.60, muzzleY: 0.48, rigLean: 0.90 },
  'tentacles':  { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.64, muzzleY: 0.44, rigLean: 0.95 },
  'heads':      { bodyType: 'floating',  dualEmitter: true,  muzzleX: 0.66, muzzleY: 0.38, rigLean: 1.00 },
  'armor':      { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.68, muzzleY: 0.42, rigLean: 0.90 },
};

/**
 * Pontos anatômicos oficiais para espécies notáveis (ID da Pokédex e slug)
 */
const OFFICIAL_SPECIES_RIGS = {
  // Iniciais & Evoluções Clássicas
  '3':   { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.55, muzzleY: 0.28, rigLean: 0.85 }, // Venusaur (flor dorsal)
  'venusaur': { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.55, muzzleY: 0.28, rigLean: 0.85 },
  '6':   { bodyType: 'winged',    dualEmitter: false, muzzleX: 0.74, muzzleY: 0.32, rigLean: 1.15 }, // Charizard (boca)
  'charizard': { bodyType: 'winged', dualEmitter: false, muzzleX: 0.74, muzzleY: 0.32, rigLean: 1.15 },
  '9':   { bodyType: 'artillery', dualEmitter: true,  muzzleX: 0.48, muzzleY: 0.26, rigLean: 0.75 }, // Blastoise (2 canhões)
  'blastoise': { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.48, muzzleY: 0.26, rigLean: 0.75 },
  '25':  { bodyType: 'biped',     dualEmitter: true,  muzzleX: 0.62, muzzleY: 0.44, rigLean: 1.10 }, // Pikachu (bochechas)
  'pikachu': { bodyType: 'biped', dualEmitter: true, muzzleX: 0.62, muzzleY: 0.44, rigLean: 1.10 },
  '65':  { bodyType: 'floating',  dualEmitter: true,  muzzleX: 0.62, muzzleY: 0.40, rigLean: 0.90 }, // Alakazam (colheres)
  'alakazam': { bodyType: 'floating', dualEmitter: true, muzzleX: 0.62, muzzleY: 0.40, rigLean: 0.90 },
  '68':  { bodyType: 'biped',     dualEmitter: true,  muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.10 }, // Machamp (4 braços)
  'machamp': { bodyType: 'biped', dualEmitter: true, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.10 },
  '94':  { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.62, muzzleY: 0.45, rigLean: 1.05 }, // Gengar
  'gengar': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.62, muzzleY: 0.45, rigLean: 1.05 },
  '130': { bodyType: 'serpentine',dualEmitter: false, muzzleX: 0.74, muzzleY: 0.28, rigLean: 1.20 }, // Gyarados
  'gyarados': { bodyType: 'serpentine', dualEmitter: false, muzzleX: 0.74, muzzleY: 0.28, rigLean: 1.20 },
  '143': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.60, muzzleY: 0.44, rigLean: 0.75 }, // Snorlax
  'snorlax': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.60, muzzleY: 0.44, rigLean: 0.75 },
  '149': { bodyType: 'winged',    dualEmitter: false, muzzleX: 0.70, muzzleY: 0.30, rigLean: 1.10 }, // Dragonite
  'dragonite': { bodyType: 'winged', dualEmitter: false, muzzleX: 0.70, muzzleY: 0.30, rigLean: 1.10 },
  '150': { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.64, muzzleY: 0.38, rigLean: 1.00 }, // Mewtwo
  'mewtwo': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.64, muzzleY: 0.38, rigLean: 1.00 },
  '248': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.68, muzzleY: 0.34, rigLean: 0.95 }, // Tyranitar
  'tyranitar': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.68, muzzleY: 0.34, rigLean: 0.95 },
  '254': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.68, muzzleY: 0.40, rigLean: 1.15 }, // Sceptile
  'sceptile': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.68, muzzleY: 0.40, rigLean: 1.15 },
  '257': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.15 }, // Blaziken
  'blaziken': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.15 },
  '260': { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.68, muzzleY: 0.44, rigLean: 1.00 }, // Swampert
  'swampert': { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.68, muzzleY: 0.44, rigLean: 1.00 },
  '282': { bodyType: 'floating',  dualEmitter: false, muzzleX: 0.64, muzzleY: 0.42, rigLean: 0.95 }, // Gardevoir
  'gardevoir': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.64, muzzleY: 0.42, rigLean: 0.95 },
  '373': { bodyType: 'winged',    dualEmitter: false, muzzleX: 0.72, muzzleY: 0.38, rigLean: 1.15 }, // Salamence
  'salamence': { bodyType: 'winged', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.38, rigLean: 1.15 },
  '376': { bodyType: 'quadruped', dualEmitter: true,  muzzleX: 0.64, muzzleY: 0.46, rigLean: 0.85 }, // Metagross
  'metagross': { bodyType: 'quadruped', dualEmitter: true, muzzleX: 0.64, muzzleY: 0.46, rigLean: 0.85 },
  '384': { bodyType: 'serpentine',dualEmitter: false, muzzleX: 0.74, muzzleY: 0.28, rigLean: 1.20 }, // Rayquaza
  'rayquaza': { bodyType: 'serpentine', dualEmitter: false, muzzleX: 0.74, muzzleY: 0.28, rigLean: 1.20 },
  '445': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.70, muzzleY: 0.36, rigLean: 1.15 }, // Garchomp
  'garchomp': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.70, muzzleY: 0.36, rigLean: 1.15 },
  '448': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.66, muzzleY: 0.44, rigLean: 1.10 }, // Lucario (palmas)
  'lucario': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.44, rigLean: 1.10 },
  '467': { bodyType: 'artillery', dualEmitter: true,  muzzleX: 0.56, muzzleY: 0.44, rigLean: 0.90 }, // Magmortar (2 canhões)
  'magmortar': { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.56, muzzleY: 0.44, rigLean: 0.90 },
  '658': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.15 }, // Greninja
  'greninja': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.15 },
  '815': { bodyType: 'biped',     dualEmitter: false, muzzleX: 0.64, muzzleY: 0.56, rigLean: 1.15 }, // Cinderace (chute)
  'cinderace': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.64, muzzleY: 0.56, rigLean: 1.15 },
};

/**
 * CATÁLOGO CANÔNICO DE GOLPES OFICIAIS (Coreografia fiel aos jogos da série principal — zero hash)
 */
const CANONICAL_MOVES = {
  // === FEIXES & LASERS CONTÍNUOS ===
  'hyper beam':       { engine: 'straight_laser', charge: 'energy_gather', width: 1.45, duration: 1050 },
  'hiper raio':       { engine: 'straight_laser', charge: 'energy_gather', width: 1.45, duration: 1050 },
  'solar beam':       { engine: 'straight_laser', charge: 'solar_absorb',  width: 1.40, duration: 1100 },
  'raio solar':       { engine: 'straight_laser', charge: 'solar_absorb',  width: 1.40, duration: 1100 },
  'ice beam':         { engine: 'straight_laser', charge: 'frost_gather',  width: 1.05, duration: 820 },
  'raio de gelo':     { engine: 'straight_laser', charge: 'frost_gather',  width: 1.05, duration: 820 },
  'flash cannon':     { engine: 'straight_laser', charge: 'metal_shine',   width: 1.15, duration: 850 },
  'charge beam':      { engine: 'straight_laser', charge: 'static_gather', width: 0.85, duration: 760 },
  'signal beam':      { engine: 'straight_laser', charge: 'energy_gather', width: 0.95, duration: 780 },
  'aurora beam':      { engine: 'straight_laser', charge: 'frost_gather',  width: 0.95, duration: 780 },
  'psybeam':          { engine: 'straight_laser', charge: 'psychic_rings', width: 0.90, duration: 780 },
  'bubble beam':      { engine: 'multi_projectile', shape: 'bubble', count: 7, duration: 760 },
  'water gun':        { engine: 'fluid_stream',   charge: 'none',          width: 0.72, duration: 640 },
  'jato de agua':     { engine: 'fluid_stream',   charge: 'none',          width: 0.72, duration: 640 },
  'moongeist beam':   { engine: 'straight_laser', charge: 'energy_gather', width: 1.45, duration: 1050 },
  'dynamax cannon':   { engine: 'straight_laser', charge: 'energy_gather', width: 1.50, duration: 1080 },
  'eternabeam':       { engine: 'straight_laser', charge: 'energy_gather', width: 1.60, duration: 1150 },
  'prismatic laser':  { engine: 'straight_laser', charge: 'solar_absorb',  width: 1.45, duration: 1050 },
  'meteor beam':      { engine: 'straight_laser', charge: 'solar_absorb',  width: 1.40, duration: 1050 },
  'steel beam':       { engine: 'straight_laser', charge: 'metal_shine',   width: 1.45, duration: 1050, recoil: true },
  'roar of time':     { engine: 'straight_laser', charge: 'energy_gather', width: 1.55, duration: 1120 },

  // === JATOS ELEMENTAIS & TORRENTES ===
  'flamethrower':     { engine: 'fluid_stream',   charge: 'flame_breath',  width: 1.10, duration: 880 },
  'lanca chamas':     { engine: 'fluid_stream',   charge: 'flame_breath',  width: 1.10, duration: 880 },
  'hydro pump':       { engine: 'fluid_stream',   charge: 'water_press',   width: 1.35, duration: 920 },
  'hidro bomba':      { engine: 'fluid_stream',   charge: 'water_press',   width: 1.35, duration: 920 },
  'dragon breath':    { engine: 'fluid_stream',   charge: 'flame_breath',  width: 0.95, duration: 800 },
  'incinerate':       { engine: 'fluid_stream',   charge: 'flame_breath',  width: 1.00, duration: 780 },
  'mystical fire':    { engine: 'fluid_stream',   charge: 'flame_breath',  width: 0.95, duration: 820 },
  'scald':            { engine: 'fluid_stream',   charge: 'water_press',   width: 1.05, duration: 820 },
  'steam eruption':   { engine: 'fluid_stream',   charge: 'water_press',   width: 1.35, duration: 940 },
  'water spout':      { engine: 'fluid_stream',   charge: 'water_press',   width: 1.45, duration: 960 },
  'eruption':         { engine: 'meteor_shower',  shape: 'magma_rock',     count: 6,    duration: 980 },
  'blue flare':       { engine: 'fluid_stream',   charge: 'flame_breath',  width: 1.45, duration: 980 },
  'searing shot':     { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 940 },

  // === ESTRELA DE FOGO (大) ===
  'fire blast':       { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 980 },
  'rajada de fogo':   { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 980 },
  'sacred fire':      { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 980 },
  'blast burn':       { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 1080 },
  'overheat':         { engine: 'fire_blast_star',charge: 'flame_breath',  duration: 980 },

  // === ESFERAS CONCENTRADAS ===
  'shadow ball':      { engine: 'energy_sphere',  charge: 'dark_gather',   radius: 9,   duration: 820 },
  'bola sombria':     { engine: 'energy_sphere',  charge: 'dark_gather',   radius: 9,   duration: 820 },
  'aura sphere':      { engine: 'energy_sphere',  charge: 'aura_gather',   radius: 8.5, duration: 760 },
  'esfera de aura':   { engine: 'energy_sphere',  charge: 'aura_gather',   radius: 8.5, duration: 760 },
  'energy ball':      { engine: 'energy_sphere',  charge: 'nature_gather', radius: 8.5, duration: 800 },
  'bola de energia':  { engine: 'energy_sphere',  charge: 'nature_gather', radius: 8.5, duration: 800 },
  'focus blast':      { engine: 'energy_sphere',  charge: 'aura_gather',   radius: 11,  duration: 920 },
  'sludge bomb':      { engine: 'energy_sphere',  charge: 'poison_gather', radius: 8.5, duration: 800 },
  'electro ball':     { engine: 'energy_sphere',  charge: 'static_gather', radius: 8.5, duration: 760 },
  'gyro ball':        { engine: 'energy_sphere',  charge: 'metal_shine',   radius: 8.5, duration: 780 },
  'weather ball':     { engine: 'energy_sphere',  charge: 'energy_gather', radius: 8,   duration: 760 },
  'zap cannon':       { engine: 'energy_sphere',  charge: 'static_gather', radius: 11,  duration: 920 },
  'seed bomb':        { engine: 'energy_sphere',  charge: 'nature_gather', radius: 8,   duration: 780 },
  'mud bomb':         { engine: 'energy_sphere',  charge: 'ground_gather', radius: 8,   duration: 780 },
  'pyro ball':        { engine: 'energy_sphere',  charge: 'flame_breath',  radius: 10.5,duration: 880 },
  'mist ball':        { engine: 'energy_sphere',  charge: 'psychic_rings', radius: 8,   duration: 780 },
  'luster purge':     { engine: 'straight_laser', charge: 'psychic_rings', width: 1.2,  duration: 880 },
  'pollen puff':      { engine: 'energy_sphere',  charge: 'nature_gather', radius: 8,   duration: 780 },

  // === PROJÉTEIS MÚLTIPLOS (Contagem e Forma Canônica) ===
  'razor leaf':       { engine: 'multi_projectile', shape: 'leaf',     count: 5, duration: 760 },
  'folha navalha':    { engine: 'multi_projectile', shape: 'leaf',     count: 5, duration: 760 },
  'magical leaf':     { engine: 'multi_projectile', shape: 'leaf',     count: 5, duration: 760 },
  'leaf storm':       { engine: 'cyclone_vortex',   shape: 'leaf',     duration: 960 },
  'petal blizzard':   { engine: 'cyclone_vortex',   shape: 'petal',    duration: 940 },
  'petal dance':      { engine: 'cyclone_vortex',   shape: 'petal',    duration: 920 },
  'water shuriken':   { engine: 'multi_projectile', shape: 'shuriken', count: 4, duration: 640, fast: true },
  'swift':            { engine: 'multi_projectile', shape: 'star',     count: 5, duration: 700 },
  'estrelas cadentes':{ engine: 'multi_projectile', shape: 'star',     count: 5, duration: 700 },
  'bullet seed':      { engine: 'multi_projectile', shape: 'seed',     count: 4, duration: 740 },
  'icicle spear':     { engine: 'multi_projectile', shape: 'icicle',   count: 4, duration: 740 },
  'ice shard':        { engine: 'multi_projectile', shape: 'icicle',   count: 3, duration: 560, fast: true },
  'rock blast':       { engine: 'multi_projectile', shape: 'rock',     count: 4, duration: 760 },
  'rock throw':       { engine: 'multi_projectile', shape: 'rock',     count: 1, duration: 700 },
  'power gem':        { engine: 'multi_projectile', shape: 'crystal',  count: 5, duration: 780 },
  'pin missile':      { engine: 'multi_projectile', shape: 'needle',   count: 4, duration: 720 },
  'spike cannon':     { engine: 'multi_projectile', shape: 'needle',   count: 4, duration: 720 },
  'twineedle':        { engine: 'multi_projectile', shape: 'needle',   count: 2, duration: 660 },
  'poison sting':     { engine: 'multi_projectile', shape: 'needle',   count: 1, duration: 600 },
  'bonemerang':       { engine: 'multi_projectile', shape: 'bone',     count: 2, duration: 760 },
  'bone rush':        { engine: 'multi_projectile', shape: 'bone',     count: 4, duration: 760 },
  'ember':            { engine: 'multi_projectile', shape: 'flame',    count: 3, duration: 660 },
  'brasa':            { engine: 'multi_projectile', shape: 'flame',    count: 3, duration: 660 },
  'bubble':           { engine: 'multi_projectile', shape: 'bubble',   count: 5, duration: 680 },
  'bolhas':           { engine: 'multi_projectile', shape: 'bubble',   count: 5, duration: 680 },

  // === RELÂMPAGOS & ARCOS ELÉTRICOS ===
  'thunderbolt':      { engine: 'lightning_bolt', style: 'horizontal_arc', charge: 'static_gather', duration: 780 },
  'choque do trovao': { engine: 'lightning_bolt', style: 'horizontal_arc', charge: 'none',          duration: 640 },
  'thunder shock':    { engine: 'lightning_bolt', style: 'horizontal_arc', charge: 'none',          duration: 640 },
  'thunder':          { engine: 'lightning_bolt', style: 'sky_strike',     charge: 'static_gather', duration: 920 },
  'trovao':           { engine: 'lightning_bolt', style: 'sky_strike',     charge: 'static_gather', duration: 920 },
  'bolt strike':      { engine: 'lightning_bolt', style: 'sky_strike',     charge: 'static_gather', duration: 960 },
  'spark':            { engine: 'physical_rush',  style: 'heavy_tackle',   fast: true,              duration: 580 },
  'discharge':        { engine: 'expanding_rings',charge: 'static_gather', rings: 4,                duration: 820 },
  'volt switch':      { engine: 'lightning_bolt', style: 'horizontal_arc', charge: 'none',          duration: 680 },
  'electro drift':    { engine: 'lightning_bolt', style: 'sky_strike',     charge: 'static_gather', duration: 920 },

  // === GARRAS, LÂMINAS & CORTES ===
  'dragon claw':      { engine: 'slash_or_claw', style: 'triple_claw',  duration: 660 },
  'garra de dragao':  { engine: 'slash_or_claw', style: 'triple_claw',  duration: 660 },
  'shadow claw':      { engine: 'slash_or_claw', style: 'triple_claw',  duration: 660 },
  'metal claw':       { engine: 'slash_or_claw', style: 'triple_claw',  duration: 640 },
  'crush claw':       { engine: 'slash_or_claw', style: 'triple_claw',  duration: 660 },
  'scratch':          { engine: 'slash_or_claw', style: 'triple_claw',  duration: 580 },
  'arranhao':         { engine: 'slash_or_claw', style: 'triple_claw',  duration: 580 },
  'fury swipes':      { engine: 'slash_or_claw', style: 'fury_swipes',  duration: 760 },
  'x scissor':        { engine: 'slash_or_claw', style: 'x_cross',      duration: 660 },
  'cross chop':       { engine: 'slash_or_claw', style: 'x_cross',      duration: 680 },
  'cross poison':     { engine: 'slash_or_claw', style: 'x_cross',      duration: 660 },
  'air slash':        { engine: 'slash_or_claw', style: 'single_blade', duration: 660 },
  'leaf blade':       { engine: 'slash_or_claw', style: 'single_blade', duration: 660 },
  'night slash':      { engine: 'slash_or_claw', style: 'single_blade', duration: 660 },
  'psycho cut':       { engine: 'slash_or_claw', style: 'single_blade', duration: 660 },
  'sacred sword':     { engine: 'slash_or_claw', style: 'single_blade', duration: 680 },
  'secret sword':     { engine: 'slash_or_claw', style: 'single_blade', duration: 680 },
  'slash':            { engine: 'slash_or_claw', style: 'single_blade', duration: 620 },
  'cut':              { engine: 'slash_or_claw', style: 'single_blade', duration: 600 },
  'aerial ace':       { engine: 'slash_or_claw', style: 'single_blade', fast: true, duration: 540 },
  'aqua cutter':      { engine: 'slash_or_claw', style: 'single_blade', duration: 640 },
  'behemoth blade':   { engine: 'slash_or_claw', style: 'single_blade', duration: 760 },
  'solar blade':      { engine: 'slash_or_claw', style: 'single_blade', charge: 'solar_absorb', duration: 920 },
  'razor shell':      { engine: 'slash_or_claw', style: 'single_blade', duration: 660 },

  // === MORDIDAS & PRESAS ===
  'bite':             { engine: 'fang_bite', duration: 640 },
  'mordida':          { engine: 'fang_bite', duration: 640 },
  'crunch':           { engine: 'fang_bite', duration: 680 },
  'mastigada':        { engine: 'fang_bite', duration: 680 },
  'fire fang':        { engine: 'fang_bite', duration: 660 },
  'ice fang':         { engine: 'fang_bite', duration: 660 },
  'thunder fang':     { engine: 'fang_bite', duration: 660 },
  'poison fang':      { engine: 'fang_bite', duration: 660 },
  'psychic fangs':    { engine: 'fang_bite', duration: 680 },
  'hyper fang':       { engine: 'fang_bite', duration: 660 },
  'super fang':       { engine: 'fang_bite', duration: 660 },
  'jaw lock':         { engine: 'fang_bite', duration: 680 },
  'fishious rend':    { engine: 'fang_bite', duration: 700 },

  // === SOCOS, CHUTES & COMBOS ===
  'fire punch':       { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 660 },
  'ice punch':        { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 660 },
  'thunder punch':    { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 660 },
  'shadow punch':     { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 660 },
  'bullet punch':     { engine: 'punch_or_kick', style: 'single_heavy_impact', fast: true, duration: 520 },
  'mach punch':       { engine: 'punch_or_kick', style: 'single_heavy_impact', fast: true, duration: 520 },
  'jet punch':        { engine: 'punch_or_kick', style: 'single_heavy_impact', fast: true, duration: 540 },
  'meteor mash':      { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 720 },
  'hammer arm':       { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 720 },
  'ice hammer':       { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 720 },
  'sky uppercut':     { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 700 },
  'mega punch':       { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 680 },
  'mega kick':        { engine: 'punch_or_kick', style: 'axe_kick', duration: 720 },
  'high jump kick':   { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 740 },
  'blaze kick':       { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 680 },
  'trop kick':        { engine: 'punch_or_kick', style: 'single_heavy_impact', duration: 660 },
  'close combat':     { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 5, duration: 840 },
  'combate proximo':  { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 5, duration: 840 },
  'double kick':      { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 2, duration: 660 },
  'triple kick':      { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 3, duration: 720 },
  'triple axel':      { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 3, duration: 740 },
  'surging strikes':  { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 3, duration: 740 },
  'arm thrust':       { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 4, duration: 740 },
  'comet punch':      { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 4, duration: 740 },
  'outrage':          { engine: 'punch_or_kick', style: 'multi_strike_combo',  strikes: 4, duration: 840 },

  // === INVESTIDAS FÍSICAS & VELOCIDADE ===
  'quick attack':     { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 520 },
  'ataque rapido':    { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 520 },
  'extreme speed':    { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 500 },
  'aqua jet':         { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 520 },
  'accelerock':       { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 520 },
  'shadow sneak':     { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 540 },
  'sucker punch':     { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 520 },
  'first impression': { engine: 'physical_rush', style: 'speed_dash',   fast: true, duration: 540 },
  'tackle':           { engine: 'physical_rush', style: 'heavy_tackle', duration: 620 },
  'investida':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 620 },
  'body slam':        { engine: 'physical_rush', style: 'body_slam', duration: 720 },
  'take down':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 680, recoil: true },
  'double edge':      { engine: 'physical_rush', style: 'recoil_ram', duration: 760, recoil: true },
  'flare blitz':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 780, recoil: true },
  'brave bird':       { engine: 'physical_rush', style: 'heavy_tackle', duration: 780, recoil: true },
  'volt tackle':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 780, recoil: true },
  'wild charge':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 720, recoil: true },
  'head smash':       { engine: 'physical_rush', style: 'heavy_tackle', duration: 780, recoil: true },
  'wood hammer':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 740, recoil: true },
  'wave crash':       { engine: 'physical_rush', style: 'heavy_tackle', duration: 760, recoil: true },
  'giga impact':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 840 },
  'iron head':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 660 },
  'zen headbutt':     { engine: 'physical_rush', style: 'heavy_tackle', duration: 660 },
  'waterfall':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 680 },
  'aqua tail':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 680 },
  'dragon rush':      { engine: 'physical_rush', style: 'heavy_tackle', duration: 740 },
  'play rough':       { engine: 'punch_or_kick', style: 'multi_strike_combo', strikes: 4, duration: 780 },
  'megahorn':         { engine: 'physical_rush', style: 'heavy_tackle', duration: 720 },
  'drill run':        { engine: 'physical_rush', style: 'heavy_tackle', duration: 680 },
  'collision course': { engine: 'physical_rush', style: 'heavy_tackle', duration: 760 },

  // === TERREMOTOS, ROCHAS & METEOROS ===
  'earthquake':       { engine: 'ground_seismic', style: 'fissure_pillars', duration: 920 },
  'terremoto':        { engine: 'ground_seismic', style: 'fissure_pillars', duration: 920 },
  'earth power':      { engine: 'ground_seismic', style: 'fissure_pillars', duration: 880 },
  'fissure':          { engine: 'ground_seismic', style: 'fissure_pillars', duration: 960 },
  'bulldoze':         { engine: 'ground_seismic', style: 'fissure_pillars', duration: 820 },
  'stomping tantrum': { engine: 'ground_seismic', style: 'fissure_pillars', duration: 820 },
  'precipice blades': { engine: 'ground_seismic', style: 'fissure_pillars', duration: 940 },
  'frenzy plant':     { engine: 'ground_seismic', style: 'fissure_pillars', duration: 1020 },
  'grass knot':       { engine: 'ground_seismic', style: 'fissure_pillars', duration: 760 },
  'stone edge':       { engine: 'ground_seismic', style: 'stone_edge_ring', duration: 820 },
  'gume de pedra':    { engine: 'ground_seismic', style: 'stone_edge_ring', duration: 820 },
  'rock slide':       { engine: 'meteor_shower',  shape: 'boulder', count: 5, duration: 840 },
  'deslizamento de rochas': { engine: 'meteor_shower', shape: 'boulder', count: 5, duration: 840 },
  'draco meteor':     { engine: 'meteor_shower',  shape: 'meteor',  count: 6, duration: 1020 },
  'meteoro do dragao':{ engine: 'meteor_shower',  shape: 'meteor',  count: 6, duration: 1020 },
  'icicle crash':     { engine: 'meteor_shower',  shape: 'icicle',  count: 5, duration: 820 },

  // === ONDAS DE ÁREA, CICLONES & PULSOS ===
  'surf':             { engine: 'tidal_wave', duration: 920 },
  'surfar':           { engine: 'tidal_wave', duration: 920 },
  'muddy water':      { engine: 'tidal_wave', duration: 900 },
  'heat wave':        { engine: 'tidal_wave', duration: 900 },
  'sludge wave':      { engine: 'tidal_wave', duration: 900 },
  'origin pulse':     { engine: 'tidal_wave', duration: 960 },
  'hurricane':        { engine: 'cyclone_vortex', shape: 'wind',      duration: 940 },
  'furacao':          { engine: 'cyclone_vortex', shape: 'wind',      duration: 940 },
  'blizzard':         { engine: 'cyclone_vortex', shape: 'snowflake', duration: 960 },
  'nevasca':          { engine: 'cyclone_vortex', shape: 'snowflake', duration: 960 },
  'twister':          { engine: 'cyclone_vortex', shape: 'wind',      duration: 820 },
  'whirlpool':        { engine: 'cyclone_vortex', shape: 'water',     duration: 860 },
  'fire spin':        { engine: 'cyclone_vortex', shape: 'flame',     duration: 860 },
  'sand tomb':        { engine: 'cyclone_vortex', shape: 'sand',      duration: 860 },
  'gust':             { engine: 'cyclone_vortex', shape: 'wind',      duration: 720 },
  'psychic':          { engine: 'expanding_rings', charge: 'psychic_rings', rings: 4, duration: 820 },
  'psiquico':         { engine: 'expanding_rings', charge: 'psychic_rings', rings: 4, duration: 820 },
  'psyshock':         { engine: 'expanding_rings', charge: 'psychic_rings', rings: 3, duration: 780 },
  'psystrike':        { engine: 'expanding_rings', charge: 'psychic_rings', rings: 5, duration: 880 },
  'dragon pulse':     { engine: 'expanding_rings', charge: 'energy_gather', rings: 4, duration: 800 },
  'dark pulse':       { engine: 'expanding_rings', charge: 'dark_gather',   rings: 4, duration: 800 },
  'water pulse':      { engine: 'expanding_rings', charge: 'water_press',   rings: 3, duration: 760 },
  'hyper voice':      { engine: 'expanding_rings', charge: 'none',          rings: 5, duration: 820 },
  'boomburst':        { engine: 'expanding_rings', charge: 'none',          rings: 6, duration: 900 },
  'bug buzz':         { engine: 'expanding_rings', charge: 'none',          rings: 4, duration: 780 },
  'dazzling gleam':   { engine: 'expanding_rings', charge: 'solar_absorb',  rings: 4, duration: 800 },
  'torch song':       { engine: 'expanding_rings', charge: 'flame_breath',  rings: 4, duration: 820 },

  // === DRENAGEM VITAL ===
  'giga drain':       { engine: 'drain_life', duration: 960 },
  'mega drain':       { engine: 'drain_life', duration: 900 },
  'absorb':           { engine: 'drain_life', duration: 840 },
  'leech life':       { engine: 'drain_life', duration: 900 },
  'draining kiss':    { engine: 'drain_life', duration: 860 },
  'oblivion wing':    { engine: 'drain_life', duration: 980 },
  'parabolic charge': { engine: 'drain_life', duration: 920 },
  'horn leech':       { engine: 'drain_life', duration: 900 },
  'drain punch':      { engine: 'drain_life', duration: 900 },

  // === STATUS, BUFFS, ESCUDOS & CURAS ===
  'swords dance':     { engine: 'status_and_support', style: 'orbiting_swords', duration: 840 },
  'danca das espadas':{ engine: 'status_and_support', style: 'orbiting_swords', duration: 840 },
  'protect':          { engine: 'status_and_support', style: 'shield_barrier',  duration: 780 },
  'protecao':         { engine: 'status_and_support', style: 'shield_barrier',  duration: 780 },
  'detect':           { engine: 'status_and_support', style: 'shield_barrier',  duration: 740 },
  'reflect':          { engine: 'status_and_support', style: 'shield_barrier',  duration: 780 },
  'light screen':     { engine: 'status_and_support', style: 'shield_barrier',  duration: 780 },
  'aurora veil':      { engine: 'status_and_support', style: 'shield_barrier',  duration: 800 },
  'iron defense':     { engine: 'status_and_support', style: 'shield_barrier',  duration: 760 },
  'kings shield':     { engine: 'status_and_support', style: 'shield_barrier',  duration: 780 },
  'recover':          { engine: 'status_and_support', style: 'heal_sparkles',   duration: 820 },
  'recuperar':        { engine: 'status_and_support', style: 'heal_sparkles',   duration: 820 },
  'roost':            { engine: 'status_and_support', style: 'heal_sparkles',   duration: 820 },
  'synthesis':        { engine: 'status_and_support', style: 'heal_sparkles',   duration: 840 },
  'moonlight':        { engine: 'status_and_support', style: 'heal_sparkles',   duration: 840 },
  'morning sun':      { engine: 'status_and_support', style: 'heal_sparkles',   duration: 840 },
  'soft boiled':      { engine: 'status_and_support', style: 'heal_sparkles',   duration: 820 },
  'slack off':        { engine: 'status_and_support', style: 'heal_sparkles',   duration: 820 },
  'rest':             { engine: 'status_and_support', style: 'sleep_zzz',       duration: 860 },
  'dragon dance':     { engine: 'status_and_support', style: 'stat_boost_aura', duration: 840 },
  'calm mind':        { engine: 'status_and_support', style: 'stat_boost_aura', duration: 820 },
  'nasty plot':       { engine: 'status_and_support', style: 'stat_boost_aura', duration: 820 },
  'bulk up':          { engine: 'status_and_support', style: 'stat_boost_aura', duration: 820 },
  'quiver dance':     { engine: 'status_and_support', style: 'stat_boost_aura', duration: 840 },
  'shell smash':      { engine: 'status_and_support', style: 'stat_boost_aura', duration: 860 },
  'geomancy':         { engine: 'status_and_support', style: 'stat_boost_aura', duration: 960 },
  'toxic':            { engine: 'status_and_support', style: 'poison_bubbles',  targetSelf: false, duration: 820 },
  'toxico':           { engine: 'status_and_support', style: 'poison_bubbles',  targetSelf: false, duration: 820 },
  'will o wisp':      { engine: 'status_and_support', style: 'will_o_wisp',     targetSelf: false, duration: 840 },
  'thunder wave':     { engine: 'status_and_support', style: 'thunder_cage',    targetSelf: false, duration: 780 },
  'onda de trovao':   { engine: 'status_and_support', style: 'thunder_cage',    targetSelf: false, duration: 780 },
  'spore':            { engine: 'status_and_support', style: 'sleep_spores',    targetSelf: false, duration: 820 },
  'sleep powder':     { engine: 'status_and_support', style: 'sleep_spores',    targetSelf: false, duration: 820 },
  'hypnosis':         { engine: 'status_and_support', style: 'sleep_spores',    targetSelf: false, duration: 820 },
  'leech seed':       { engine: 'multi_projectile',   shape: 'seed', count: 3,  duration: 780 },
  'growl':            { engine: 'status_and_support', style: 'stat_drop_target',targetSelf: false, duration: 720 },
  'leer':             { engine: 'status_and_support', style: 'stat_drop_target',targetSelf: false, duration: 720 },
  'tail whip':        { engine: 'status_and_support', style: 'stat_drop_target',targetSelf: false, duration: 720 },
  'screech':          { engine: 'status_and_support', style: 'stat_drop_target',targetSelf: false, duration: 740 },
};

function normalizeKey(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ');
}

function normalizeType(rawType) {
  if (!rawType) return 'NORMAL';
  return String(rawType)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Resolve o perfil anatômico real do Pokémon usando:
 * 1. Tabela de espécies notáveis (`OFFICIAL_SPECIES_RIGS`)
 * 2. Campo oficial `shape` da PokeAPI (`POKEAPI_SHAPE_RIGS`)
 * 3. Fallback determinístico limpo (`biped`) — sem nenhum hash ou cálculo aleatório.
 */
function resolveOfficialSpeciesRig({ name = '', shape = '', types = [] }, spriteEl) {
  let identifier = normalizeKey(name);
  let dexId = '';
  const shapeKey = normalizeKey(shape);

  if (spriteEl) {
    const img = spriteEl.tagName === 'IMG' ? spriteEl : spriteEl.querySelector('img');
    const src = img?.src || '';
    const alt = normalizeKey(img?.alt || spriteEl.dataset?.pokemon || spriteEl.dataset?.species || '');
    const idMatch = src.match(/\/(\d+)\.(?:gif|png|webp|svg)/i);
    if (idMatch) dexId = idMatch[1];
    if (!identifier) identifier = alt || dexId;
  }

  let baseRig = null;
  if (dexId && OFFICIAL_SPECIES_RIGS[dexId]) {
    baseRig = OFFICIAL_SPECIES_RIGS[dexId];
  } else if (identifier && OFFICIAL_SPECIES_RIGS[identifier]) {
    baseRig = OFFICIAL_SPECIES_RIGS[identifier];
  } else if (shapeKey && POKEAPI_SHAPE_RIGS[shapeKey]) {
    baseRig = POKEAPI_SHAPE_RIGS[shapeKey];
  } else {
    baseRig = { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.42, rigLean: 1.0 };
  }

  // Cor secundária vem exclusivamente do 2º tipo oficial do Pokémon (se existir)
  const secondaryType = Array.isArray(types) && types[1] ? normalizeType(types[1]) : '';
  const secondaryPalette = secondaryType ? TYPE_PALETTES[secondaryType] : null;

  return {
    id: identifier || dexId || 'pokemon',
    ...baseRig,
    secondaryAccent: secondaryPalette ? secondaryPalette.mid : null,
  };
}

/**
 * Resolve a coreografia exata do golpe sem nenhum cálculo por hash:
 * 1. Consulta direta no `CANONICAL_MOVES`
 * 2. Regras semânticas exatas baseadas no nome e nos metadados oficiais da PokeAPI (`damageClass`, `target`, `meta`).
 */
function resolveCanonicalMove({
  moveName = '',
  moveType = 'NORMAL',
  damageClass = '',
  power = 0,
  priority = 0,
  drain = 0,
  target = '',
  meta = null,
}) {
  const key = normalizeKey(moveName);
  const typeUpper = normalizeType(moveType);
  const dmgClass = normalizeKey(damageClass);
  const pwr = Math.max(0, Number(power) || 0);
  const prio = Number(priority) || 0;
  const drainVal = Number(drain) || Number(meta?.drain) || 0;
  const targetStr = normalizeKey(target);
  const minHits = Number(meta?.min_hits) || 0;
  const maxHits = Number(meta?.max_hits) || 0;
  const hitCount = minHits > 0 ? Math.min(5, Math.max(2, Math.round((minHits + (maxHits || minHits)) / 2))) : 0;
  const powerScale = pwr > 0 ? Math.min(1.45, Math.max(0.75, pwr / 90)) : 1.0;

  // 1. Consulta direta no catálogo canônico
  const exact = CANONICAL_MOVES[key];
  if (exact) {
    return {
      key,
      type: typeUpper,
      power: pwr,
      powerScale,
      fast: Boolean(exact.fast || prio > 0),
      recoil: Boolean(exact.recoil || drainVal < 0),
      charge: exact.charge || 'none',
      ...exact,
      count: exact.count || hitCount || 4,
    };
  }

  // 2. Mapeamento determinístico direto pelos metadados oficiais da PokeAPI (sem hash)
  if (dmgClass === 'status' || pwr === 0) {
    const category = normalizeKey(meta?.category?.name || meta?.category || '');
    if (category.includes('heal') || /heal|recover|roost|wish|rest|milk|soft|synthesis|moonlight|morning|cura/.test(key)) {
      return { key, type: typeUpper, engine: 'status_and_support', style: 'heal_sparkles', targetSelf: true, duration: 820, powerScale: 1 };
    }
    if (/protect|detect|guard|barrier|screen|veil|shield|substitute|defense|amnesia|escudo|prote/.test(key)) {
      return { key, type: typeUpper, engine: 'status_and_support', style: 'shield_barrier', targetSelf: true, duration: 780, powerScale: 1 };
    }
    if (targetStr.includes('user') || category.includes('net good stats')) {
      return { key, type: typeUpper, engine: 'status_and_support', style: 'stat_boost_aura', targetSelf: true, duration: 820, powerScale: 1 };
    }
    return { key, type: typeUpper, engine: 'status_and_support', style: 'stat_drop_target', targetSelf: false, duration: 760, powerScale: 1 };
  }

  if (drainVal > 0) {
    return { key, type: typeUpper, engine: 'drain_life', duration: 920, powerScale };
  }

  if (hitCount > 0) {
    const shapeByType = {
      GRASS: 'leaf', PLANTA: 'leaf',
      ICE: 'icicle', GELO: 'icicle',
      ROCK: 'rock', PEDRA: 'rock',
      WATER: 'shuriken', AGUA: 'shuriken',
      BUG: 'needle', INSETO: 'needle',
    };
    if (dmgClass === 'physical' && !shapeByType[typeUpper]) {
      return { key, type: typeUpper, engine: 'punch_or_kick', style: 'multi_strike_combo', strikes: hitCount, duration: 760, powerScale };
    }
    return { key, type: typeUpper, engine: 'multi_projectile', shape: shapeByType[typeUpper] || 'star', count: hitCount, duration: 760, powerScale };
  }

  if (dmgClass === 'physical') {
    if (/claw|slash|cut|blade|scissor|garra|corte|lamina/.test(key)) {
      return { key, type: typeUpper, engine: 'slash_or_claw', style: 'single_blade', fast: prio > 0, duration: 660, powerScale };
    }
    if (/bite|crunch|fang|jaw|mordida|presa/.test(key)) {
      return { key, type: typeUpper, engine: 'fang_bite', fast: prio > 0, duration: 660, powerScale };
    }
    if (/punch|kick|hammer|slam|soco|chute/.test(key)) {
      return { key, type: typeUpper, engine: 'punch_or_kick', style: 'single_heavy_impact', fast: prio > 0, duration: 680, powerScale };
    }
    return {
      key,
      type: typeUpper,
      engine: 'physical_rush',
      style: prio > 0 ? 'speed_dash' : 'heavy_tackle',
      fast: prio > 0,
      recoil: drainVal < 0,
      duration: prio > 0 ? 520 : 680,
      powerScale,
    };
  }

  // Special attacks não listados: classifica pelo sufixo oficial do golpe
  if (/beam|ray|cannon|laser|raio|canhao/.test(key)) {
    return { key, type: typeUpper, engine: 'straight_laser', charge: 'energy_gather', width: powerScale, duration: 860, powerScale };
  }
  if (/ball|sphere|bomb|orb|bola|esfera|bomba/.test(key)) {
    return { key, type: typeUpper, engine: 'energy_sphere', charge: 'energy_gather', radius: 8.5, duration: 800, powerScale };
  }
  if (/pulse|voice|wave|roar|snarl|pulso|voz|onda/.test(key) || targetStr.includes('all-opponents')) {
    return { key, type: typeUpper, engine: 'expanding_rings', charge: 'energy_gather', rings: 4, duration: 820, powerScale };
  }
  if (/storm|wind|tornado|hurricane|tempestade|vento/.test(key)) {
    return { key, type: typeUpper, engine: 'cyclone_vortex', shape: 'wind', duration: 900, powerScale };
  }

  return { key, type: typeUpper, engine: 'fluid_stream', charge: 'energy_gather', width: powerScale, duration: 820, powerScale };
}

function injectRigStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pbfx-rig-styles')) return;

  const style = document.createElement('style');
  style.id = 'pbfx-rig-styles';
  style.textContent = `
    .pbfx-rig-root {
      position: relative;
      display: inline-block;
      user-select: none;
      will-change: transform, filter, opacity;
    }
    .pbfx-rig-placeholder {
      visibility: hidden;
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
    }
    .pbfx-rig-joint {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      will-change: transform;
    }
    .pbfx-rig-sprite {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: pixelated;
      pointer-events: none;
    }
    .pbfx-rig-base {
      transform-origin: 50% 96%;
      z-index: 1;
    }
    .pbfx-rig-torso {
      transform-origin: 50% 72%;
      z-index: 2;
    }
    .pbfx-rig-head {
      transform-origin: 50% 48%;
      z-index: 3;
    }
    .pbfx-ghost-trail {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: pixelated;
      pointer-events: none;
      z-index: 0;
    }
    @keyframes pbfx-arena-shake {
      0%, 100% { transform: translate(0, 0); }
      20%      { transform: translate(-5px, 3px); }
      40%      { transform: translate(5px, -3px); }
      60%      { transform: translate(-4px, -2px); }
      80%      { transform: translate(4px, 2px); }
    }
    .pbfx-arena-shake {
      animation: pbfx-arena-shake 0.3s steps(2, end);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Rig Hierárquico Sem Cortes (Sprite Íntegro + Anatomia Oficial da Pokédex)
 */
class ArticulatedRig {
  constructor(spriteEl, speciesInfo = {}) {
    if (!spriteEl) throw new Error('ArticulatedRig: spriteEl é obrigatório.');
    injectRigStyles();

    const normalizedInfo = typeof speciesInfo === 'string' ? { name: speciesInfo } : (speciesInfo || {});

    if (spriteEl._pbfxRig) {
      if (normalizedInfo.name || normalizedInfo.shape) {
        spriteEl._pbfxRig.setSpecies(normalizedInfo);
      }
      return spriteEl._pbfxRig;
    }

    this.originalEl = spriteEl;
    this.idleAnims = [];
    this.koAnims = [];
    this.koGeneration = 0;
    this.speciesProfile = resolveOfficialSpeciesRig(normalizedInfo, spriteEl);

    const initialSrc = spriteEl.tagName === 'IMG'
      ? spriteEl.src
      : (spriteEl.querySelector('img')?.src || '');

    const root = document.createElement('div');
    root.className = 'pbfx-rig-root';
    if (spriteEl.id) root.id = spriteEl.id;
    if (spriteEl.className) {
      spriteEl.className.split(/\s+/).filter(Boolean).forEach((c) => root.classList.add(c));
    }

    const cs = window.getComputedStyle(spriteEl);
    if (cs.width && cs.width !== '0px') root.style.width = cs.width;
    if (cs.height && cs.height !== '0px') root.style.height = cs.height;

    const placeholder = document.createElement('img');
    placeholder.className = 'pbfx-rig-placeholder';
    placeholder.alt = spriteEl.alt || normalizedInfo.name || '';
    if (initialSrc) placeholder.src = initialSrc;

    this.baseEl = document.createElement('div');
    this.baseEl.className = 'pbfx-rig-joint pbfx-rig-base';

    this.torsoEl = document.createElement('div');
    this.torsoEl.className = 'pbfx-rig-joint pbfx-rig-torso';

    this.headEl = document.createElement('div');
    this.headEl.className = 'pbfx-rig-joint pbfx-rig-head';

    this.spriteImg = document.createElement('img');
    this.spriteImg.className = 'pbfx-rig-sprite';
    this.spriteImg.alt = spriteEl.alt || normalizedInfo.name || '';

    this.headEl.appendChild(this.spriteImg);
    this.torsoEl.appendChild(this.headEl);
    this.baseEl.appendChild(this.torsoEl);
    root.appendChild(placeholder);
    root.appendChild(this.baseEl);

    this.root = root;
    this.placeholder = placeholder;

    if (spriteEl.parentNode) {
      spriteEl.parentNode.replaceChild(root, spriteEl);
    }

    root._pbfxRig = this;
    if (initialSrc) this.setSprite(initialSrc, normalizedInfo);
    this.startIdle();
  }

  setSpecies(speciesInfo = {}) {
    const info = typeof speciesInfo === 'string' ? { name: speciesInfo } : (speciesInfo || {});
    this.speciesProfile = resolveOfficialSpeciesRig(info, this.root);
    this.startIdle();
  }

  setSprite(src, speciesInfo = {}) {
    this.koGeneration += 1;
    this.koAnims.forEach((animation) => animation.cancel());
    this.koAnims = [];
    const info = typeof speciesInfo === 'string' ? { name: speciesInfo } : (speciesInfo || {});
    if (src) {
      this.placeholder.src = src;
      this.spriteImg.src = src;
    }
    if (info.name) {
      this.placeholder.alt = info.name;
      this.spriteImg.alt = info.name;
    }
    this.speciesProfile = resolveOfficialSpeciesRig(info, this.root);
    this.root.style.opacity = '1';
    this.root.style.transform = '';
    this.root.style.filter = '';
    this.baseEl.style.transform = '';
    this.torsoEl.style.transform = '';
    this.headEl.style.transform = '';
    this.startIdle();
  }

  startIdle() {
    this.stopIdle();
    const bt = this.speciesProfile?.bodyType || 'biped';

    if (bt === 'floating' || bt === 'winged') {
      const opts = { duration: 1350, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'translateY(0px) scaleY(1)' }, { transform: 'translateY(-4px) scaleY(0.99)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'rotate(-1.3deg)' }, { transform: 'rotate(1.5deg)' }],
          opts
        ),
      ];
    } else if (bt === 'artillery' || bt === 'quadruped') {
      const opts = { duration: 1700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'scaleY(1) scaleX(1)' }, { transform: 'scaleY(0.97) scaleX(1.02)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'rotate(-0.8deg)' }, { transform: 'rotate(1deg)' }],
          opts
        ),
      ];
    } else {
      const opts = { duration: 1450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'scaleY(1) scaleX(1)' }, { transform: 'scaleY(0.975) scaleX(1.02)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'rotate(-1.2deg)' }, { transform: 'rotate(1.5deg)' }],
          opts
        ),
      ];
    }
  }

  stopIdle() {
    this.idleAnims.forEach((a) => a.cancel());
    this.idleAnims = [];
  }

  _spawnDashGhosts(dir, distancePx, duration, glowColor) {
    if (!this.spriteImg?.src) return;
    [0.14, 0.28].forEach((offsetRatio, idx) => {
      const ghost = document.createElement('img');
      ghost.src = this.spriteImg.src;
      ghost.className = 'pbfx-ghost-trail';
      if (glowColor) {
        ghost.style.filter = `drop-shadow(0 0 6px ${glowColor}) brightness(1.3)`;
      }
      this.root.appendChild(ghost);
      const travel = distancePx * (0.55 + idx * 0.25) * dir;
      const anim = ghost.animate(
        [
          { transform: 'translateX(0px) scaleX(1)', opacity: 0 },
          { transform: `translateX(${travel * 0.5}px) scaleX(1.06)`, opacity: 0.42, offset: 0.35 },
          { transform: `translateX(${travel}px) scaleX(1)`, opacity: 0 },
        ],
        { duration: duration * 0.65, delay: duration * offsetRatio * 0.3, easing: 'ease-out' }
      );
      anim.onfinish = () => ghost.remove();
    });
  }

  async playWindup(dir, glowColor, moveSpec) {
    this.stopIdle();
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    if (glowColor) {
      this.root.style.filter = `drop-shadow(0 0 8px ${glowColor})`;
    }

    const dur = moveSpec.charge === 'solar_absorb' ? 360 : 210;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const liftY = bt === 'floating' || bt === 'winged' ? -8 : 0;

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'translate(0, 0) scaleY(1) scaleX(1)' },
          { transform: `translate(${-8 * dir}px, ${liftY}px) scaleY(0.92) scaleX(1.06)` },
        ],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.torsoEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-11 * dir * lean}deg)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.headEl.animate(
        [{ transform: 'translateX(0px)' }, { transform: `translateX(${-3 * dir}px)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
    ]);
  }

  async playBeamPose(dir, duration = 720) {
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const baseKick = bt === 'artillery' ? -11 * dir : 9 * dir;
    const torsoTilt = bt === 'artillery' ? -7 * dir * lean : 12 * dir * lean;

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translateX(${-8 * dir}px) scaleY(0.92)` },
          { transform: `translateX(${baseKick}px) scaleY(1.03)`, offset: 0.25 },
          { transform: `translateX(${baseKick * 0.5}px) scaleY(1)`, offset: 0.8 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-11 * dir * lean}deg)` },
          { transform: `rotate(${torsoTilt}deg)`, offset: 0.25 },
          { transform: `rotate(${torsoTilt * 0.7}deg)`, offset: 0.8 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `translateX(${-3 * dir}px) scaleX(1)` },
          { transform: `translateX(${5 * dir}px) scaleX(1.05)`, offset: 0.22 },
          { transform: `translateX(${2 * dir}px) scaleX(1.02)`, offset: 0.38 },
          { transform: `translateX(${5 * dir}px) scaleX(1.04)`, offset: 0.55 },
          { transform: 'translateX(0px) scaleX(1)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playDashStrike(dir, distancePx, duration = 620, glowColor = '') {
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    const easing = 'cubic-bezier(0.2, 0.9, 0.25, 1)';
    const arcY = bt === 'winged' || bt === 'floating' ? -14 : -4;

    this._spawnDashGhosts(dir, distancePx, duration, glowColor);

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translate(${-8 * dir}px, 0px) scaleY(0.92)` },
          { transform: `translate(${distancePx * 0.5 * dir}px, ${arcY}px) scaleY(1.04) scaleX(1.06)`, offset: 0.2 },
          { transform: `translate(${distancePx * dir}px, 0px) scaleY(1.02)`, offset: 0.42 },
          { transform: `translate(${(distancePx - 14) * dir}px, 0px) scaleY(0.95)`, offset: 0.6 },
          { transform: 'translate(0px, 0px) scaleY(1) scaleX(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-11 * dir * lean}deg)` },
          { transform: `rotate(${15 * dir * lean}deg)`, offset: 0.42 },
          { transform: `rotate(${-6 * dir * lean}deg)`, offset: 0.68 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `translateX(${-3 * dir}px)` },
          { transform: `translateX(${4 * dir}px)`, offset: 0.42 },
          { transform: 'translateX(0px)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playBuffPose(duration = 760) {
    const easing = 'ease-in-out';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'scaleY(1) translateY(0px)' },
          { transform: 'scaleY(0.93) translateY(0px)', offset: 0.25 },
          { transform: 'scaleY(1.05) translateY(-7px)', offset: 0.6 },
          { transform: 'scaleY(1) translateY(0px)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-6deg)', offset: 0.4 },
          { transform: 'rotate(5deg)', offset: 0.7 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(-3px)', offset: 0.5 },
          { transform: 'translateY(0px)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playHit(dir) {
    this.stopIdle();
    const dur = 410;
    await Promise.all([
      this.root.animate(
        [
          { filter: 'brightness(5) contrast(2)' },
          { filter: 'brightness(1)', offset: 0.3 },
          { filter: 'brightness(3.5)', offset: 0.6 },
          { filter: 'brightness(1)' },
        ],
        { duration: dur, easing: 'steps(2, end)' }
      ).finished,
      this.baseEl.animate(
        [
          { transform: 'translateX(0) scaleY(1)' },
          { transform: `translateX(${14 * dir}px) scaleY(0.94)`, offset: 0.25 },
          { transform: `translateX(${-5 * dir}px) scaleY(1.02)`, offset: 0.55 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${13 * dir}deg)`, offset: 0.25 },
          { transform: `rotate(${-4 * dir}deg)`, offset: 0.6 },
          { transform: 'rotate(0deg)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
    ]);
    this.startIdle();
  }

  async playKO(dir = 1) {
    this.stopIdle();
    const dur = 680;
    const generation = ++this.koGeneration;
    this.koAnims = [
      this.torsoEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-18 * dir}deg)` }],
        { duration: 300, easing: 'ease-in' }
      ),
      this.root.animate(
        [
          { transform: 'translateY(0px)', opacity: 1, filter: 'brightness(2)' },
          { transform: 'translateY(12px)', opacity: 0.8, offset: 0.35 },
          { transform: 'translateY(65px)', opacity: 0 },
        ],
        { duration: dur, easing: 'ease-in' }
      ),
    ];

    try {
      await Promise.all(this.koAnims.map((animation) => animation.finished));
    } catch (error) {
      if (generation !== this.koGeneration) return;
      throw error;
    } finally {
      if (generation === this.koGeneration) {
        this.koAnims = [];
        this.torsoEl.style.transform = `rotate(${-18 * dir}deg)`;
        this.root.style.transform = 'translateY(65px)';
        this.root.style.opacity = '0';
        this.root.style.filter = '';
      }
    }
  }
}

class BattleAnimator {
  constructor(arenaEl, options = {}) {
    if (!arenaEl) throw new Error('BattleAnimator: arenaEl é obrigatório.');
    this.arenaEl = arenaEl;
    this.pixelScale = options.pixelScale || 4;
    this.rigs = new WeakMap();
    injectRigStyles();
    this._setupCanvas();
  }

  _setupCanvas() {
    if (window.getComputedStyle(this.arenaEl).position === 'static') {
      this.arenaEl.style.position = 'relative';
    }
    let canvas = this.arenaEl.querySelector('canvas.pbfx-overlay-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'pbfx-overlay-canvas';
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '50',
        imageRendering: 'pixelated',
      });
      this.arenaEl.appendChild(canvas);
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  resize() {
    const w = Math.max(64, Math.floor(this.arenaEl.clientWidth / this.pixelScale));
    const h = Math.max(32, Math.floor(this.arenaEl.clientHeight / this.pixelScale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ctx.imageSmoothingEnabled = false;
  }

  getMoveAnimationSignature(moveInfo = {}) {
    const move = resolveCanonicalMove({
      moveName: moveInfo.name || moveInfo.moveName || '',
      moveType: moveInfo.type || moveInfo.moveType || 'NORMAL',
      damageClass: moveInfo.damageClass || moveInfo.damage_class?.name || '',
      power: moveInfo.power || 0,
      priority: moveInfo.priority || 0,
      drain: moveInfo.drain || moveInfo.meta?.drain || 0,
      target: moveInfo.target?.name || moveInfo.target || '',
      meta: moveInfo.meta || null,
    });
    return [move.engine, move.style || '', move.shape || '', move.charge || ''].join(':');
  }

  attachRig(spriteEl, speciesInfo = {}) {
    if (!spriteEl) return null;
    if (spriteEl._pbfxRig) {
      if (speciesInfo && (typeof speciesInfo === 'string' || speciesInfo.name || speciesInfo.shape)) {
        spriteEl._pbfxRig.setSpecies(speciesInfo);
      }
      return spriteEl._pbfxRig;
    }
    if (this.rigs.has(spriteEl)) return this.rigs.get(spriteEl);
    const rig = new ArticulatedRig(spriteEl, speciesInfo);
    this.rigs.set(spriteEl, rig);
    return rig;
  }

  _getAnchorPoints(attackerRoot, targetRoot, speciesProfile) {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const attRect = attackerRoot.getBoundingClientRect();
    const tgtRect = targetRoot.getBoundingClientRect();

    const isLeftToRight = attRect.left < tgtRect.left;
    const dir = isLeftToRight ? 1 : -1;

    const mx = speciesProfile?.muzzleX ?? 0.66;
    const my = speciesProfile?.muzzleY ?? 0.42;
    const relX = isLeftToRight ? mx : (1 - mx);

    const startX = attRect.left + attRect.width * relX - arenaRect.left;
    const startY = attRect.top + attRect.height * my - arenaRect.top;
    const endX = tgtRect.left + tgtRect.width * 0.5 - arenaRect.left;
    const endY = tgtRect.top + tgtRect.height * 0.52 - arenaRect.top;
    const floorY = Math.max(attRect.bottom, tgtRect.bottom) - arenaRect.top - 4;
    const attCenterX = (attRect.left + attRect.width * 0.5) - arenaRect.left;

    return { startX, startY, endX, endY, floorY, attCenterX, dir };
  }

  _shakeArena() {
    this.arenaEl.classList.remove('pbfx-arena-shake');
    void this.arenaEl.offsetWidth;
    this.arenaEl.classList.add('pbfx-arena-shake');
  }

  /**
   * Executa a coreografia fiel do golpe com os dados oficiais do Pokémon e do ataque.
   */
  async playAttack({
    attackerEl,
    targetEl,
    attackerName = '',
    attackerShape = '',
    attackerTypes = [],
    targetName = '',
    targetShape = '',
    targetTypes = [],
    moveName = '',
    moveType = 'NORMAL',
    damageClass = '',
    power = 0,
    priority = 0,
    drain = 0,
    target = '',
    meta = null,
    onImpact,
  }) {
    if (!attackerEl || !targetEl) return;
    this.resize();

    const attRig = this.attachRig(attackerEl, { name: attackerName, shape: attackerShape, types: attackerTypes });
    const tgtRig = this.attachRig(targetEl, { name: targetName, shape: targetShape, types: targetTypes });
    const species = attRig.speciesProfile;

    const move = resolveCanonicalMove({
      moveName,
      moveType,
      damageClass,
      power,
      priority,
      drain,
      target,
      meta,
    });

    const palette = TYPE_PALETTES[move.type] || TYPE_PALETTES[normalizeType(moveType)] || TYPE_PALETTES.NORMAL;
    const { startX, startY, endX, endY, floorY, attCenterX, dir } = this._getAnchorPoints(attRig.root, tgtRig.root, species);

    const triggerHit = () => {
      this._shakeArena();
      tgtRig.playHit(dir);
      if (typeof onImpact === 'function') onImpact();
      if (move.recoil) {
        setTimeout(() => attRig.playHit(-dir), 180);
      }
    };

    // 1. Golpes de Status, Buff, Cura, Escudo e Debuff
    if (move.engine === 'status_and_support') {
      attRig.playBuffPose(move.duration);
      const fxX = move.targetSelf === false ? endX : attCenterX;
      await this._renderStatusAndSupport(fxX, floorY, palette, move);
      if (move.targetSelf === false && move.style !== 'stat_drop_target') {
        tgtRig.playHit(dir);
      }
      if (typeof onImpact === 'function') onImpact();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // 2. Preparação / Carga Canônica (quando o golpe possui carga nos jogos)
    if (!move.fast && move.charge && move.charge !== 'none') {
      await Promise.all([
        attRig.playWindup(dir, palette.mid, move),
        this._renderCanonicalCharge(startX, startY, attCenterX, floorY, palette, move, species),
      ]);
    } else if (!move.fast) {
      await attRig.playWindup(dir, palette.mid, move);
    }

    // 3. Execução Canônica do Golpe
    const totalDistPx = Math.abs(endX - startX);
    const dashDist = Math.max(42, totalDistPx - 44);

    switch (move.engine) {
      case 'straight_laser':
        attRig.playBeamPose(dir, move.duration);
        await this._renderStraightLaser(startX, startY, endX, endY, palette, triggerHit, move, species);
        break;

      case 'fluid_stream':
        attRig.playBeamPose(dir, move.duration);
        await this._renderFluidStream(startX, startY, endX, endY, palette, triggerHit, move, species);
        break;

      case 'fire_blast_star':
        attRig.playBeamPose(dir, move.duration);
        await this._renderFireBlastStar(startX, startY, endX, endY, palette, triggerHit, move);
        break;

      case 'energy_sphere':
        attRig.playBeamPose(dir, move.duration);
        await this._renderEnergySphere(startX, startY, endX, endY, palette, triggerHit, move, species);
        break;

      case 'multi_projectile':
        attRig.playBeamPose(dir, move.duration);
        await this._renderMultiProjectile(startX, startY, endX, endY, palette, triggerHit, move, species);
        break;

      case 'lightning_bolt':
        attRig.playBeamPose(dir, move.duration);
        await this._renderLightningBolt(startX, startY, endX, endY, palette, triggerHit, move, species);
        break;

      case 'slash_or_claw':
        attRig.playDashStrike(dir, dashDist, move.duration, palette.mid);
        await this._renderSlashOrClaw(endX, endY, dir, palette, triggerHit, move);
        break;

      case 'fang_bite':
        attRig.playDashStrike(dir, dashDist, move.duration, palette.mid);
        await this._renderFangBite(endX, endY, palette, triggerHit, move);
        break;

      case 'punch_or_kick':
        attRig.playDashStrike(dir, dashDist, move.duration, palette.mid);
        await this._renderPunchOrKick(endX, endY, palette, triggerHit, move);
        break;

      case 'physical_rush':
        attRig.playDashStrike(dir, dashDist, move.duration, palette.mid);
        await this._renderPhysicalRush(startX, startY, endX, endY, dir, palette, triggerHit, move);
        break;

      case 'ground_seismic':
        attRig.playDashStrike(dir, 24, move.duration * 0.75, palette.mid);
        await this._renderGroundSeismic(startX, endX, endY, floorY, palette, triggerHit, move);
        break;

      case 'meteor_shower':
        attRig.playBeamPose(dir, move.duration);
        await this._renderMeteorShower(endX, endY, palette, triggerHit, move);
        break;

      case 'tidal_wave':
        attRig.playBeamPose(dir, move.duration);
        await this._renderTidalWave(startX, endX, floorY, dir, palette, triggerHit, move);
        break;

      case 'cyclone_vortex':
        attRig.playBeamPose(dir, move.duration);
        await this._renderCycloneVortex(endX, floorY, palette, triggerHit, move);
        break;

      case 'expanding_rings':
        attRig.playBeamPose(dir, move.duration);
        await this._renderExpandingRings(startX, startY, endX, endY, palette, triggerHit, move);
        break;

      case 'drain_life':
        attRig.playBeamPose(dir, move.duration);
        await this._renderDrainLife(startX, startY, endX, endY, palette, triggerHit, move);
        break;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  async playKO(targetEl) {
    if (!targetEl) return;
    const rig = this.attachRig(targetEl);
    const isLeft = rig.root.getBoundingClientRect().left < this.arenaEl.getBoundingClientRect().left + this.arenaEl.clientWidth / 2;
    await rig.playKO(isLeft ? 1 : -1);
  }

  // ==================== FASE DE CARGA CANÔNICA ====================
  _renderCanonicalCharge(startX, startY, attCenterX, floorY, palette, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = Math.round(startX / s), sy = Math.round(startY / s);
      const cx = Math.round(attCenterX / s), fy = Math.round(floorY / s);
      const dur = move.charge === 'solar_absorb' ? 350 : 200;
      const t0 = performance.now();

      const frame = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (move.charge === 'solar_absorb') {
          // Orbes de luz solar descendo do céu para o Pokémon (Solar Beam / Solar Blade)
          for (let i = 0; i < 8; i++) {
            const ox = cx + (i - 3.5) * 6;
            const oy = Math.round((fy - 44) * (1 - p) + (sy) * p);
            ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#84cc16';
            ctx.fillRect(Math.round(ox), oy, 2, 2);
          }
          ctx.fillStyle = '#fef9c3';
          ctx.beginPath(); ctx.arc(sx, sy, Math.round(2 + p * 4), 0, Math.PI * 2); ctx.fill();
        } else if (species.dualEmitter) {
          // Energia concentrando nos 2 canhões (Blastoise / Magmortar)
          [-4, 4].forEach((oy) => {
            const r = Math.max(1, Math.round((1 - p) * 8 + 2));
            ctx.strokeStyle = palette.core;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(sx, sy + oy, r, 0, Math.PI * 2); ctx.stroke();
          });
        } else {
          // Esfera de energia concentrando no ponto de disparo
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8 + p * 5;
            const d = (1 - p) * 16;
            ctx.fillStyle = i % 2 === 0 ? palette.mid : palette.core;
            ctx.fillRect(Math.round(sx + Math.cos(a) * d), Math.round(sy + Math.sin(a) * d), 2, 2);
          }
          ctx.fillStyle = palette.core;
          ctx.beginPath(); ctx.arc(sx, sy, Math.round(1 + p * 3), 0, Math.PI * 2); ctx.fill();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 1. STRAIGHT LASER (Hyper Beam, Solar Beam, Ice Beam, Flash Cannon) ====================
  _renderStraightLaser(startX, startY, endX, endY, palette, onHit, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const emitters = species.dualEmitter ? [-4, 4] : [0];
      const baseW = Math.max(3, Math.round(5 * (move.width || 1) * (species.dualEmitter ? 0.65 : 1)));
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const reach = Math.min(p / 0.25, 1);
        const fade = p > 0.72 ? Math.max(0, (1 - p) / 0.28) : 1;
        const pulse = Math.sin(p * Math.PI * 10) * 0.8;
        const w = Math.max(1, (baseW + pulse) * fade);

        if (reach >= 0.95 && !hit) { hit = true; onHit(); }

        for (const oy of emitters) {
          const curX = sx + (ex - sx) * reach;
          const curY = (sy + oy) + ((ey + oy * 0.5) - (sy + oy)) * reach;

          [
            [w + 3, palette.outline],
            [w + 1, palette.outer],
            [Math.max(1, w * 0.65), palette.mid],
            [Math.max(1, w * 0.3), palette.core],
          ].forEach(([lw, color]) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.beginPath();
            ctx.moveTo(Math.round(sx), Math.round(sy + oy));
            ctx.lineTo(Math.round(curX), Math.round(curY));
            ctx.stroke();
          });

          // Anéis concêntricos ao longo do feixe (clássico Hyper Beam / Psybeam)
          if (reach > 0.5) {
            for (let rIdx = 1; rIdx <= 3; rIdx++) {
              const tRing = ((p * 2.5 + rIdx * 0.33) % 1);
              const rx = Math.round(sx + (ex - sx) * tRing);
              const ry = Math.round((sy + oy) + ((ey + oy * 0.5) - (sy + oy)) * tRing);
              ctx.strokeStyle = palette.core;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(rx, ry, Math.max(2, Math.round(w * 0.9)), 0, Math.PI * 2); ctx.stroke();
            }
          }
        }

        if (reach >= 0.95) {
          ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), Math.round((w + 4) * fade), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;  ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), Math.max(1, Math.round(w * 0.8 * fade)), 0, Math.PI * 2); ctx.fill();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 2. FLUID STREAM (Flamethrower, Hydro Pump, Dragon Breath, Scald) ====================
  _renderFluidStream(startX, startY, endX, endY, palette, onHit, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const angle = Math.atan2(ey - sy, ex - sx);
      const dist = Math.hypot(ex - sx, ey - sy);
      const emitters = species.dualEmitter ? [-4.5, 4.5] : [0];
      const thick = (move.width || 1) * (species.dualEmitter ? 0.72 : 1.0);
      const blobs = [], sparks = [];
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false, emittedCount = 0;

      const layers = [
        { color: palette.outline, scale: 1.38, minLife: 0.05 },
        { color: palette.outer,   scale: 1.12, minLife: 0.15 },
        { color: palette.mid,     scale: 0.84, minLife: 0.30 },
        { color: palette.core,    scale: 0.46, minLife: 0.50 },
      ];

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.64) {
          for (const oy of emitters) {
            for (let i = 0; i < 3; i++) {
              const sample = emittedCount++ + i * 5 + (oy > 0 ? 2 : 0);
              const speed = Math.max(2.7, dist / 18) * (0.92 + (sample % 5) * 0.04);
              const spread = ((sample % 7) - 3) * 0.012;
              blobs.push({
                x: sx, y: sy + oy,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                r: (2.6 + (sample % 4) * 0.3) * thick,
                grow: 0.3 * thick,
                life: 1,
                decay: 0.036,
              });
            }
          }
        }

        for (let i = blobs.length - 1; i >= 0; i--) {
          const b = blobs[i];
          b.x += b.vx; b.y += b.vy; b.r += b.grow; b.life -= b.decay;
          if (!hit && Math.hypot(b.x - sx, b.y - sy) >= dist * 0.84) {
            hit = true;
            onHit();
            for (let k = 0; k < 18; k++) {
              const a = (Math.PI * 2 * k) / 18, sp = 1.1 + (k % 3) * 0.6;
              blobs.push({ x: ex, y: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4.5 * thick, grow: 0.1, life: 1, decay: 0.045 });
              sparks.push({ x: ex, y: ey, vx: Math.cos(a) * sp * 2.2, vy: Math.sin(a) * sp * 2.2, life: 1 });
            }
          }
          if (b.life <= 0) blobs.splice(i, 1);
        }

        for (const l of layers) {
          ctx.fillStyle = l.color;
          for (const b of blobs) {
            if (b.life < l.minLife) continue;
            ctx.beginPath();
            ctx.arc(Math.round(b.x), Math.round(b.y), Math.max(1, Math.round(b.r * l.scale)), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.045;
          ctx.fillStyle = palette.mid;
          ctx.fillRect(Math.round(sp.x), Math.round(sp.y), 1, 1);
          if (sp.life <= 0) sparks.splice(i, 1);
        }

        if (p < 1 || blobs.length > 0) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 3. FIRE BLAST STAR (Estrela 大 oficial) ====================
  _renderFireBlastStar(startX, startY, endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;
      const starAngles = [-Math.PI / 2, -Math.PI / 2 + 0.72, -Math.PI / 2 - 0.72, Math.PI / 2 + 0.52, Math.PI / 2 - 0.52];

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.34) {
          const t = p / 0.34;
          const cx = Math.round(sx + (ex - sx) * t), cy = Math.round(sy + (ey - sy) * t);
          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
        } else {
          if (!hit) { hit = true; onHit(); }
          const bt = (p - 0.34) / 0.66;
          const fade = bt > 0.7 ? (1 - bt) / 0.3 : 1;
          const armLen = Math.min(26, bt * 46);
          for (const a of starAngles) {
            for (let step = 0; step <= armLen; step += 4) {
              const bx = Math.round(ex + Math.cos(a) * step), by = Math.round(ey + Math.sin(a) * step);
              const r = Math.max(1, Math.round((6 - step * 0.1) * fade));
              ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(bx, by, r + 2, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(bx, by, Math.max(1, Math.round(r * 0.45)), 0, Math.PI * 2); ctx.fill();
            }
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 4. ENERGY SPHERE (Shadow Ball, Aura Sphere, Focus Blast, Sludge Bomb) ====================
  _renderEnergySphere(startX, startY, endX, endY, palette, onHit, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const r = move.radius || 8.5;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.65) {
          const t = p / 0.65;
          const ease = t * t;
          const x = Math.round(sx + (ex - sx) * ease);
          const y = Math.round(sy + (ey - sy) * ease - Math.sin(t * Math.PI) * 5);

          // Aura pulsante da esfera
          const pulse = Math.sin(p * Math.PI * 12) * 1.2;
          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(x, y, Math.round((r + 2) + pulse), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(x, y, Math.round(r + pulse), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(x, y, Math.round(r * 0.68), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(x, y, Math.round(r * 0.36), 0, Math.PI * 2); ctx.fill();
        } else {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.65) / 0.35;
          const expR = Math.round(r + imp * 18);
          ctx.strokeStyle = palette.outline; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), expR, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = palette.mid;     ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), Math.round(expR * 0.72), 0, Math.PI * 2); ctx.stroke();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 5. MULTI PROJECTILE (Razor Leaf, Water Shuriken, Swift, Bullet Seed, Rock Blast) ====================
  _renderMultiProjectile(startX, startY, endX, endY, palette, onHit, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const count = move.count || 4;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const items = Array.from({ length: count }, (_, idx) => ({
        delay: count === 1 ? 0 : (idx / count) * 0.42,
        arcY: count === 1 ? -4 : (idx - (count - 1) / 2) * 5,
        emitterShift: species.dualEmitter ? (idx % 2 === 0 ? -4 : 4) : 0,
        hitDone: false,
      }));

      const drawProjectile = (x, y, rot) => {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(rot);

        if (move.shape === 'leaf' || move.shape === 'petal') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-5, -2, 10, 4);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-4, -1, 8, 2);
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 3, 1);
        } else if (move.shape === 'shuriken') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-5, -1, 10, 2); ctx.fillRect(-1, -5, 2, 10);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-4, -1, 8, 2);  ctx.fillRect(-1, -4, 2, 8);
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 2, 2);
        } else if (move.shape === 'star') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-4, -1, 8, 2); ctx.fillRect(-1, -4, 2, 8);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-3, -1, 6, 2); ctx.fillRect(-1, -3, 2, 6);
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 2, 2);
        } else if (move.shape === 'icicle' || move.shape === 'needle' || move.shape === 'crystal') {
          ctx.fillStyle = palette.outline;
          ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(0, -3); ctx.lineTo(6, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
          ctx.fillStyle = palette.core; ctx.fillRect(-2, -1, 4, 2);
        } else if (move.shape === 'bone') {
          ctx.fillStyle = '#fef9c3'; ctx.fillRect(-5, -1, 10, 2); ctx.fillRect(-6, -2, 2, 4); ctx.fillRect(4, -2, 2, 4);
        } else if (move.shape === 'rock') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-4, -4, 8, 8);
          ctx.fillStyle = palette.outer;   ctx.fillRect(-3, -3, 6, 6);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-2, -2, 3, 3);
        } else if (move.shape === 'bubble') {
          ctx.strokeStyle = palette.outer; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = palette.core; ctx.fillRect(-1, -1, 2, 2);
        } else {
          // Seed / Flame orb
          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 2, 2);
        }
        ctx.restore();
      };

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const it of items) {
          const span = count === 1 ? 0.68 : 0.54;
          const local = (p - it.delay) / span;
          if (local < 0 || local > 1.28) continue;
          const t = Math.min(local, 1);
          const x = sx + (ex - sx) * t;
          const y = sy + it.emitterShift + (ey - sy) * t + Math.sin(t * Math.PI) * it.arcY;

          if (t >= 0.92 && !it.hitDone) {
            it.hitDone = true;
            if (!hit) { hit = true; onHit(); }
          }

          if (local <= 1) {
            const rot = (move.shape === 'icicle' || move.shape === 'needle')
              ? Math.atan2(ey - sy, ex - sx)
              : t * 14;
            drawProjectile(x, y, rot);
          } else {
            const exp = (local - 1) / 0.28;
            ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), Math.round(4 + exp * 10), 0, Math.PI * 2); ctx.stroke();
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 6. LIGHTNING BOLT (Thunder vs Thunderbolt) ====================
  _renderLightningBolt(startX, startY, endX, endY, palette, onHit, move, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = Math.round(startX / s), sy = Math.round(startY / s);
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const isSky = move.style === 'sky_strike';
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false, fc = 0, pathVersion = 0;

      const buildPath = () => {
        const version = pathVersion++;
        const x0 = isSky ? ex : sx;
        const y0 = isSky ? 0 : sy;
        const pts = [{ x: x0, y: y0 }];
        const segs = 9;
        for (let i = 1; i < segs; i++) {
          const t = i / segs;
          pts.push({
            x: Math.round(x0 + (ex - x0) * t + (isSky ? Math.sin(version * 1.7 + i * 2.3) * 8 : 0)),
            y: Math.round(y0 + (ey - y0) * t + (!isSky ? Math.cos(version * 1.4 + i * 1.9) * 7 : 0)),
          });
        }
        pts.push({ x: ex, y: ey });
        return pts;
      };
      let pts = buildPath();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!hit && p >= 0.18) { hit = true; onHit(); }

        if (p < 0.82) {
          if (fc++ % 2 === 0) pts = buildPath();
          [
            [5, palette.outline],
            [3, palette.outer],
            [1, palette.core],
          ].forEach(([w, c]) => {
            ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            pts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
            ctx.stroke();
          });
          ctx.fillStyle = palette.mid;  ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
        }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 7. SLASH OR CLAW (Dragon Claw, X-Scissor, Air Slash, Leaf Blade) ====================
  _renderSlashOrClaw(endX, endY, dir, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const getLines = () => {
        if (move.style === 'x_cross') {
          return [
            { x1: ex - 16, y1: ey - 16, x2: ex + 16, y2: ey + 16 },
            { x1: ex + 16, y1: ey - 16, x2: ex - 16, y2: ey + 16 },
          ];
        }
        if (move.style === 'single_blade') {
          return [
            { x1: ex - 18 * dir, y1: ey - 16, x2: ex + 18 * dir, y2: ey + 16 },
          ];
        }
        // triple_claw / fury_swipes
        return [-7, 0, 7].map((shift) => ({
          x1: ex - 14 * dir + shift,
          y1: ey - 14,
          x2: ex + 14 * dir + shift,
          y2: ey + 14,
        }));
      };
      const lines = getLines();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p >= 0.38) {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.38) / 0.62;
          const cut = Math.min(imp / 0.42, 1);
          ctx.globalAlpha = imp > 0.7 ? Math.max(0, (1 - imp) / 0.3) : 1;

          for (const l of lines) {
            const cx = Math.round(l.x1 + (l.x2 - l.x1) * cut);
            const cy = Math.round(l.y1 + (l.y2 - l.y1) * cut);
            ctx.strokeStyle = palette.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
            ctx.strokeStyle = palette.outer;   ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
            ctx.strokeStyle = palette.core;    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 8. FANG BITE (Crunch, Bite, Fire/Ice/Thunder Fang) ====================
  _renderFangBite(endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p >= 0.36) {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.36) / 0.64;
          const clamp = Math.sin(Math.min(imp * 1.4, 1) * Math.PI);
          const gap = Math.round((1 - clamp) * 14);
          ctx.globalAlpha = imp > 0.75 ? Math.max(0, (1 - imp) / 0.25) : 1;

          ctx.fillStyle = palette.outline;
          for (let t = -2; t <= 2; t++) {
            ctx.fillRect(ex + t * 5 - 1, ey - gap - 6, 3, 7);
            ctx.fillRect(ex + t * 5 - 1, ey + gap, 3, 7);
          }
          ctx.fillStyle = palette.core;
          for (let t = -2; t <= 2; t++) {
            ctx.fillRect(ex + t * 5, ey - gap - 5, 1, 5);
            ctx.fillRect(ex + t * 5, ey + gap + 1, 1, 5);
          }
          ctx.globalAlpha = 1;
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 9. PUNCH OR KICK (Fire Punch, Close Combat, Double Kick) ====================
  _renderPunchOrKick(endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const strikes = move.style === 'multi_strike_combo' ? (move.strikes || 4) : 1;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;
      const offsets = [
        { x: 0, y: 0 }, { x: -9, y: -7 }, { x: 9, y: 6 }, { x: -7, y: 8 }, { x: 8, y: -8 },
      ];

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p >= 0.38) {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.38) / 0.62;

          if (move.style === 'axe_kick') {
            const sweep = Math.sin(Math.min(imp, 1) * Math.PI);
            ctx.globalAlpha = Math.max(0, 1 - imp * 0.7);
            ctx.strokeStyle = palette.outline; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(ex - 15, ey - 12); ctx.lineTo(ex + 9, ey + 2); ctx.lineTo(ex - 4, ey + 14); ctx.stroke();
            ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ex - 12, ey - 12 - sweep * 5); ctx.lineTo(ex + 7, ey + 2); ctx.lineTo(ex - 3, ey + 12); ctx.stroke();
            ctx.globalAlpha = 1;
          } else {
            for (let k = 0; k < strikes; k++) {
              const kp = (imp * strikes) - k;
              if (kp < 0 || kp > 1.2) continue;
              const off = offsets[k % offsets.length];
              const r = Math.round(5 + Math.sin(Math.min(kp, 1) * Math.PI) * 8);
              ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(ex + off.x, ey + off.y, r + 2, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(ex + off.x, ey + off.y, r, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(ex + off.x, ey + off.y, Math.max(1, Math.round(r * 0.45)), 0, Math.PI * 2); ctx.fill();
            }
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 10. PHYSICAL RUSH (Flare Blitz, Brave Bird, Quick Attack, Tackle) ====================
  _renderPhysicalRush(startX, startY, endX, endY, dir, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = Math.round(endX / s), ey = Math.round(endY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.42) {
          const t = p / 0.42;
          const cx = sx + (ex - sx) * t;
          const jump = move.style === 'body_slam' ? Math.sin(t * Math.PI) * 12 : 0;
          const cy = sy + (ey - sy) * t - jump;
          if (move.style === 'heavy_tackle') {
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = i % 2 === 0 ? palette.outer : palette.mid;
              ctx.beginPath(); ctx.arc(Math.round(cx - i * 4 * dir), Math.round(cy), Math.max(2, 8 - i), 0, Math.PI * 2); ctx.fill();
            }
          } else if (move.style === 'recoil_ram') {
            for (let i = 0; i < 5; i++) {
              const trail = i * 5;
              ctx.strokeStyle = i % 2 === 0 ? palette.outer : palette.core;
              ctx.lineWidth = Math.max(1, 4 - i);
              ctx.beginPath(); ctx.moveTo(Math.round(cx - dir * (trail + 3)), Math.round(cy - 7 + i * 3)); ctx.lineTo(Math.round(cx - dir * (trail + 11)), Math.round(cy - 7 + i * 3)); ctx.stroke();
            }
          } else if (move.style === 'body_slam') {
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(Math.round(cx), Math.round(ey + 11), Math.max(3, Math.round(15 * (1 - t * 0.6))), 3, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
          }
        } else {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.42) / 0.58;
          const r = Math.round(6 + imp * 20 * (move.powerScale || 1));
          ctx.globalAlpha = imp > 0.7 ? Math.max(0, (1 - imp) / 0.3) : 1;
          if (move.style === 'body_slam') {
            ctx.strokeStyle = palette.outer; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.ellipse(ex, ey + 8, Math.max(3, r), Math.max(2, Math.round(r * 0.28)), 0, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(ex, ey + 8, Math.max(2, Math.round(r * 0.62)), Math.max(1, Math.round(r * 0.18)), 0, 0, Math.PI * 2); ctx.stroke();
          } else if (move.style === 'recoil_ram') {
            ctx.strokeStyle = palette.outer; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(ex - 12, ey - 10); ctx.lineTo(ex + 12, ey + 10); ctx.moveTo(ex + 12, ey - 10); ctx.lineTo(ex - 12, ey + 10); ctx.stroke();
            ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(ex, ey, r * 0.6, 0, Math.PI * 2); ctx.stroke();
          } else {
            ctx.strokeStyle = palette.outer; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = palette.core;  ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ex, ey, Math.round(r * 0.6), 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 11. GROUND SEISMIC (Earthquake, Stone Edge, Frenzy Plant) ====================
  _renderGroundSeismic(startX, endX, endY, floorY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, ex = endX / s, ey = endY / s, fy = Math.round(floorY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (move.style === 'stone_edge_ring') {
          if (!hit && p >= 0.25) { hit = true; onHit(); }
          const rise = Math.sin(Math.min(p / 0.85, 1) * Math.PI);
          [-14, -7, 0, 7, 14].forEach((ox, i) => {
            const px = Math.round(ex + ox);
            const h = Math.max(2, Math.round((20 + (2 - Math.abs(i - 2)) * 5) * rise));
            ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.moveTo(px - 3, fy); ctx.lineTo(px, fy - h - 2); ctx.lineTo(px + 3, fy); ctx.fill();
            ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.moveTo(px - 2, fy); ctx.lineTo(px, fy - h);     ctx.lineTo(px + 2, fy); ctx.fill();
          });
        } else {
          // Earthquake / Earth Power / Frenzy Plant
          const waveX = sx + (ex - sx) * Math.min(p / 0.4, 1);
          ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(Math.round(sx), fy); ctx.lineTo(Math.round(waveX), fy); ctx.stroke();

          if (p >= 0.35) {
            if (!hit) { hit = true; onHit(); }
            const rise = Math.sin(Math.min(((p - 0.35) / 0.65) * 1.2, 1) * Math.PI);
            [-14, -7, 0, 7, 14].forEach((ox, i) => {
              const px = Math.round(ex + ox);
              const h = Math.max(2, Math.round((18 + (2 - Math.abs(i - 2)) * 6) * rise));
              ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.moveTo(px - 4, fy); ctx.lineTo(px, fy - h - 2); ctx.lineTo(px + 4, fy); ctx.fill();
              ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.moveTo(px - 2, fy); ctx.lineTo(px, fy - h);     ctx.lineTo(px + 2, fy); ctx.fill();
            });
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 12. METEOR SHOWER (Draco Meteor, Rock Slide, Icicle Crash) ====================
  _renderMeteorShower(endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = endX / s, ey = endY / s;
      const count = move.count || 5;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let i = 0; i < count; i++) {
          const ox = (i - (count - 1) / 2) * 7;
          const lp = Math.max(0, Math.min((p - i * 0.08) / 0.55, 1));
          if (lp <= 0) continue;
          const rx = Math.round(ex + ox - (1 - lp) * 10);
          const ry = Math.round((ey - 36) + 38 * (lp * lp));
          if (lp >= 0.9 && !hit) { hit = true; onHit(); }

          if (move.shape === 'meteor') {
            ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.arc(rx, ry, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;  ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI * 2); ctx.fill();
          } else if (move.shape === 'icicle') {
            ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.moveTo(rx - 3, ry - 6); ctx.lineTo(rx + 3, ry - 6); ctx.lineTo(rx, ry + 5); ctx.fill();
            ctx.fillStyle = palette.core;  ctx.fillRect(rx - 1, ry - 4, 2, 5);
          } else {
            ctx.fillStyle = palette.outline; ctx.fillRect(rx - 4, ry - 4, 8, 8);
            ctx.fillStyle = palette.outer;   ctx.fillRect(rx - 3, ry - 3, 6, 6);
            ctx.fillStyle = palette.core;    ctx.fillRect(rx - 2, ry - 2, 2, 2);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 13. TIDAL WAVE (Surf, Muddy Water, Heat Wave, Sludge Wave) ====================
  _renderTidalWave(startX, endX, floorY, dir, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, ex = endX / s, fy = Math.round(floorY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const wx = sx + (ex - sx) * Math.min(p / 0.72, 1.15);
        const crestH = Math.sin(Math.min(p / 0.85, 1) * Math.PI) * 34;
        if (!hit && Math.abs(wx - ex) < 12) { hit = true; onHit(); }

        if (crestH > 1) {
          for (let i = -3; i <= 3; i++) {
            const bx = Math.round(wx - i * 5 * dir);
            const by = Math.round(fy - crestH * (1 - Math.abs(i) * 0.16));
            const r = Math.max(3, 8 - Math.abs(i));
            ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(bx, by, r + 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.outer;   ctx.fillRect(bx - r, by, r * 2, Math.max(2, fy - by));
            ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;    ctx.fillRect(bx - 2, by - r, 4, 2);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 14. CYCLONE VORTEX (Hurricane, Blizzard, Leaf Storm, Fire Spin) ====================
  _renderCycloneVortex(endX, floorY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = endX / s, fy = Math.round(floorY / s);
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!hit && p >= 0.28) { hit = true; onHit(); }

        for (let i = 0; i < 20; i++) {
          const hNorm = i / 20;
          const y = Math.round(fy - hNorm * 38);
          const radius = 5 + hNorm * 16;
          const x = Math.round(ex + Math.cos(p * 18 + i * 0.8) * radius);
          ctx.fillStyle = i % 2 === 0 ? palette.mid : palette.core;
          ctx.fillRect(x - 1, y - 1, 3, 2);
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 15. EXPANDING RINGS (Psychic, Dragon Pulse, Hyper Voice, Dark Pulse) ====================
  _renderExpandingRings(startX, startY, endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const rings = move.rings || 4;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let i = 0; i < rings; i++) {
          const lp = Math.max(0, Math.min((p - i * 0.11) / 0.65, 1));
          if (lp <= 0) continue;
          const cx = Math.round(sx + (ex - sx) * lp);
          const cy = Math.round(sy + (ey - sy) * lp);
          const r = Math.round(4 + lp * 13);
          if (lp >= 0.92 && !hit) { hit = true; onHit(); }
          ctx.strokeStyle = palette.outline; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = i % 2 === 0 ? palette.mid : palette.core; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 16. DRAIN LIFE (Giga Drain, Leech Life, Drain Punch, Oblivion Wing) ====================
  _renderDrainLife(startX, startY, endX, endY, palette, onHit, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const duration = move.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.42) {
          const t = p / 0.42;
          const cx = Math.round(sx + (ex - sx) * t), cy = Math.round(sy + (ey - sy) * t);
          ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
        } else {
          if (!hit) { hit = true; onHit(); }
          const rt = (p - 0.42) / 0.58;
          for (let i = 0; i < 7; i++) {
            const lt = Math.max(0, Math.min((rt - i * 0.08) / 0.65, 1));
            if (lt <= 0 || lt >= 1) continue;
            const ox = Math.round(ex + (sx - ex) * lt);
            const oy = Math.round(ey + (sy - ey) * lt + Math.sin(lt * Math.PI * 2 + i) * 7);
            ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dcfce7'; ctx.fillRect(ox - 1, oy - 1, 2, 2);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 17. STATUS & SUPPORT (Swords Dance, Protect, Recover, Toxic, Will-O-Wisp, Thunder Wave) ====================
  _renderStatusAndSupport(targetX, floorY, palette, move) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const cx = Math.round(targetX / s), fy = Math.round(floorY / s);
      const duration = move.duration;
      const t0 = performance.now();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (move.style === 'orbiting_swords') {
          for (let i = 0; i < 4; i++) {
            const a = (Math.PI * 2 * i) / 4 + p * 8;
            const sx = Math.round(cx + Math.cos(a) * 16);
            const sy = Math.round((fy - 18) + Math.sin(a) * 5);
            ctx.fillStyle = '#e2e8f0'; ctx.fillRect(sx - 1, sy - 5, 2, 8);
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(sx - 2, sy + 2, 4, 2);
          }
        } else if (move.style === 'shield_barrier') {
          ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, fy - 16, Math.round(15 + Math.sin(p * Math.PI) * 3), 0, Math.PI * 2); ctx.stroke();
        } else if (move.style === 'will_o_wisp') {
          for (let i = 0; i < 4; i++) {
            const a = (Math.PI * 2 * i) / 4 + p * 7;
            const wx = Math.round(cx + Math.cos(a) * (16 - p * 10));
            const wy = Math.round((fy - 16) + Math.sin(a) * 10);
            ctx.fillStyle = '#6366f1'; ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e0e7ff'; ctx.fillRect(wx - 1, wy - 1, 2, 2);
          }
        } else if (move.style === 'thunder_cage') {
          ctx.strokeStyle = '#facc15'; ctx.lineWidth = 1;
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(cx + i * 5, fy - 32); ctx.lineTo(cx + i * 5, fy - 2); ctx.stroke();
          }
        } else if (move.style === 'poison_bubbles') {
          for (let i = 0; i < 6; i++) {
            const bx = cx + (i - 2.5) * 5;
            const by = Math.round(fy - 8 - ((p * 24 + i * 4) % 24));
            ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(Math.round(bx), by, 3, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          const isDrop = move.style === 'stat_drop_target';
          const color = move.style === 'heal_sparkles' ? '#4ade80' : (isDrop ? '#60a5fa' : palette.mid);
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8 + p * 7;
            const x = Math.round(cx + Math.cos(a) * 14);
            const offset = (p * 28 + i * 4) % 26;
            const y = Math.round(isDrop ? (fy - 32 + offset) : (fy - 6 - offset));
            ctx.fillStyle = color;
            ctx.fillRect(x - 1, y - 2, 2, 5);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }
}

if (typeof window !== 'undefined') {
  window.ArticulatedRig = ArticulatedRig;
  window.BattleAnimator = BattleAnimator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ArticulatedRig, BattleAnimator };
}
