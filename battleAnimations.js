/**
 * BattleAnimator & ArticulatedRig v3.0 — Motor Procedural de Animações Únicas por Golpe e por Pokémon
 *
 * Diferenciais v3.0:
 * 1. DNA Individual por Golpe (900+ golpes): combina metadados da PokeAPI (name, type, damageClass,
 *    power, priority, drain, meta) com hash determinístico paramétrico (trajetória, frequência de onda,
 *    geometria de projétil, formação, contagem, rotação, rastro e detonação). Nenhum golpe é igual ao outro.
 * 2. DNA Anatômico por Pokémon: identifica automaticamente a espécie (via `attackerName`, `alt`, ou ID na URL
 *    do sprite da PokeAPI) para adaptar postura articulada (bípede/dragão, quadrúpede, voador/alado,
 *    serpentino/flutuante, artilharia/canhões duplos como Blastoise), pontos de disparo e paleta secundária.
 * 3. Drenagem & Status Reais: golpes como Giga Drain / Drain Punch enviam orbes de energia do alvo de volta
 *    ao atacante; golpes de recuo (Flare Blitz / Brave Bird) aplicam contra-golpe visual.
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
 * Perfis anatômicos notáveis por ID da Pokédex ou nome (fallback procedural cobre todos os outros 1000+ Pokémon)
 */
const SPECIES_ANATOMY_OVERRIDES = {
  // Artilharia / Canhões Duplos (dispara 2 feixes paralelos dos ombros!)
  '9':   { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.48, muzzleY: 0.28, accent: '#e0f2fe', rigLean: 0.75 }, // Blastoise
  'blastoise': { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.48, muzzleY: 0.28, accent: '#e0f2fe', rigLean: 0.75 },
  '467': { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.55, muzzleY: 0.45, accent: '#fef08a', rigLean: 0.9 }, // Magmortar
  'magmortar': { bodyType: 'artillery', dualEmitter: true, muzzleX: 0.55, muzzleY: 0.45, accent: '#fef08a', rigLean: 0.9 },
  '693': { bodyType: 'artillery', dualEmitter: false, muzzleX: 0.65, muzzleY: 0.45, accent: '#38bdf8', rigLean: 0.85 }, // Clawitzer
  'clawitzer': { bodyType: 'artillery', dualEmitter: false, muzzleX: 0.65, muzzleY: 0.45, accent: '#38bdf8', rigLean: 0.85 },

  // Dragões / Alados (inclinação ampla de pescoço, abertura de asas e mergulho aéreo)
  '6':   { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.74, muzzleY: 0.34, accent: '#2dd4bf', rigLean: 1.25 }, // Charizard
  'charizard': { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.74, muzzleY: 0.34, accent: '#2dd4bf', rigLean: 1.25 },
  '149': { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.70, muzzleY: 0.32, accent: '#fde047', rigLean: 1.15 }, // Dragonite
  'dragonite': { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.70, muzzleY: 0.32, accent: '#fde047', rigLean: 1.15 },
  '373': { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.38, accent: '#f43f5e', rigLean: 1.3 }, // Salamence
  'salamence': { bodyType: 'avian_dragon', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.38, accent: '#f43f5e', rigLean: 1.3 },
  '384': { bodyType: 'serpentine', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.30, accent: '#34d399', rigLean: 1.35 }, // Rayquaza
  'rayquaza': { bodyType: 'serpentine', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.30, accent: '#34d399', rigLean: 1.35 },

  // Quadrúpedes / Pesados (agachamento baixo, disparo dorsal/frontal)
  '3':   { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.55, muzzleY: 0.30, accent: '#f472b6', rigLean: 0.85 }, // Venusaur
  'venusaur': { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.55, muzzleY: 0.30, accent: '#f472b6', rigLean: 0.85 },
  '59':  { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.36, accent: '#fde047', rigLean: 1.2 }, // Arcanine
  'arcanine': { bodyType: 'quadruped', dualEmitter: false, muzzleX: 0.72, muzzleY: 0.36, accent: '#fde047', rigLean: 1.2 },

  // Flutuantes / Psíquicos / Fantasmas (levitação durante carga, telecinese sem recuo físico pesado)
  '94':  { bodyType: 'floating', dualEmitter: false, muzzleX: 0.62, muzzleY: 0.45, accent: '#e879f9', rigLean: 1.1 }, // Gengar
  'gengar': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.62, muzzleY: 0.45, accent: '#e879f9', rigLean: 1.1 },
  '65':  { bodyType: 'floating', dualEmitter: true, muzzleX: 0.62, muzzleY: 0.40, accent: '#fef08a', rigLean: 0.9 }, // Alakazam
  'alakazam': { bodyType: 'floating', dualEmitter: true, muzzleX: 0.62, muzzleY: 0.40, accent: '#fef08a', rigLean: 0.9 },
  '150': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.64, muzzleY: 0.38, accent: '#c084fc', rigLean: 1.0 }, // Mewtwo
  'mewtwo': { bodyType: 'floating', dualEmitter: false, muzzleX: 0.64, muzzleY: 0.38, accent: '#c084fc', rigLean: 1.0 },
  '448': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.44, accent: '#38bdf8', rigLean: 1.15 }, // Lucario
  'lucario': { bodyType: 'biped', dualEmitter: false, muzzleX: 0.66, muzzleY: 0.44, accent: '#38bdf8', rigLean: 1.15 },
  '25':  { bodyType: 'biped', dualEmitter: true, muzzleX: 0.60, muzzleY: 0.44, accent: '#ef4444', rigLean: 1.2 }, // Pikachu
  'pikachu': { bodyType: 'biped', dualEmitter: true, muzzleX: 0.60, muzzleY: 0.44, accent: '#ef4444', rigLean: 1.2 },
};

// Hash determinístico FNV-1a de 32 bits para gerar parâmetros únicos e reproduzíveis por golpe/espécie
function hashString(str) {
  let h = 0x811c9dc5;
  const s = String(str || 'default');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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
 * Extrai identidade e anatomia do Pokémon a partir do nome ou do elemento HTML/IMG.
 */
function resolveSpeciesProfile(explicitName, spriteEl) {
  let identifier = normalizeKey(explicitName);
  let dexId = '';

  if (spriteEl) {
    const img = spriteEl.tagName === 'IMG' ? spriteEl : spriteEl.querySelector('img');
    const src = img?.src || '';
    const alt = normalizeKey(img?.alt || spriteEl.dataset?.pokemon || spriteEl.dataset?.species || '');
    const idMatch = src.match(/\/(\d+)\.(?:gif|png|webp|svg)/i);
    if (idMatch) dexId = idMatch[1];
    if (!identifier) identifier = alt || dexId;
  }

  if (dexId && SPECIES_ANATOMY_OVERRIDES[dexId]) {
    return { id: dexId, ...SPECIES_ANATOMY_OVERRIDES[dexId] };
  }
  if (identifier && SPECIES_ANATOMY_OVERRIDES[identifier]) {
    return { id: identifier, ...SPECIES_ANATOMY_OVERRIDES[identifier] };
  }

  // Perfil anatômico procedural único para qualquer outro Pokémon da Pokédex
  const rng = seededRandom(hashString(identifier || dexId || 'pokemon'));
  const bodyTypes = ['biped', 'quadruped', 'avian_dragon', 'floating', 'serpentine'];
  const bodyType = bodyTypes[Math.floor(rng() * bodyTypes.length)];
  const hue = Math.floor(rng() * 360);

  return {
    id: identifier || dexId || 'generic',
    bodyType,
    dualEmitter: rng() > 0.78, // ~22% dos Pokémon disparam em ponto duplo (mãos/ombros/olhos)
    muzzleX: 0.56 + rng() * 0.18,
    muzzleY: 0.30 + rng() * 0.22,
    accent: `hsl(${hue}, 90%, 68%)`,
    rigLean: 0.85 + rng() * 0.45,
  };
}

/**
 * Sintetizador Procedural de Golpes:
 * Transforma qualquer ataque (PokeAPI move object ou nome/tipo/classe/poder) em um DNA único de:
 * - chargeStyle  (8 tipos de preparação corporal/elemental)
 * - engine       (stream | barrage | melee_rush | bolt | field_area | drain_tether | status_aura)
 * - geometry     (forma, contagem, frequência de onda, espessura, arco, velocidade, rastro)
 * - impactStyle  (explosão estrela, anéis de choque, estilhaços, cratera, esporos, orbes de dreno)
 */
function synthesizeMoveDNA({ moveName, moveType, damageClass, power, priority, drain, meta }, speciesProfile) {
  const key = normalizeKey(moveName);
  const typeUpper = normalizeType(moveType);
  const dmgClass = normalizeKey(damageClass); // 'physical' | 'special' | 'status'
  const pwr = Math.max(0, Number(power) || 0);
  const prio = Number(priority) || 0;
  const drainVal = Number(drain) || Number(meta?.drain) || 0;

  // Seed única combinando o nome exato do ataque + espécie do Pokémon
  const moveSeed = hashString(key || `${typeUpper}_${dmgClass}_${pwr}`);
  const comboSeed = hashString(`${key}::${speciesProfile.id}`);
  const rng = seededRandom(moveSeed);
  const comboRng = seededRandom(comboSeed);

  // 1. Determina o motor base pela semântica do nome + classe de dano da PokeAPI
  let engine = 'stream';
  let subMode = 'standard';

  if (dmgClass === 'status' || (pwr === 0 && !/seismic|night shade|dragon rage|sonic boom|super fang|endeavor|fissure|sheer cold|horn drill|guillotine/.test(key))) {
    engine = 'status_aura';
    if (/heal|recover|roost|synthesis|rest|wish|milk|soft|moonlight|morning|shore|cura|descanso/.test(key)) subMode = 'heal';
    else if (/protect|detect|guard|barrier|screen|veil|shield|substitute|iron defense|amnesia|escudo|prote/.test(key)) subMode = 'shield';
    else if (/toxic|spore|powder|wave|glare|hypnosis|sing|will o wisp|leech seed|confuse|screech|growl|leer|tail whip/.test(key)) subMode = 'debuff_target';
    else subMode = 'buff_self';
  } else if (drainVal > 0 || /drain|leech|absorb|giga drain|mega drain|oblivion wing|parabolic/.test(key)) {
    engine = 'drain_tether';
  } else if (/thunder|bolt|volt|spark|discharge|zap|electro|shock|trovao|choque/.test(key) && dmgClass !== 'physical') {
    engine = 'bolt';
    subMode = /thunder$|sky|strike|storm|trovao$/.test(key) ? 'sky_strike' : 'arc_chain';
  } else if (/quake|earth|fissure|magnitude|bulldoze|stomping|frenzy plant|stone edge|rock slide|meteor|draco|blizzard|hurricane|surf|muddy|wave|psychic|psyshock|pulse|hyper voice|boomburst|uproar|scald|lava|eruption|sandstorm|hail|petal|leaf storm|overheat|fire blast/.test(key)) {
    engine = 'field_area';
    if (/fire blast|overheat|blast burn|sacred fire|blue flare/.test(key)) subMode = 'star_nova';
    else if (/surf|muddy|wave|tide|flood|lava|heat wave|eruption/.test(key)) subMode = 'tsunami_wave';
    else if (/quake|earth|fissure|magnitude|bulldoze|frenzy/.test(key)) subMode = 'seismic_pillars';
    else if (/rock|stone|meteor|draco|icicle|avalanche/.test(key)) subMode = 'sky_barrage';
    else if (/blizzard|hurricane|tornado|twister|whirlpool|fire spin|sand tomb|petal|leaf storm/.test(key)) subMode = 'vortex_cyclone';
    else subMode = 'harmonic_rings';
  } else if (/leaf|seed|bullet|swift|star|shuriken|ember|bubble|pin|needle|spike|icicle|rock blast|bonemerang|shadow sneak|water pulse|aura sphere|shadow ball|energy ball|sludge bomb|electro ball|focus blast|gyro ball|weather ball|zap cannon|octazooka|mud bomb|seed bomb|magnet bomb|egg bomb/.test(key)) {
    engine = 'barrage';
    subMode = /ball|sphere|bomb|cannon|orb|octazooka|bola|esfera|bomba/.test(key) ? 'heavy_orb' : 'multi_volley';
  } else if (dmgClass === 'physical' || /claw|slash|cut|blade|scissor|punch|kick|slam|smash|impact|tackle|blitz|rush|charge|jet|quick|bite|crunch|fang|tail|wing|aerial|dive|horn|drill|iron head|zen headbutt|waterfall|aqua tail|flare blitz|brave bird|volt tackle|close combat|outrage|giga impact|extreme speed/.test(key)) {
    engine = 'melee_rush';
    if (/claw|slash|cut|blade|scissor|garra|corte|lamina|night slash|air slash|leaf blade|x scissor|psycho cut/.test(key)) subMode = 'slash_marks';
    else if (/bite|crunch|fang|jaw|mordida|presa/.test(key)) subMode = 'fang_clamp';
    else if (/punch|kick|combat|outrage|thrash|fury|double slap|bullet punch|mach punch|soco|chute/.test(key)) subMode = 'combo_strikes';
    else subMode = 'aura_blitz';
  } else {
    // Special beams & rays (Flamethrower, Hydro Pump, Solar Beam, Ice Beam, Hyper Beam, Flash Cannon, Signal Beam, etc.)
    engine = 'stream';
    subMode = (pwr >= 110 || /solar|hyper|eternabeam|roar of time|prismatic|steel beam/.test(key)) ? 'mega_cannon' : 'elemental_stream';
  }

  // 2. Parâmetros únicos derivados do nome do golpe + espécie do Pokémon
  const powerScale = pwr > 0 ? Math.min(1.65, Math.max(0.65, pwr / 85)) : 1.0;
  const isFast = prio > 0 || /quick|mach|aqua jet|bullet|ice shard|shadow sneak|vacuum|extreme|feint/.test(key);
  const isHeavy = pwr >= 100 || subMode === 'mega_cannon' || subMode === 'star_nova';

  // Estilo de carga único por golpe
  const chargeStyles = ['spiral_gather', 'ground_crack', 'wing_gust_rings', 'static_arcs', 'aura_flare', 'cannon_prime'];
  const chargeStyle = speciesProfile.dualEmitter && (engine === 'stream' || engine === 'barrage')
    ? 'cannon_prime'
    : chargeStyles[moveSeed % chargeStyles.length];

  // Forma individual de projétil para barrages
  const shapePoolByType = {
    FIRE: ['flame_tongue', 'orb', 'star'],
    FOGO: ['flame_tongue', 'orb', 'star'],
    WATER: ['bubble_ring', 'water_drop', 'star'],
    AGUA: ['bubble_ring', 'water_drop', 'star'],
    GRASS: ['razor_leaf', 'seed_orb', 'petal'],
    PLANTA: ['razor_leaf', 'seed_orb', 'petal'],
    ICE: ['crystal_shard', 'snowflake', 'orb'],
    GELO: ['crystal_shard', 'snowflake', 'orb'],
    ELECTRIC: ['spark_bolt', 'orb', 'star'],
    ELETRICO: ['spark_bolt', 'orb', 'star'],
    ROCK: ['boulder', 'crystal_shard', 'orb'],
    PEDRA: ['boulder', 'crystal_shard', 'orb'],
    BUG: ['needle_dart', 'orb', 'crescent'],
    INSETO: ['needle_dart', 'orb', 'crescent'],
    FAIRY: ['star', 'heart_orb', 'petal'],
    FADA: ['star', 'heart_orb', 'petal'],
  };
  const shapes = shapePoolByType[typeUpper] || ['orb', 'star', 'crystal_shard', 'crescent'];
  const projShape = shapes[moveSeed % shapes.length];

  // Contagem, onda e ângulos únicos para cada ataque
  const projCount = subMode === 'heavy_orb'
    ? 1
    : 3 + (moveSeed % 7); // 3 a 9 projéteis distintos por golpe

  const waveFreq = 4 + (moveSeed % 12);         // Frequência da ondulação do feixe
  const waveAmp = (moveSeed % 5) * 0.9;         // Amplitude da ondulação (0 = laser reto, 3.6 = feixe sinuoso)
  const slashCount = /x scissor|cross/.test(key) ? 2 : (1 + (moveSeed % 4)); // 1 a 4 cortes
  const slashAngleOffset = ((moveSeed % 60) - 30) * (Math.PI / 180);
  const strikeCount = subMode === 'combo_strikes' ? (2 + (moveSeed % 4)) : 1;
  const duration = isFast
    ? 520 + (moveSeed % 120)
    : isHeavy
      ? 1020 + (moveSeed % 220)
      : 720 + (moveSeed % 220);

  return {
    key,
    type: typeUpper,
    dmgClass,
    power: pwr,
    powerScale,
    isFast,
    isHeavy,
    hasRecoil: /flare blitz|brave bird|volt tackle|double edge|take down|wild charge|wood hammer|head smash|submission/.test(key),
    engine,
    subMode,
    chargeStyle,
    projShape,
    projCount,
    waveFreq,
    waveAmp,
    slashCount,
    slashAngleOffset,
    isCrossSlash: /x scissor|cross/.test(key),
    strikeCount,
    duration,
    speciesAccentMix: 0.25 + comboRng() * 0.35,
  };
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
    .pbfx-rig-joint img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: pixelated;
      pointer-events: none;
    }
    .pbfx-rig-base {
      transform-origin: 50% 100%;
      z-index: 1;
    }
    .pbfx-rig-base > img {
      clip-path: inset(64% -25% 0% -25%);
    }
    .pbfx-rig-torso {
      transform-origin: 50% 68%;
      z-index: 2;
    }
    .pbfx-rig-torso > img {
      clip-path: inset(32% -25% 30% -25%);
    }
    .pbfx-rig-head {
      transform-origin: 50% 38%;
      z-index: 3;
    }
    .pbfx-rig-head > img {
      clip-path: inset(-15% -25% 62% -25%);
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
 * Esqueleto Articulado Hierárquico de 3 Juntas (Base -> Tronco -> Cabeça/Asas)
 * Adapta a postura e o balanço conforme a anatomia de cada espécie de Pokémon.
 */
class ArticulatedRig {
  constructor(spriteEl, speciesName = '') {
    if (!spriteEl) throw new Error('ArticulatedRig: spriteEl é obrigatório.');
    injectRigStyles();

    if (spriteEl._pbfxRig) {
      if (speciesName) spriteEl._pbfxRig.setSpecies(speciesName);
      return spriteEl._pbfxRig;
    }

    this.originalEl = spriteEl;
    this.idleAnims = [];
    this.speciesProfile = resolveSpeciesProfile(speciesName, spriteEl);

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
    placeholder.alt = spriteEl.alt || speciesName || '';
    if (initialSrc) placeholder.src = initialSrc;

    this.baseEl = document.createElement('div');
    this.baseEl.className = 'pbfx-rig-joint pbfx-rig-base';
    this.baseImg = document.createElement('img');

    this.torsoEl = document.createElement('div');
    this.torsoEl.className = 'pbfx-rig-joint pbfx-rig-torso';
    this.torsoImg = document.createElement('img');

    this.headEl = document.createElement('div');
    this.headEl.className = 'pbfx-rig-joint pbfx-rig-head';
    this.headImg = document.createElement('img');

    this.baseEl.appendChild(this.baseImg);
    this.torsoEl.appendChild(this.torsoImg);
    this.headEl.appendChild(this.headImg);

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
    if (initialSrc) this.setSprite(initialSrc, speciesName);
    this.startIdle();
  }

  setSpecies(speciesName) {
    this.speciesProfile = resolveSpeciesProfile(speciesName, this.root);
    this.startIdle();
  }

  setSprite(src, speciesName = '') {
    if (src) {
      this.placeholder.src = src;
      this.baseImg.src = src;
      this.torsoImg.src = src;
      this.headImg.src = src;
    }
    if (speciesName) {
      this.placeholder.alt = speciesName;
    }
    this.speciesProfile = resolveSpeciesProfile(speciesName, this.root);
    this.root.style.opacity = '1';
    this.baseEl.style.transform = '';
    this.torsoEl.style.transform = '';
    this.headEl.style.transform = '';
    this.startIdle();
  }

  startIdle() {
    this.stopIdle();
    const bt = this.speciesProfile?.bodyType || 'biped';

    if (bt === 'floating' || bt === 'avian_dragon') {
      // Flutuação / batida de asas no ar
      const opts = { duration: 1350, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'translateY(0px) scaleY(1)' }, { transform: 'translateY(-4px) scaleY(0.98)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2.5deg)' }],
          { ...opts, duration: 1350 }
        ),
        this.headEl.animate(
          [{ transform: 'rotate(2.5deg) scaleX(1)' }, { transform: 'rotate(-3.5deg) scaleX(1.04)' }],
          { ...opts, duration: 1350, delay: 120 }
        ),
      ];
    } else if (bt === 'artillery' || bt === 'quadruped') {
      // Base pesada e firme no solo
      const opts = { duration: 1700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'scaleY(1) scaleX(1)' }, { transform: 'scaleY(0.96) scaleX(1.03)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'translateY(0px) rotate(-1deg)' }, { transform: 'translateY(2px) rotate(1.2deg)' }],
          opts
        ),
        this.headEl.animate(
          [{ transform: 'rotate(1deg)' }, { transform: 'rotate(-2deg)' }],
          { ...opts, delay: 160 }
        ),
      ];
    } else {
      // Bípede / Serpentino padrão
      const opts = { duration: 1450, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
      this.idleAnims = [
        this.baseEl.animate(
          [{ transform: 'scaleY(1) scaleX(1)' }, { transform: 'scaleY(0.97) scaleX(1.02)' }],
          opts
        ),
        this.torsoEl.animate(
          [{ transform: 'rotate(-1.8deg) translateY(0px)' }, { transform: 'rotate(2.2deg) translateY(1px)' }],
          opts
        ),
        this.headEl.animate(
          [{ transform: 'rotate(2deg) scaleX(1)' }, { transform: 'rotate(-3deg) scaleX(1.03)' }],
          { ...opts, delay: 140 }
        ),
      ];
    }
  }

  stopIdle() {
    this.idleAnims.forEach((a) => a.cancel());
    this.idleAnims = [];
  }

  async playWindup(dir, glowColor, dna) {
    this.stopIdle();
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    if (glowColor) {
      this.root.style.filter = `drop-shadow(0 0 9px ${glowColor})`;
    }

    const dur = dna.isHeavy ? 320 : 210;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const liftY = bt === 'floating' || bt === 'avian_dragon' ? -10 : 0;

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'translate(0, 0) scaleY(1) scaleX(1)' },
          { transform: `translate(${-9 * dir}px, ${liftY}px) scaleY(0.89) scaleX(1.07)` },
        ],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.torsoEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-16 * dir * lean}deg)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.headEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-13 * dir * lean}deg)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
    ]);
  }

  async playBeamPose(dir, duration = 680, dna = {}) {
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

    // Artilharia (como Blastoise) absorve recuo para trás ao disparar; Dragões/Bípedes projetam pescoço para frente
    const baseKick = bt === 'artillery' ? -12 * dir : 10 * dir;
    const torsoTilt = bt === 'artillery' ? -10 * dir * lean : 18 * dir * lean;

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translateX(${-9 * dir}px) scaleY(0.89)` },
          { transform: `translateX(${baseKick}px) scaleY(1.03)`, offset: 0.25 },
          { transform: `translateX(${baseKick * 0.5}px) scaleY(1)`, offset: 0.8 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-16 * dir * lean}deg)` },
          { transform: `rotate(${torsoTilt}deg)`, offset: 0.25 },
          { transform: `rotate(${torsoTilt * 0.7}deg)`, offset: 0.8 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `rotate(${-13 * dir * lean}deg) translateX(0px)` },
          { transform: `rotate(${11 * dir * lean}deg) translateX(${8 * dir}px) scaleX(1.08)`, offset: 0.25 },
          { transform: `rotate(${8 * dir * lean}deg) translateX(${4 * dir}px)`, offset: 0.8 },
          { transform: 'rotate(0deg) translateX(0px) scaleX(1)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playDashStrike(dir, distancePx, duration = 580, dna = {}) {
    const lean = this.speciesProfile?.rigLean || 1.0;
    const bt = this.speciesProfile?.bodyType || 'biped';
    const easing = 'cubic-bezier(0.2, 0.9, 0.25, 1)';
    const arcY = bt === 'avian_dragon' || bt === 'floating' ? -16 : -4;

    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translate(${-9 * dir}px, 0px) scaleY(0.89)` },
          { transform: `translate(${distancePx * 0.5 * dir}px, ${arcY}px) scaleY(1.05)`, offset: 0.2 },
          { transform: `translate(${distancePx * dir}px, 0px) scaleY(1.04)`, offset: 0.42 },
          { transform: `translate(${(distancePx - 14) * dir}px, 0px) scaleY(0.95)`, offset: 0.6 },
          { transform: 'translate(0px, 0px) scaleY(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-16 * dir * lean}deg)` },
          { transform: `rotate(${26 * dir * lean}deg)`, offset: 0.42 },
          { transform: `rotate(${-9 * dir * lean}deg)`, offset: 0.68 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `rotate(${-13 * dir * lean}deg)` },
          { transform: `rotate(${20 * dir * lean}deg) translateX(${6 * dir}px)`, offset: 0.42 },
          { transform: `rotate(${-6 * dir * lean}deg)`, offset: 0.68 },
          { transform: 'rotate(0deg) translateX(0px)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playBuffPose(duration = 680) {
    const easing = 'ease-in-out';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: 'scaleY(0.91)', offset: 0.25 },
          { transform: 'scaleY(1.07) translateY(-7px)', offset: 0.6 },
          { transform: 'scaleY(1) translateY(0px)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-9deg)', offset: 0.4 },
          { transform: 'rotate(7deg)', offset: 0.7 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-15deg)', offset: 0.5 },
          { transform: 'rotate(0deg)' },
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
          { transform: 'translateX(0)' },
          { transform: `translateX(${15 * dir}px) scaleY(0.92)`, offset: 0.25 },
          { transform: `translateX(${-6 * dir}px)`, offset: 0.55 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${21 * dir}deg)`, offset: 0.25 },
          { transform: `rotate(${-6 * dir}deg)`, offset: 0.6 },
          { transform: 'rotate(0deg)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
      this.headEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${25 * dir}deg)`, offset: 0.25 },
          { transform: `rotate(${-8 * dir}deg)`, offset: 0.65 },
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
    await Promise.all([
      this.torsoEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-24 * dir}deg)` }],
        { duration: 300, fill: 'forwards', easing: 'ease-in' }
      ).finished,
      this.headEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-30 * dir}deg)` }],
        { duration: 300, fill: 'forwards', easing: 'ease-in' }
      ).finished,
      this.root.animate(
        [
          { transform: 'translateY(0px)', opacity: 1, filter: 'brightness(2)' },
          { transform: 'translateY(12px)', opacity: 0.8, offset: 0.35 },
          { transform: 'translateY(65px)', opacity: 0 },
        ],
        { duration: dur, fill: 'forwards', easing: 'ease-in' }
      ).finished,
    ]);
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

  attachRig(spriteEl, speciesName = '') {
    if (!spriteEl) return null;
    if (spriteEl._pbfxRig) {
      if (speciesName) spriteEl._pbfxRig.setSpecies(speciesName);
      return spriteEl._pbfxRig;
    }
    if (this.rigs.has(spriteEl)) return this.rigs.get(spriteEl);
    const rig = new ArticulatedRig(spriteEl, speciesName);
    this.rigs.set(spriteEl, rig);
    return rig;
  }

  _getAnchorPoints(attackerRoot, targetRoot, speciesProfile) {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const attRect = attackerRoot.getBoundingClientRect();
    const tgtRect = targetRoot.getBoundingClientRect();

    const isLeftToRight = attRect.left < tgtRect.left;
    const dir = isLeftToRight ? 1 : -1;

    const mx = speciesProfile?.muzzleX ?? 0.65;
    const my = speciesProfile?.muzzleY ?? 0.40;
    const relX = isLeftToRight ? mx : (1 - mx);

    const startX = attRect.left + attRect.width * relX - arenaRect.left;
    const startY = attRect.top + attRect.height * my - arenaRect.top;
    const endX = tgtRect.left + tgtRect.width * 0.5 - arenaRect.left;
    const endY = tgtRect.top + tgtRect.height * 0.52 - arenaRect.top;
    const floorY = Math.max(attRect.bottom, tgtRect.bottom) - arenaRect.top - 4;

    return { startX, startY, endX, endY, floorY, dir };
  }

  _shakeArena() {
    this.arenaEl.classList.remove('pbfx-arena-shake');
    void this.arenaEl.offsetWidth;
    this.arenaEl.classList.add('pbfx-arena-shake');
  }

  /**
   * Executa a animação única do ataque combinando o DNA do Golpe + Anatomia do Pokémon.
   *
   * @param {Object} params
   * @param {HTMLElement} params.attackerEl Sprite ou Rig do atacante
   * @param {HTMLElement} params.targetEl Sprite ou Rig do defensor
   * @param {string} [params.attackerName] Nome ou ID da espécie atacante (opcional; detecta automaticamente se omitido)
   * @param {string} [params.targetName] Nome ou ID da espécie defensora
   * @param {string} [params.moveName] Slug ou nome do golpe (ex: 'flamethrower', 'fire-blast', 'surf', 'dragon-claw')
   * @param {string} [params.moveType='NORMAL'] Tipo do ataque ('FIRE', 'FOGO', 'WATER', 'AGUA', etc.)
   * @param {string} [params.damageClass] 'physical' | 'special' | 'status'
   * @param {number} [params.power] Poder base do golpe
   * @param {number} [params.priority] Prioridade do golpe
   * @param {number} [params.drain] Porcentagem de dreno/recuo
   * @param {Object} [params.meta] Objeto `meta` completo da PokeAPI (opcional)
   * @param {Function} [params.onImpact] Callback sincronizado para reduzir barra de HP no impacto
   */
  async playAttack({
    attackerEl,
    targetEl,
    attackerName = '',
    targetName = '',
    moveName = '',
    moveType = 'NORMAL',
    damageClass = '',
    power = 0,
    priority = 0,
    drain = 0,
    meta = null,
    onImpact,
  }) {
    if (!attackerEl || !targetEl) return;
    this.resize();

    const attRig = this.attachRig(attackerEl, attackerName);
    const tgtRig = this.attachRig(targetEl, targetName);
    const species = attRig.speciesProfile;

    const dna = synthesizeMoveDNA(
      { moveName, moveType, damageClass, power, priority, drain, meta },
      species
    );

    const basePalette = TYPE_PALETTES[dna.type] || TYPE_PALETTES[normalizeType(moveType)] || TYPE_PALETTES.NORMAL;
    // Mistura sutil da cor assinatura da espécie do Pokémon na paleta
    const palette = {
      ...basePalette,
      speciesAccent: species.accent || basePalette.mid,
    };

    const anchors = this._getAnchorPoints(attRig.root, tgtRig.root, species);
    const { startX, startY, endX, endY, floorY, dir } = anchors;

    const triggerHit = () => {
      this._shakeArena();
      tgtRig.playHit(dir);
      if (typeof onImpact === 'function') onImpact();
      if (dna.hasRecoil) {
        setTimeout(() => attRig.playHit(-dir), 180);
      }
    };

    // 1. Golpes de Status / Buff / Cura / Debuff
    if (dna.engine === 'status_aura') {
      attRig.playBuffPose(dna.duration);
      const attCenter = (attRig.root.getBoundingClientRect().left + attRig.root.getBoundingClientRect().width / 2) - this.arenaEl.getBoundingClientRect().left;
      const targetX = dna.subMode === 'debuff_target' ? endX : attCenter;
      await this._renderStatusAura(targetX, floorY, palette, dna);
      if (dna.subMode === 'debuff_target') tgtRig.playHit(dir);
      if (typeof onImpact === 'function') onImpact();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // 2. Fase de Carga Única (Articulada + Partículas de Carga)
    if (!dna.isFast) {
      await Promise.all([
        attRig.playWindup(dir, palette.mid, dna),
        this._renderChargeFX(startX, startY, floorY, palette, dna, species),
      ]);
    }

    // 3. Fase de Execução Única por Golpe + Espécie
    const totalDistPx = Math.abs(endX - startX);
    const dashDist = Math.max(42, totalDistPx - 44);

    switch (dna.engine) {
      case 'drain_tether':
        attRig.playBeamPose(dir, dna.duration, dna);
        await this._renderDrainTether(startX, startY, endX, endY, palette, triggerHit, dna);
        break;

      case 'bolt':
        attRig.playBeamPose(dir, dna.duration * 0.85, dna);
        await this._renderBolt(startX, startY, endX, endY, palette, triggerHit, dna, species);
        break;

      case 'field_area':
        if (dna.subMode === 'seismic_pillars') {
          attRig.playDashStrike(dir, 26, dna.duration * 0.75, dna);
        } else {
          attRig.playBeamPose(dir, dna.duration * 0.85, dna);
        }
        await this._renderFieldArea(startX, startY, endX, endY, floorY, dir, palette, triggerHit, dna);
        break;

      case 'barrage':
        attRig.playBeamPose(dir, dna.duration * 0.85, dna);
        await this._renderBarrage(startX, startY, endX, endY, palette, triggerHit, dna, species);
        break;

      case 'melee_rush':
        attRig.playDashStrike(dir, dashDist, dna.duration, dna);
        await this._renderMeleeRush(startX, startY, endX, endY, dir, palette, triggerHit, dna);
        break;

      case 'stream':
      default:
        attRig.playBeamPose(dir, dna.duration * 0.9, dna);
        await this._renderParametricStream(startX, startY, endX, endY, palette, triggerHit, dna, species);
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

  // ==================== MOTOR DE CARGA ÚNICA ====================
  _renderChargeFX(startX, startY, floorY, palette, dna, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = Math.round(startX / s), sy = Math.round(startY / s), fy = Math.round(floorY / s);
      const dur = dna.isHeavy ? 300 : 190;
      const t0 = performance.now();

      const frame = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (dna.chargeStyle === 'cannon_prime' || species.dualEmitter) {
          // Anéis de energia nos dois canhões/ombros
          [-4, 4].forEach((oy) => {
            const r = Math.max(1, Math.round((1 - p) * 9 + 2));
            ctx.strokeStyle = palette.speciesAccent;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(sx, sy + oy, r, 0, Math.PI * 2);
            ctx.stroke();
          });
        } else if (dna.chargeStyle === 'ground_crack') {
          ctx.strokeStyle = palette.mid;
          ctx.lineWidth = 1;
          const spread = Math.round(p * 16);
          ctx.beginPath();
          ctx.moveTo(sx - spread, fy);
          ctx.lineTo(sx + spread, fy);
          ctx.stroke();
        } else if (dna.chargeStyle === 'wing_gust_rings') {
          const r = Math.round(4 + p * 14);
          ctx.strokeStyle = palette.core;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Espiral de partículas convergindo com a cor da espécie + tipo
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8 + p * 6;
            const d = (1 - p) * 18;
            ctx.fillStyle = i % 2 === 0 ? palette.mid : palette.speciesAccent;
            ctx.fillRect(Math.round(sx + Math.cos(a) * d), Math.round(sy + Math.sin(a) * d), 2, 2);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 1. PARAMETRIC STREAM (Jatos & Mega Canhões Únicos) ====================
  _renderParametricStream(startX, startY, endX, endY, palette, onHit, dna, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const angle = Math.atan2(ey - sy, ex - sx);
      const perpX = -Math.sin(angle), perpY = Math.cos(angle);
      const dist = Math.hypot(ex - sx, ey - sy);
      const emitters = species.dualEmitter ? [-4.5, 4.5] : [0];
      const thick = dna.powerScale * (species.dualEmitter ? 0.72 : 1.0);
      const blobs = [], sparks = [];
      const duration = dna.duration;
      const t0 = performance.now();
      let hit = false;

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
          for (const emOffset of emitters) {
            const waveOffset = Math.sin(p * Math.PI * dna.waveFreq + emOffset) * dna.waveAmp;
            const ox = sx + perpX * (emOffset + waveOffset);
            const oy = sy + perpY * (emOffset + waveOffset);
            const countPerFrame = dna.subMode === 'mega_cannon' ? 4 : 3;

            for (let i = 0; i < countPerFrame; i++) {
              const speed = Math.max(2.7, dist / 18) * (0.9 + Math.random() * 0.22);
              const spread = dna.subMode === 'mega_cannon' ? 0 : (Math.random() - 0.5) * 0.11;
              blobs.push({
                x: ox, y: oy,
                vx: Math.cos(angle + spread) * speed,
                vy: Math.sin(angle + spread) * speed,
                r: (dna.subMode === 'mega_cannon' ? 4.2 : 2.6 + Math.random() * 1.8) * thick,
                grow: dna.subMode === 'mega_cannon' ? 0.12 : 0.32 * thick,
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
            for (let k = 0; k < 20; k++) {
              const a = Math.random() * Math.PI * 2, sp = 0.7 + Math.random() * 2.6;
              blobs.push({ x: ex + (Math.random() - 0.5) * 8, y: ey + (Math.random() - 0.5) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 5 * thick, grow: 0.12, life: 1, decay: 0.045 });
              sparks.push({ x: ex, y: ey, vx: Math.cos(a) * sp * 2.3, vy: Math.sin(a) * sp * 2.3, life: 1, accent: k % 3 === 0 });
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
          ctx.fillStyle = sp.accent ? palette.speciesAccent : palette.mid;
          ctx.fillRect(Math.round(sp.x), Math.round(sp.y), 1, 1);
          if (sp.life <= 0) sparks.splice(i, 1);
        }

        if (p < 1 || blobs.length > 0) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 2. PARAMETRIC BARRAGE (Orbes Pesadas & Rajadas de Múltiplos Formatos) ====================
  _renderBarrage(startX, startY, endX, endY, palette, onHit, dna, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const count = dna.projCount;
      const duration = dna.duration;
      const t0 = performance.now();
      let hit = false;

      const items = Array.from({ length: count }, (_, idx) => ({
        delay: count === 1 ? 0 : (idx / count) * 0.45,
        arcY: count === 1 ? -6 : (idx - (count - 1) / 2) * (4 + (idx % 2) * 2),
        emitterShift: species.dualEmitter ? (idx % 2 === 0 ? -4 : 4) : 0,
        hitDone: false,
      }));

      const drawShape = (x, y, r, rot) => {
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        ctx.rotate(rot);

        if (dna.projShape === 'razor_leaf' || dna.projShape === 'petal') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-5, -2, 10, 4);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-4, -1, 8, 2);
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 3, 1);
        } else if (dna.projShape === 'star') {
          ctx.fillStyle = palette.outline; ctx.fillRect(-4, -1, 8, 2); ctx.fillRect(-1, -4, 2, 8);
          ctx.fillStyle = palette.mid;     ctx.fillRect(-3, -1, 6, 2); ctx.fillRect(-1, -3, 2, 6);
          ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 2, 2);
        } else if (dna.projShape === 'crystal_shard' || dna.projShape === 'needle_dart') {
          ctx.fillStyle = palette.outline;
          ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(0, -3); ctx.lineTo(6, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
          ctx.fillStyle = palette.core;
          ctx.fillRect(-2, -1, 4, 2);
        } else if (dna.projShape === 'bubble_ring') {
          ctx.strokeStyle = palette.outer; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = palette.core; ctx.fillRect(-1, -1, 2, 2);
        } else {
          // Orbe densa em 4 camadas (Shadow Ball, Aura Sphere, Energy Ball, Sludge Bomb)
          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(0, 0, Math.round(r * 1.3), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(0, 0, Math.round(r), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(0, 0, Math.max(1, Math.round(r * 0.65)), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(0, 0, Math.max(1, Math.round(r * 0.35)), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      };

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const it of items) {
          const span = count === 1 ? 0.68 : 0.52;
          const local = (p - it.delay) / span;
          if (local < 0 || local > 1.3) continue;
          const t = Math.min(local, 1);
          const ease = count === 1 ? t * t : t;
          const x = sx + (ex - sx) * ease;
          const y = sy + it.emitterShift + (ey - sy) * ease + Math.sin(t * Math.PI) * it.arcY;
          const r = count === 1 ? Math.round(8 * dna.powerScale) : 4;

          if (t >= 0.92 && !it.hitDone) {
            it.hitDone = true;
            if (!hit) { hit = true; onHit(); }
          }

          if (local <= 1) {
            drawShape(x, y, r, t * (8 + dna.waveFreq));
          } else {
            // Anel de impacto individual
            const exp = (local - 1) / 0.3;
            ctx.strokeStyle = palette.speciesAccent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(Math.round(ex), Math.round(ey), Math.round(r + exp * 12), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 3. MELEE RUSH (Cortes, Mordidas, Combos de Socos & Investidas) ====================
  _renderMeleeRush(startX, startY, endX, endY, dir, palette, onHit, dna) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = Math.round(endX / s), ey = Math.round(endY / s);
      const duration = dna.duration;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Rastro elemental durante o avanço
        if (p < 0.42) {
          const t = p / 0.42;
          const cx = sx + (ex - sx) * t;
          const cy = sy + (ey - sy) * t;
          for (let i = 0; i < 5; i++) {
            const bx = cx - i * 4 * dir;
            const r = Math.max(2, (dna.subMode === 'aura_blitz' ? 9 : 5) - i);
            ctx.fillStyle = i % 2 === 0 ? palette.outer : palette.speciesAccent;
            ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(cy), r, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.42) / 0.58;
          ctx.globalAlpha = imp > 0.7 ? Math.max(0, (1 - imp) / 0.3) : 1;

          if (dna.subMode === 'fang_clamp') {
            // Presas superiores e inferiores fechando sobre o alvo (Crunch, Bite, Fire/Ice/Thunder Fang)
            const gap = Math.round((1 - Math.sin(Math.min(imp * 1.4, 1) * Math.PI)) * 14);
            ctx.fillStyle = palette.outline;
            for (let t = -2; t <= 2; t++) {
              ctx.fillRect(ex + t * 5 - 1, ey - gap - 5, 3, 6);
              ctx.fillRect(ex + t * 5 - 1, ey + gap, 3, 6);
            }
            ctx.fillStyle = palette.core;
            for (let t = -2; t <= 2; t++) {
              ctx.fillRect(ex + t * 5, ey - gap - 4, 1, 4);
              ctx.fillRect(ex + t * 5, ey + gap + 1, 1, 4);
            }
          } else if (dna.subMode === 'combo_strikes') {
            // Múltiplos impactos em posições diferentes (Close Combat, Mach Punch, Outrage)
            for (let k = 0; k < dna.strikeCount; k++) {
              const kp = (imp * dna.strikeCount) - k;
              if (kp < 0 || kp > 1.2) continue;
              const ox = Math.cos(k * 2.4) * 10;
              const oy = Math.sin(k * 2.4) * 10;
              const r = Math.round(4 + Math.sin(Math.min(kp, 1) * Math.PI) * 7);
              ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(Math.round(ex + ox), Math.round(ey + oy), r + 2, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(Math.round(ex + ox), Math.round(ey + oy), r, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(Math.round(ex + ox), Math.round(ey + oy), Math.max(1, Math.round(r * 0.45)), 0, Math.PI * 2); ctx.fill();
            }
          } else if (dna.subMode === 'slash_marks') {
            // Cortes com contagem e ângulo únicos por golpe
            const cut = Math.min(imp / 0.45, 1);
            const lines = dna.isCrossSlash
              ? [
                  { x1: ex - 16, y1: ey - 16, x2: ex + 16, y2: ey + 16 },
                  { x1: ex + 16, y1: ey - 16, x2: ex - 16, y2: ey + 16 },
                ]
              : Array.from({ length: dna.slashCount }, (_, i) => {
                  const shift = (i - (dna.slashCount - 1) / 2) * 7;
                  return {
                    x1: ex - 14 * dir + shift,
                    y1: ey - 15,
                    x2: ex + 14 * dir + shift,
                    y2: ey + 15,
                  };
                });

            for (const l of lines) {
              const cx = Math.round(l.x1 + (l.x2 - l.x1) * cut);
              const cy = Math.round(l.y1 + (l.y2 - l.y1) * cut);
              ctx.strokeStyle = palette.outline; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
              ctx.strokeStyle = palette.outer;   ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
              ctx.strokeStyle = palette.core;    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
            }
          } else {
            // Onda de choque de investida corporal (Flare Blitz, Brave Bird, Tackle)
            const r = Math.round(6 + imp * 22 * dna.powerScale);
            ctx.strokeStyle = palette.outer; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = palette.core; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(ex, ey, Math.round(r * 0.6), 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 4. BOLT (Relâmpagos Verticais ou Arcos Horizontais) ====================
  _renderBolt(startX, startY, endX, endY, palette, onHit, dna, species) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = Math.round(startX / s), sy = Math.round(startY / s);
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const isSky = dna.subMode === 'sky_strike';
      const duration = dna.duration;
      const t0 = performance.now();
      let hit = false, fc = 0;

      const buildPath = () => {
        const x0 = isSky ? ex + Math.round((Math.random() - 0.5) * 10) : sx;
        const y0 = isSky ? 0 : sy;
        const pts = [{ x: x0, y: y0 }];
        const segs = 8 + (dna.waveFreq % 4);
        for (let i = 1; i < segs; i++) {
          const t = i / segs;
          pts.push({
            x: Math.round(x0 + (ex - x0) * t + (isSky ? (Math.random() - 0.5) * 18 : 0)),
            y: Math.round(y0 + (ey - y0) * t + (!isSky ? (Math.random() - 0.5) * 16 : 0)),
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
          ctx.fillStyle = palette.speciesAccent; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;          ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
        }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 5. FIELD AREA (Estrela Fire Blast, Tsunami, Terremoto, Chuva de Pedras, Ciclone, Anéis) ====================
  _renderFieldArea(startX, startY, endX, endY, floorY, dir, palette, onHit, dna) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s, fy = Math.round(floorY / s);
      const duration = dna.duration;
      const t0 = performance.now();
      let hit = false;

      const starAngles = [-Math.PI / 2, -Math.PI / 2 + 0.72, -Math.PI / 2 - 0.72, Math.PI / 2 + 0.52, Math.PI / 2 - 0.52];

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (dna.subMode === 'star_nova') {
          // Fire Blast / Overheat
          if (p < 0.34) {
            const t = p / 0.34;
            const cx = Math.round(sx + (ex - sx) * t), cy = Math.round(sy + (ey - sy) * t);
            ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
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
        } else if (dna.subMode === 'tsunami_wave') {
          // Surf / Muddy Water / Heat Wave
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
        } else if (dna.subMode === 'seismic_pillars') {
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
              ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.moveTo(px - 2, fy); ctx.lineTo(px, fy - h); ctx.lineTo(px + 2, fy); ctx.fill();
            });
          }
        } else if (dna.subMode === 'sky_barrage') {
          // Stone Edge / Rock Slide / Draco Meteor
          [-14, -7, 0, 7, 14].forEach((ox, i) => {
            const lp = Math.max(0, Math.min((p - i * 0.08) / 0.55, 1));
            if (lp <= 0) return;
            const rx = Math.round(ex + ox);
            const ry = Math.round((ey - 32) + 34 * (lp * lp));
            if (lp >= 0.9 && !hit) { hit = true; onHit(); }
            ctx.fillStyle = palette.outline; ctx.fillRect(rx - 4, ry - 4, 8, 8);
            ctx.fillStyle = palette.outer;   ctx.fillRect(rx - 3, ry - 3, 6, 6);
            ctx.fillStyle = palette.core;    ctx.fillRect(rx - 2, ry - 2, 2, 2);
          });
        } else if (dna.subMode === 'vortex_cyclone') {
          // Blizzard / Hurricane / Petal Dance
          if (!hit && p >= 0.28) { hit = true; onHit(); }
          for (let i = 0; i < 18; i++) {
            const hNorm = i / 18;
            const y = Math.round(fy - hNorm * 38);
            const radius = 5 + hNorm * 16;
            const x = Math.round(ex + Math.cos(p * 18 + i * 0.8) * radius);
            ctx.fillStyle = i % 3 === 0 ? palette.speciesAccent : (i % 2 === 0 ? palette.mid : palette.core);
            ctx.fillRect(x - 1, y - 1, 3, 2);
          }
        } else {
          // Harmonic Rings (Psychic, Dragon Pulse, Hyper Voice, Dark Pulse)
          for (let i = 0; i < 4; i++) {
            const lp = Math.max(0, Math.min((p - i * 0.12) / 0.65, 1));
            if (lp <= 0) continue;
            const cx = Math.round(sx + (ex - sx) * lp);
            const cy = Math.round(sy + (ey - sy) * lp);
            const r = Math.round(4 + lp * 13);
            if (lp >= 0.92 && !hit) { hit = true; onHit(); }
            ctx.strokeStyle = palette.outline; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = i % 2 === 0 ? palette.mid : palette.speciesAccent; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // ==================== 6. DRAIN TETHER (Giga Drain, Drain Punch, Leech Life) ====================
  _renderDrainTether(startX, startY, endX, endY, palette, onHit, dna) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const duration = dna.duration + 180;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.45) {
          // Onda de drenagem indo até o alvo
          const t = p / 0.45;
          const cx = Math.round(sx + (ex - sx) * t), cy = Math.round(sy + (ey - sy) * t);
          ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
        } else {
          if (!hit) { hit = true; onHit(); }
          // Orbes vitais voltando do alvo para curar o atacante!
          const rt = (p - 0.45) / 0.55;
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

  // ==================== 7. STATUS AURA (Buff, Cura, Escudo ou Debuff no Alvo) ====================
  _renderStatusAura(targetX, floorY, palette, dna) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const cx = Math.round(targetX / s), fy = Math.round(floorY / s);
      const duration = dna.duration;
      const t0 = performance.now();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (dna.subMode === 'shield') {
          ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, fy - 16, Math.round(14 + Math.sin(p * Math.PI) * 4), 0, Math.PI * 2); ctx.stroke();
        } else {
          const isDebuff = dna.subMode === 'debuff_target';
          const color = dna.subMode === 'heal' ? '#4ade80' : (isDebuff ? '#a855f7' : palette.mid);
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8 + p * 8;
            const x = Math.round(cx + Math.cos(a) * 14);
            const offset = (p * 30 + i * 4) % 28;
            const y = Math.round(isDebuff ? (fy - 34 + offset) : (fy - 6 - offset));
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
