/**
 * BattleAnimator & ArticulatedRig v2.0 - Motor de Animações Individuais 2D Pixel Art
 * Cada golpe possui coreografia corporal articulada + renderização visual própria no Canvas 4x,
 * mapeada por nome do ataque (PokeAPI slug / EN / PT) e classe de dano (physical / special / status).
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
 * Assinaturas individuais de golpes famosos (aceita slug da PokeAPI, inglês ou português normalizado).
 * Estilos disponíveis:
 * - stream        : Jato contínuo pressurizado (Lança-chamas, Hidro Bomba, Raio de Gelo)
 * - fire_blast    : Bola de fogo que explode em estrela de 5 pontas (Fire Blast, Overheat)
 * - solar_beam    : Carga de esferas de energia + mega laser atravessando a arena (Solar Beam, Hyper Beam)
 * - wave          : Onda gigante varrendo o chão da arena (Surf, Muddy Water, Lava Plume)
 * - multi_proj    : Rajada sequencial de projéteis/folhas/brasas/estrelas (Razor Leaf, Ember, Swift, Bullet Seed)
 * - blitz_charge  : Investida corporal envolta em aura atravessando o inimigo (Flare Blitz, Brave Bird, Volt Tackle, Quick Attack)
 * - slash_combo   : Avanço + cortes diagonais/cruzados de garra ou lâmina (Dragon Claw, Air Slash, X-Scissor, Night Slash)
 * - multi_punch   : Sequência rápida de socos/impactos com ondas de choque (Close Combat, Mach Punch, Meteor Mash, Giga Impact)
 * - bolt_sky      : Relâmpago vertical caindo do céu com ramificações (Thunder)
 * - bolt_arc      : Descarga elétrica horizontal saindo do atacante (Thunderbolt, Discharge)
 * - quake         : Terremoto com fissuras e pilares de rocha brotando do solo (Earthquake, Earth Power)
 * - rock_barrage  : Pedregulhos ou lâminas de pedra levitando e cravando no alvo (Stone Edge, Rock Slide)
 * - psychic_pulse : Ondas concêntricas distorcidas / telecinese (Psychic, Dragon Pulse, Dark Pulse)
 * - energy_orb    : Esfera densa de energia com rastro e detonação (Shadow Ball, Aura Sphere, Sludge Bomb, Energy Ball)
 * - vortex_storm  : Ciclone / nevasca giratória engolindo o alvo (Blizzard, Hurricane, Petal Dance, Sandstorm)
 * - status_buff   : Aura de fortalecimento, cura ou escudo no próprio usuário (Swords Dance, Dragon Dance, Roost, Protect)
 */
const MOVE_SIGNATURES = {
  // FOGO
  'flamethrower':   { style: 'stream', type: 'FIRE', thickness: 1.0, duration: 920 },
  'lanca chamas':   { style: 'stream', type: 'FIRE', thickness: 1.0, duration: 920 },
  'fire blast':     { style: 'fire_blast', type: 'FIRE', duration: 1050 },
  'rajada de fogo': { style: 'fire_blast', type: 'FIRE', duration: 1050 },
  'overheat':       { style: 'fire_blast', type: 'FIRE', duration: 1100 },
  'superaquecimento': { style: 'fire_blast', type: 'FIRE', duration: 1100 },
  'blast burn':     { style: 'fire_blast', type: 'FIRE', duration: 1150 },
  'ember':          { style: 'multi_proj', type: 'FIRE', count: 5, shape: 'orb', duration: 720 },
  'brasa':          { style: 'multi_proj', type: 'FIRE', count: 5, shape: 'orb', duration: 720 },
  'flare blitz':    { style: 'blitz_charge', type: 'FIRE', recoil: true, duration: 780 },
  'investida de fogo': { style: 'blitz_charge', type: 'FIRE', recoil: true, duration: 780 },
  'fire punch':     { style: 'multi_punch', type: 'FIRE', hits: 2, duration: 620 },
  'soco de fogo':   { style: 'multi_punch', type: 'FIRE', hits: 2, duration: 620 },
  'heat wave':      { style: 'wave', type: 'FIRE', duration: 880 },
  'lava plume':     { style: 'wave', type: 'FIRE', duration: 880 },

  // ÁGUA
  'hydro pump':     { style: 'stream', type: 'WATER', thickness: 1.35, duration: 950 },
  'hidro bomba':    { style: 'stream', type: 'WATER', thickness: 1.35, duration: 950 },
  'water gun':      { style: 'stream', type: 'WATER', thickness: 0.65, duration: 680 },
  'jato de agua':   { style: 'stream', type: 'WATER', thickness: 0.65, duration: 680 },
  'surf':           { style: 'wave', type: 'WATER', duration: 960 },
  'surfar':         { style: 'wave', type: 'WATER', duration: 960 },
  'muddy water':    { style: 'wave', type: 'GROUND', duration: 940 },
  'bubble beam':    { style: 'multi_proj', type: 'WATER', count: 8, shape: 'ring', duration: 780 },
  'water pulse':    { style: 'psychic_pulse', type: 'WATER', duration: 760 },
  'aqua tail':      { style: 'slash_combo', type: 'WATER', slashes: 2, duration: 540 },
  'waterfall':      { style: 'blitz_charge', type: 'WATER', duration: 720 },
  'aqua jet':       { style: 'blitz_charge', type: 'WATER', fast: true, duration: 520 },
  'water shuriken': { style: 'multi_proj', type: 'WATER', count: 5, shape: 'star', duration: 680 },

  // PLANTA
  'solar beam':     { style: 'solar_beam', type: 'GRASS', duration: 1250 },
  'raio solar':     { style: 'solar_beam', type: 'GRASS', duration: 1250 },
  'frenzy plant':   { style: 'quake', type: 'GRASS', duration: 980 },
  'razor leaf':     { style: 'multi_proj', type: 'GRASS', count: 7, shape: 'leaf', duration: 760 },
  'folha navalha':  { style: 'multi_proj', type: 'GRASS', count: 7, shape: 'leaf', duration: 760 },
  'magical leaf':   { style: 'multi_proj', type: 'GRASS', count: 7, shape: 'leaf', duration: 760 },
  'bullet seed':    { style: 'multi_proj', type: 'GRASS', count: 6, shape: 'orb', duration: 700 },
  'leaf blade':     { style: 'slash_combo', type: 'GRASS', slashes: 2, duration: 500 },
  'energy ball':    { style: 'energy_orb', type: 'GRASS', duration: 720 },
  'bola de energia': { style: 'energy_orb', type: 'GRASS', duration: 720 },
  'giga drain':     { style: 'psychic_pulse', type: 'GRASS', duration: 820 },
  'petal dance':    { style: 'vortex_storm', type: 'GRASS', duration: 950 },

  // ELÉTRICO
  'thunder':        { style: 'bolt_sky', type: 'ELECTRIC', duration: 680 },
  'trovao':         { style: 'bolt_sky', type: 'ELECTRIC', duration: 680 },
  'thunderbolt':    { style: 'bolt_arc', type: 'ELECTRIC', duration: 620 },
  'choque do trovao': { style: 'bolt_arc', type: 'ELECTRIC', duration: 620 },
  'discharge':      { style: 'bolt_arc', type: 'ELECTRIC', duration: 680 },
  'volt tackle':    { style: 'blitz_charge', type: 'ELECTRIC', recoil: true, duration: 760 },
  'wild charge':    { style: 'blitz_charge', type: 'ELECTRIC', recoil: true, duration: 740 },
  'thunder punch':  { style: 'multi_punch', type: 'ELECTRIC', hits: 2, duration: 600 },

  // DRAGÃO & VOADOR
  'dragon claw':    { style: 'slash_combo', type: 'DRAGON', slashes: 3, duration: 520 },
  'garra de dragao': { style: 'slash_combo', type: 'DRAGON', slashes: 3, duration: 520 },
  'dragon pulse':   { style: 'psychic_pulse', type: 'DRAGON', duration: 780 },
  'pulso do dragao': { style: 'psychic_pulse', type: 'DRAGON', duration: 780 },
  'dragon rush':    { style: 'blitz_charge', type: 'DRAGON', duration: 760 },
  'outrage':        { style: 'multi_punch', type: 'DRAGON', hits: 4, duration: 820 },
  'draco meteor':   { style: 'rock_barrage', type: 'DRAGON', duration: 980 },
  'air slash':      { style: 'slash_combo', type: 'FLYING', slashes: 2, duration: 500 },
  'corte aereo':    { style: 'slash_combo', type: 'FLYING', slashes: 2, duration: 500 },
  'hurricane':      { style: 'vortex_storm', type: 'FLYING', duration: 980 },
  'furacao':        { style: 'vortex_storm', type: 'FLYING', duration: 980 },
  'brave bird':     { style: 'blitz_charge', type: 'FLYING', recoil: true, duration: 760 },
  'passaro bravo':  { style: 'blitz_charge', type: 'FLYING', recoil: true, duration: 760 },
  'wing attack':    { style: 'slash_combo', type: 'FLYING', slashes: 2, duration: 480 },
  'ataque de asa':  { style: 'slash_combo', type: 'FLYING', slashes: 2, duration: 480 },

  // TERRA, PEDRA & GELO
  'earthquake':     { style: 'quake', type: 'GROUND', duration: 920 },
  'terremoto':      { style: 'quake', type: 'GROUND', duration: 920 },
  'earth power':    { style: 'quake', type: 'GROUND', duration: 880 },
  'stone edge':     { style: 'rock_barrage', type: 'ROCK', duration: 780 },
  'gume de pedra':  { style: 'rock_barrage', type: 'ROCK', duration: 780 },
  'rock slide':     { style: 'rock_barrage', type: 'ROCK', duration: 820 },
  'ice beam':       { style: 'stream', type: 'ICE', thickness: 0.9, duration: 860 },
  'raio de gelo':   { style: 'stream', type: 'ICE', thickness: 0.9, duration: 860 },
  'blizzard':       { style: 'vortex_storm', type: 'ICE', duration: 980 },
  'nevasca':        { style: 'vortex_storm', type: 'ICE', duration: 980 },
  'ice punch':      { style: 'multi_punch', type: 'ICE', hits: 2, duration: 600 },

  // PSÍQUICO, FANTASMA, SOMBRIO, LUTADOR, AÇO, NORMAL
  'psychic':        { style: 'psychic_pulse', type: 'PSYCHIC', duration: 840 },
  'psiquico':       { style: 'psychic_pulse', type: 'PSYCHIC', duration: 840 },
  'shadow ball':    { style: 'energy_orb', type: 'GHOST', duration: 740 },
  'bola sombria':   { style: 'energy_orb', type: 'GHOST', duration: 740 },
  'shadow claw':    { style: 'slash_combo', type: 'GHOST', slashes: 3, duration: 520 },
  'dark pulse':     { style: 'psychic_pulse', type: 'DARK', duration: 780 },
  'crunch':         { style: 'multi_punch', type: 'DARK', hits: 2, duration: 560 },
  'sludge bomb':    { style: 'energy_orb', type: 'POISON', duration: 740 },
  'close combat':   { style: 'multi_punch', type: 'FIGHTING', hits: 5, duration: 820 },
  'combate proximo': { style: 'multi_punch', type: 'FIGHTING', hits: 5, duration: 820 },
  'aura sphere':    { style: 'energy_orb', type: 'FIGHTING', duration: 700 },
  'esfera de aura': { style: 'energy_orb', type: 'FIGHTING', duration: 700 },
  'mach punch':     { style: 'multi_punch', type: 'FIGHTING', hits: 1, fast: true, duration: 460 },
  'flash cannon':   { style: 'solar_beam', type: 'STEEL', duration: 960 },
  'iron tail':      { style: 'slash_combo', type: 'STEEL', slashes: 1, duration: 540 },
  'cauda de ferro': { style: 'slash_combo', type: 'STEEL', slashes: 1, duration: 540 },
  'hyper beam':     { style: 'solar_beam', type: 'NORMAL', duration: 1200 },
  'hiper raio':     { style: 'solar_beam', type: 'NORMAL', duration: 1200 },
  'giga impact':    { style: 'blitz_charge', type: 'NORMAL', recoil: true, duration: 840 },
  'quick attack':   { style: 'blitz_charge', type: 'NORMAL', fast: true, duration: 480 },
  'ataque rapido':  { style: 'blitz_charge', type: 'NORMAL', fast: true, duration: 480 },
  'swift':          { style: 'multi_proj', type: 'NORMAL', count: 6, shape: 'star', duration: 700 },
  'x scissor':      { style: 'slash_combo', type: 'BUG', slashes: 2, cross: true, duration: 520 },
  'moonblast':      { style: 'energy_orb', type: 'FAIRY', duration: 800 },
  'dazzling gleam': { style: 'psychic_pulse', type: 'FAIRY', duration: 760 },

  // STATUS / BUFFS / CURA
  'swords dance':   { style: 'status_buff', type: 'NORMAL', mode: 'buff', duration: 760 },
  'danca das espadas': { style: 'status_buff', type: 'NORMAL', mode: 'buff', duration: 760 },
  'dragon dance':   { style: 'status_buff', type: 'DRAGON', mode: 'buff', duration: 780 },
  'calm mind':      { style: 'status_buff', type: 'PSYCHIC', mode: 'buff', duration: 760 },
  'roost':          { style: 'status_buff', type: 'FLYING', mode: 'heal', duration: 760 },
  'recover':        { style: 'status_buff', type: 'NORMAL', mode: 'heal', duration: 760 },
  'synthesis':      { style: 'status_buff', type: 'GRASS', mode: 'heal', duration: 760 },
  'protect':        { style: 'status_buff', type: 'NORMAL', mode: 'shield', duration: 680 },
  'proteger':       { style: 'status_buff', type: 'NORMAL', mode: 'shield', duration: 680 },
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

function resolveMoveSignature({ moveName, moveType, damageClass, power }) {
  const key = normalizeKey(moveName);
  const typeUpper = normalizeType(moveType);
  const dmgClass = normalizeKey(damageClass); // 'physical', 'special', 'status'
  const numPower = Number(power) || 0;

  // 1. Verifica assinatura específica do golpe
  if (key && MOVE_SIGNATURES[key]) {
    const sig = { ...MOVE_SIGNATURES[key] };
    if (moveType) sig.type = typeUpper;
    return sig;
  }

  // 2. Fallback inteligente por palavras-chave no nome + classe de dano da PokeAPI
  if (dmgClass === 'status') {
    const isHeal = /heal|recover|roost|synthesis|rest|wish|drink|cura|descanso/.test(key);
    const isShield = /protect|detect|guard|barrier|screen|veil|shield|escudo|prote/.test(key);
    return {
      style: 'status_buff',
      type: typeUpper,
      mode: isHeal ? 'heal' : isShield ? 'shield' : 'buff',
      duration: 740,
    };
  }

  if (/beam|cannon|raio|canhao|laser/.test(key)) {
    return {
      style: numPower >= 110 ? 'solar_beam' : 'stream',
      type: typeUpper,
      thickness: numPower >= 100 ? 1.25 : 0.9,
      duration: numPower >= 110 ? 1150 : 860,
    };
  }

  if (/claw|slash|cut|blade|scissor|garra|corte|lamina|tail|cauda/.test(key)) {
    return { style: 'slash_combo', type: typeUpper, slashes: 2, duration: 540 };
  }

  if (/punch|kick|slam|smash|impact|soco|chute|pancada|crunch|bite|mordida/.test(key)) {
    return { style: 'multi_punch', type: typeUpper, hits: numPower >= 95 ? 3 : 2, duration: 640 };
  }

  if (/blitz|tackle|rush|charge|jet|quick|investida|ataque/.test(key)) {
    return { style: 'blitz_charge', type: typeUpper, recoil: numPower >= 100, duration: 720 };
  }

  if (/wave|surf|onda|tide|flood/.test(key)) {
    return { style: 'wave', type: typeUpper, duration: 900 };
  }

  if (/storm|blizzard|hurricane|wind|tornado|nevasca|furacao|vento/.test(key)) {
    return { style: 'vortex_storm', type: typeUpper, duration: 920 };
  }

  if (/quake|earth|fissure|terremoto|terra/.test(key)) {
    return { style: 'quake', type: typeUpper, duration: 880 };
  }

  if (/rock|stone|meteor|pedra|meteoro/.test(key)) {
    return { style: 'rock_barrage', type: typeUpper, duration: 800 };
  }

  if (/ball|sphere|bomb|orb|bola|esfera|bomba/.test(key)) {
    return { style: 'energy_orb', type: typeUpper, duration: 740 };
  }

  if (/pulse|psychic|wave|pulso|psiquico/.test(key)) {
    return { style: 'psychic_pulse', type: typeUpper, duration: 780 };
  }

  if (/leaf|seed|star|swift|bullet|folha|semente|estrela/.test(key)) {
    return { style: 'multi_proj', type: typeUpper, count: 6, shape: 'orb', duration: 740 };
  }

  if (/thunder|bolt|volt|spark|trovao|choque/.test(key)) {
    return { style: numPower >= 100 ? 'bolt_sky' : 'bolt_arc', type: typeUpper, duration: 640 };
  }

  // 3. Fallback final baseado em Physical vs Special da PokeAPI
  if (dmgClass === 'physical') {
    return numPower >= 85
      ? { style: 'blitz_charge', type: typeUpper, duration: 720 }
      : { style: 'slash_combo', type: typeUpper, slashes: 2, duration: 540 };
  }

  // Default Special
  if (['FIRE', 'FOGO', 'WATER', 'AGUA', 'ICE', 'GELO'].includes(typeUpper)) {
    return { style: 'stream', type: typeUpper, thickness: 1.0, duration: 860 };
  }
  if (['ELECTRIC', 'ELETRICO'].includes(typeUpper)) {
    return { style: 'bolt_arc', type: typeUpper, duration: 640 };
  }
  return { style: 'energy_orb', type: typeUpper, duration: 740 };
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
 * Mantém o sprite original da PokeAPI (.png ou .gif) sem trocá-lo por modelos externos.
 */
class ArticulatedRig {
  constructor(spriteEl) {
    if (!spriteEl) throw new Error('ArticulatedRig: spriteEl é obrigatório.');
    injectRigStyles();

    // Se já foi montado neste elemento, reutiliza
    if (spriteEl._pbfxRig) {
      return spriteEl._pbfxRig;
    }

    this.originalEl = spriteEl;
    this.idleAnims = [];

    const initialSrc = spriteEl.tagName === 'IMG'
      ? spriteEl.src
      : (spriteEl.querySelector('img')?.src || '');

    // Cria container hierárquico substituindo ou envolvendo o img
    const root = document.createElement('div');
    root.className = 'pbfx-rig-root';
    if (spriteEl.id) root.id = spriteEl.id;
    if (spriteEl.className) {
      spriteEl.className.split(/\s+/).filter(Boolean).forEach((c) => root.classList.add(c));
    }

    // Preserva dimensões computadas do elemento original
    const cs = window.getComputedStyle(spriteEl);
    if (cs.width && cs.width !== '0px') root.style.width = cs.width;
    if (cs.height && cs.height !== '0px') root.style.height = cs.height;

    const placeholder = document.createElement('img');
    placeholder.className = 'pbfx-rig-placeholder';
    placeholder.alt = spriteEl.alt || '';
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

    // Hierarquia: Root -> Base -> Torso -> Head
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
    if (initialSrc) this.setSprite(initialSrc);
    this.startIdle();
  }

  setSprite(src) {
    if (!src) return;
    this.placeholder.src = src;
    this.baseImg.src = src;
    this.torsoImg.src = src;
    this.headImg.src = src;
    this.root.style.opacity = '1';
    this.baseEl.style.transform = '';
    this.torsoEl.style.transform = '';
    this.headEl.style.transform = '';
  }

  startIdle() {
    this.stopIdle();
    const opts = { duration: 1500, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' };
    this.idleAnims = [
      this.baseEl.animate(
        [{ transform: 'scaleY(1) scaleX(1)' }, { transform: 'scaleY(0.97) scaleX(1.02)' }],
        opts
      ),
      this.torsoEl.animate(
        [{ transform: 'rotate(-1.5deg) translateY(0px)' }, { transform: 'rotate(2deg) translateY(1px)' }],
        { ...opts, duration: 1500 }
      ),
      this.headEl.animate(
        [{ transform: 'rotate(2deg) scaleX(1)' }, { transform: 'rotate(-3deg) scaleX(1.03)' }],
        { ...opts, duration: 1500, delay: 140 }
      ),
    ];
  }

  stopIdle() {
    this.idleAnims.forEach((a) => a.cancel());
    this.idleAnims = [];
  }

  async playWindup(dir, glowColor) {
    this.stopIdle();
    if (glowColor) {
      this.root.style.filter = `drop-shadow(0 0 8px ${glowColor})`;
    }
    const dur = 230;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'translateX(0) scaleY(1) scaleX(1)' },
          { transform: `translateX(${-8 * dir}px) scaleY(0.90) scaleX(1.06)` },
        ],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.torsoEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-15 * dir}deg)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
      this.headEl.animate(
        [{ transform: 'rotate(0deg)' }, { transform: `rotate(${-12 * dir}deg)` }],
        { duration: dur, fill: 'forwards', easing }
      ).finished,
    ]);
  }

  async playBeamPose(dir, duration = 650) {
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translateX(${-8 * dir}px) scaleY(0.90)` },
          { transform: `translateX(${10 * dir}px) scaleY(1.03)`, offset: 0.25 },
          { transform: `translateX(${4 * dir}px) scaleY(1)`, offset: 0.8 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-15 * dir}deg)` },
          { transform: `rotate(${17 * dir}deg)`, offset: 0.25 },
          { transform: `rotate(${12 * dir}deg)`, offset: 0.8 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `rotate(${-12 * dir}deg) translateX(0px)` },
          { transform: `rotate(${10 * dir}deg) translateX(${7 * dir}px) scaleX(1.07)`, offset: 0.25 },
          { transform: `rotate(${8 * dir}deg) translateX(${4 * dir}px)`, offset: 0.8 },
          { transform: 'rotate(0deg) translateX(0px) scaleX(1)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playDashStrike(dir, distancePx, duration = 560) {
    const easing = 'cubic-bezier(0.2, 0.9, 0.25, 1)';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: `translateX(${-8 * dir}px) scaleY(0.90)` },
          { transform: `translateX(${distancePx * dir}px) scaleY(1.04)`, offset: 0.38 },
          { transform: `translateX(${(distancePx - 14) * dir}px) scaleY(0.95)`, offset: 0.55 },
          { transform: 'translateX(0px) scaleY(1)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: `rotate(${-15 * dir}deg)` },
          { transform: `rotate(${25 * dir}deg)`, offset: 0.38 },
          { transform: `rotate(${-8 * dir}deg)`, offset: 0.65 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: `rotate(${-12 * dir}deg)` },
          { transform: `rotate(${18 * dir}deg) translateX(${5 * dir}px)`, offset: 0.38 },
          { transform: `rotate(${-6 * dir}deg)`, offset: 0.65 },
          { transform: 'rotate(0deg) translateX(0px)' },
        ],
        { duration, easing }
      ).finished,
    ]);
    this.root.style.filter = '';
    this.startIdle();
  }

  async playBuffPose(duration = 650) {
    const easing = 'ease-in-out';
    await Promise.all([
      this.baseEl.animate(
        [
          { transform: 'scaleY(1)' },
          { transform: 'scaleY(0.92)', offset: 0.25 },
          { transform: 'scaleY(1.06) translateY(-6px)', offset: 0.6 },
          { transform: 'scaleY(1) translateY(0px)' },
        ],
        { duration, easing }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-8deg)', offset: 0.4 },
          { transform: 'rotate(6deg)', offset: 0.7 },
          { transform: 'rotate(0deg)' },
        ],
        { duration, easing }
      ).finished,
      this.headEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-14deg)', offset: 0.5 },
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
    const dur = 400;
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
          { transform: `translateX(${14 * dir}px) scaleY(0.93)`, offset: 0.25 },
          { transform: `translateX(${-6 * dir}px)`, offset: 0.55 },
          { transform: 'translateX(0) scaleY(1)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
      this.torsoEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${20 * dir}deg)`, offset: 0.25 },
          { transform: `rotate(${-6 * dir}deg)`, offset: 0.6 },
          { transform: 'rotate(0deg)' },
        ],
        { duration: dur, easing: 'ease-out' }
      ).finished,
      this.headEl.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: `rotate(${24 * dir}deg)`, offset: 0.25 },
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

  /**
   * Cria ou recupera o Rig Articulado de um sprite da arena.
   */
  attachRig(spriteEl) {
    if (!spriteEl) return null;
    if (spriteEl._pbfxRig) return spriteEl._pbfxRig;
    if (this.rigs.has(spriteEl)) return this.rigs.get(spriteEl);
    const rig = new ArticulatedRig(spriteEl);
    this.rigs.set(spriteEl, rig);
    return rig;
  }

  _getAnchorPoints(attackerRoot, targetRoot) {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const attRect = attackerRoot.getBoundingClientRect();
    const tgtRect = targetRoot.getBoundingClientRect();

    const isLeftToRight = attRect.left < tgtRect.left;
    const dir = isLeftToRight ? 1 : -1;

    const startX = attRect.left + attRect.width * (isLeftToRight ? 0.68 : 0.32) - arenaRect.left;
    const startY = attRect.top + attRect.height * 0.42 - arenaRect.top;
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
   * Executa a animação individualizada do golpe com esqueleto articulado + efeito visual próprio.
   *
   * @param {Object} params
   * @param {HTMLElement} params.attackerEl Sprite ou Rig do atacante
   * @param {HTMLElement} params.targetEl Sprite ou Rig do defensor
   * @param {string} [params.moveName] Nome do ataque (ex: 'flamethrower', 'fire-blast', 'surf', 'solar-beam', 'dragon-claw')
   * @param {string} [params.moveType='NORMAL'] Tipo elemental ('FOGO', 'FIRE', 'AGUA', 'WATER', etc.)
   * @param {string} [params.damageClass] 'physical' | 'special' | 'status' (vindo da PokeAPI)
   * @param {number} [params.power] Poder base do golpe (vindo da PokeAPI)
   * @param {Function} [params.onImpact] Callback sincronizado para aplicar dano na barra de HP
   */
  async playAttack({ attackerEl, targetEl, moveName = '', moveType = 'NORMAL', damageClass = '', power = 0, onImpact }) {
    if (!attackerEl || !targetEl) return;
    this.resize();

    const attRig = this.attachRig(attackerEl);
    const tgtRig = this.attachRig(targetEl);

    const sig = resolveMoveSignature({ moveName, moveType, damageClass, power });
    const palette = TYPE_PALETTES[sig.type] || TYPE_PALETTES[normalizeType(moveType)] || TYPE_PALETTES.NORMAL;
    const { startX, startY, endX, endY, floorY, dir } = this._getAnchorPoints(attRig.root, tgtRig.root);

    const triggerHit = () => {
      this._shakeArena();
      tgtRig.playHit(dir);
      if (typeof onImpact === 'function') onImpact();
    };

    // Golpe de Status / Buff / Cura (age no próprio usuário)
    if (sig.style === 'status_buff') {
      attRig.playBuffPose(sig.duration);
      await this._fxStatusBuff(
        (attRig.root.getBoundingClientRect().left + attRig.root.getBoundingClientRect().width / 2) - this.arenaEl.getBoundingClientRect().left,
        floorY,
        palette,
        sig.mode,
        sig.duration
      );
      if (typeof onImpact === 'function') onImpact();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // Etapa 1: Carga Articulada (exceto ataques ultra rápidos)
    if (!sig.fast) {
      await attRig.playWindup(dir, palette.mid);
    }

    // Etapa 2: Disparo ou Investida Articulada + Efeito Específico do Golpe
    const totalDistPx = Math.abs(endX - startX);
    const dashDist = Math.max(40, totalDistPx - 45);

    switch (sig.style) {
      case 'fire_blast':
        attRig.playBeamPose(dir, sig.duration * 0.75);
        await this._fxFireBlast(startX, startY, endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'solar_beam':
        attRig.playBeamPose(dir, sig.duration * 0.85);
        await this._fxSolarBeam(startX, startY, endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'wave':
        attRig.playBeamPose(dir, sig.duration * 0.75);
        await this._fxWave(startX, floorY, endX, palette, triggerHit, sig.duration);
        break;

      case 'multi_proj':
        attRig.playBeamPose(dir, sig.duration * 0.75);
        await this._fxMultiProjectile(startX, startY, endX, endY, palette, triggerHit, sig);
        break;

      case 'blitz_charge':
        attRig.playDashStrike(dir, dashDist, sig.duration);
        await this._fxBlitzCharge(startX, startY, endX, endY, dir, palette, triggerHit, sig);
        break;

      case 'slash_combo':
        attRig.playDashStrike(dir, Math.min(dashDist, 75), sig.duration);
        await this._fxSlashCombo(endX, endY, dir, palette, triggerHit, sig);
        break;

      case 'multi_punch':
        attRig.playDashStrike(dir, Math.min(dashDist, 85), sig.duration);
        await this._fxMultiPunch(endX, endY, dir, palette, triggerHit, sig);
        break;

      case 'bolt_sky':
        attRig.playBeamPose(dir, sig.duration * 0.7);
        await this._fxBoltSky(endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'bolt_arc':
        attRig.playBeamPose(dir, sig.duration * 0.7);
        await this._fxBoltArc(startX, startY, endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'quake':
        attRig.playDashStrike(dir, 28, sig.duration * 0.65);
        await this._fxQuake(startX, floorY, endX, palette, triggerHit, sig.duration);
        break;

      case 'rock_barrage':
        attRig.playBeamPose(dir, sig.duration * 0.7);
        await this._fxRockBarrage(endX, endY, floorY, palette, triggerHit, sig.duration);
        break;

      case 'psychic_pulse':
        attRig.playBeamPose(dir, sig.duration * 0.75);
        await this._fxPsychicPulse(startX, startY, endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'energy_orb':
        attRig.playBeamPose(dir, sig.duration * 0.72);
        await this._fxEnergyOrb(startX, startY, endX, endY, palette, triggerHit, sig.duration);
        break;

      case 'vortex_storm':
        attRig.playBeamPose(dir, sig.duration * 0.75);
        await this._fxVortexStorm(endX, endY, floorY, palette, triggerHit, sig.duration);
        break;

      case 'stream':
      default:
        attRig.playBeamPose(dir, sig.duration * 0.78);
        await this._fxStream(startX, startY, endX, endY, palette, triggerHit, sig);
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

  // ==================== 14 MOTORES VISUAIS DE ATAQUE ====================

  // 1. STREAM (Flamethrower, Hydro Pump, Ice Beam, Water Gun)
  _fxStream(startX, startY, endX, endY, palette, onHit, sig) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const angle = Math.atan2(ey - sy, ex - sx);
      const dist = Math.hypot(ex - sx, ey - sy);
      const thick = sig.thickness || 1.0;
      const blobs = [], sparks = [];
      const duration = sig.duration || 900;
      const t0 = performance.now();
      let hit = false;

      const layers = [
        { color: palette.outline, scale: 1.38, minLife: 0.05 },
        { color: palette.outer,   scale: 1.12, minLife: 0.15 },
        { color: palette.mid,     scale: 0.84, minLife: 0.30 },
        { color: palette.core,    scale: 0.48, minLife: 0.50 },
      ];

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.62) {
          for (let i = 0; i < 4; i++) {
            const speed = Math.max(2.6, dist / 19) * (0.9 + Math.random() * 0.25);
            const spread = (Math.random() - 0.5) * 0.12 * thick;
            blobs.push({
              x: sx, y: sy,
              vx: Math.cos(angle + spread) * speed,
              vy: Math.sin(angle + spread) * speed,
              r: (2.5 + Math.random() * 2) * thick,
              grow: 0.34 * thick,
              life: 1,
              decay: 0.038,
            });
          }
        }

        for (let i = blobs.length - 1; i >= 0; i--) {
          const b = blobs[i];
          b.x += b.vx; b.y += b.vy; b.r += b.grow; b.life -= b.decay;
          if (!hit && Math.hypot(b.x - sx, b.y - sy) >= dist * 0.85) {
            hit = true;
            onHit();
            for (let k = 0; k < 18; k++) {
              const a = Math.random() * Math.PI * 2, sp = 0.7 + Math.random() * 2.5;
              blobs.push({ x: ex + (Math.random() - 0.5) * 8, y: ey + (Math.random() - 0.5) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 5 * thick, grow: 0.12, life: 1, decay: 0.045 });
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

        ctx.fillStyle = palette.mid;
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx; sp.y += sp.vy; sp.life -= 0.045;
          ctx.fillRect(Math.round(sp.x), Math.round(sp.y), 1, 1);
          if (sp.life <= 0) sparks.splice(i, 1);
        }

        if (p < 1 || blobs.length > 0) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 2. FIRE BLAST (Esfera viajando + Explosão em Estrela de 5 Pontas / Kanji 大)
  _fxFireBlast(startX, startY, endX, endY, palette, onHit, duration = 1050) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const t0 = performance.now();
      let hit = false;

      // 5 pontas da estrela / 大
      const starAngles = [-Math.PI / 2, -Math.PI / 2 + 0.72, -Math.PI / 2 - 0.72, Math.PI / 2 + 0.52, Math.PI / 2 - 0.52];

      const drawBlob = (x, y, r) => {
        ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), Math.round(r * 1.35), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), Math.round(r * 1.1), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), Math.round(r * 0.75), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), Math.max(1, Math.round(r * 0.4)), 0, Math.PI * 2); ctx.fill();
      };

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.35) {
          const t = p / 0.35;
          const cx = sx + (ex - sx) * t;
          const cy = sy + (ey - sy) * t;
          drawBlob(cx, cy, 7 + Math.sin(t * 20) * 2);
        } else {
          if (!hit) { hit = true; onHit(); }
          const bt = (p - 0.35) / 0.65;
          const fade = bt > 0.7 ? (1 - bt) / 0.3 : 1;
          const armLen = Math.min(26, bt * 45);
          drawBlob(ex, ey, 9 * fade);
          for (const a of starAngles) {
            for (let step = 4; step <= armLen; step += 4) {
              const bx = ex + Math.cos(a) * step;
              const by = ey + Math.sin(a) * step;
              drawBlob(bx, by, (6 - step * 0.1) * fade);
            }
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 3. SOLAR BEAM / HYPER BEAM (Carga de partículas convergindo + Mega Canhão de Luz)
  _fxSolarBeam(startX, startY, endX, endY, palette, onHit, duration = 1250) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const angle = Math.atan2(ey - sy, ex - sx);
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (p < 0.42) {
          // Fase de absorção de luz
          const ct = p / 0.42;
          const coreR = Math.round(2 + ct * 9);
          for (let i = 0; i < 10; i++) {
            const a = (Math.PI * 2 * i) / 10 + ct * 5;
            const dist = (1 - ct) * 26;
            ctx.fillStyle = palette.mid;
            ctx.fillRect(Math.round(sx + Math.cos(a) * dist), Math.round(sy + Math.sin(a) * dist), 2, 2);
          }
          ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.arc(Math.round(sx), Math.round(sy), coreR + 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;  ctx.beginPath(); ctx.arc(Math.round(sx), Math.round(sy), coreR, 0, Math.PI * 2); ctx.fill();
        } else {
          // Fase do Mega Feixe
          if (!hit) { hit = true; onHit(); }
          const bt = (p - 0.42) / 0.58;
          const pulse = (bt < 0.75 ? 1 : (1 - bt) / 0.25) * (1 + Math.sin(bt * 45) * 0.18);
          const farX = sx + Math.cos(angle) * 240;
          const farY = sy + Math.sin(angle) * 240;

          const drawBeamLine = (w, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, Math.round(w * pulse));
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(Math.round(sx), Math.round(sy));
            ctx.lineTo(Math.round(farX), Math.round(farY));
            ctx.stroke();
          };
          drawBeamLine(16, palette.outline);
          drawBeamLine(12, palette.outer);
          drawBeamLine(7, palette.mid);
          drawBeamLine(3, palette.core);

          // Anéis de choque ao longo do feixe
          for (let r = 1; r <= 3; r++) {
            const distAlong = ((bt * 120 + r * 30) % 90);
            const rx = sx + Math.cos(angle) * distAlong;
            const ry = sy + Math.sin(angle) * distAlong;
            ctx.strokeStyle = palette.core;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(Math.round(rx), Math.round(ry), Math.round(8 * pulse), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 4. WAVE (Surf, Muddy Water, Heat Wave - Onda gigante varrendo a arena)
  _fxWave(startX, floorY, endX, palette, onHit, duration = 950) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, ex = endX / s, fy = floorY / s;
      const dir = ex >= sx ? 1 : -1;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const wx = sx + (ex - sx) * Math.min(p / 0.72, 1.15);
        const crestH = Math.sin(Math.min(p / 0.85, 1) * Math.PI) * 34;

        if (!hit && Math.abs(wx - ex) < 12) {
          hit = true;
          onHit();
        }

        if (crestH > 1) {
          for (let i = -3; i <= 3; i++) {
            const bx = wx - i * 5 * dir;
            const by = fy - crestH * (1 - Math.abs(i) * 0.16);
            const r = Math.max(3, Math.round(8 - Math.abs(i)));

            ctx.fillStyle = palette.outline;
            ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(by), r + 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.outer;
            ctx.fillRect(Math.round(bx - r), Math.round(by), r * 2, Math.max(2, Math.round(fy - by)));
            ctx.fillStyle = palette.mid;
            ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(by), r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;
            ctx.fillRect(Math.round(bx - 2), Math.round(by - r), 4, 2);
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 5. MULTI PROJECTILE (Razor Leaf, Ember, Swift, Water Shuriken, Bubble Beam)
  _fxMultiProjectile(startX, startY, endX, endY, palette, onHit, sig) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const count = sig.count || 6;
      const duration = sig.duration || 760;
      const t0 = performance.now();
      let hit = false;

      const items = Array.from({ length: count }, (_, idx) => ({
        delay: (idx / count) * 0.42,
        arcY: (idx - count / 2) * 5,
        hitDone: false,
      }));

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const it of items) {
          const local = (p - it.delay) / 0.55;
          if (local < 0 || local > 1.15) continue;
          const t = Math.min(local, 1);
          const x = sx + (ex - sx) * t;
          const y = sy + (ey - sy) * t + Math.sin(t * Math.PI) * it.arcY;

          if (t >= 0.92 && !it.hitDone) {
            it.hitDone = true;
            if (!hit) { hit = true; onHit(); }
            ctx.fillStyle = palette.core;
            ctx.fillRect(Math.round(ex - 3), Math.round(ey - 3), 6, 6);
          }

          ctx.save();
          ctx.translate(Math.round(x), Math.round(y));
          ctx.rotate(t * 14);
          if (sig.shape === 'leaf') {
            ctx.fillStyle = palette.outline; ctx.fillRect(-4, -2, 8, 4);
            ctx.fillStyle = palette.mid;     ctx.fillRect(-3, -1, 6, 2);
            ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 3, 1);
          } else if (sig.shape === 'star') {
            ctx.fillStyle = palette.outer; ctx.fillRect(-3, -1, 6, 2); ctx.fillRect(-1, -3, 2, 6);
            ctx.fillStyle = palette.core;  ctx.fillRect(-1, -1, 2, 2);
          } else {
            ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.mid;     ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;    ctx.fillRect(-1, -1, 2, 2);
          }
          ctx.restore();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 6. BLITZ CHARGE (Flare Blitz, Brave Bird, Volt Tackle, Quick Attack)
  _fxBlitzCharge(startX, startY, endX, endY, dir, palette, onHit, sig) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const duration = sig.duration || 760;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const dash = Math.min(p / 0.45, 1);
        const cx = sx + (ex - sx) * dash;
        const cy = sy + (ey - sy) * dash;

        if (dash < 1) {
          // Aura envolvente no atacante em movimento
          for (let i = 0; i < 6; i++) {
            const bx = cx - i * 4 * dir + (Math.random() - 0.5) * 6;
            const by = cy + (Math.random() - 0.5) * 12;
            const r = Math.max(2, 9 - i);
            ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(by), r + 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(by), r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(Math.round(bx), Math.round(by), Math.round(r * 0.5), 0, Math.PI * 2); ctx.fill();
          }
        } else {
          if (!hit) { hit = true; onHit(); }
          const imp = (p - 0.45) / 0.55;
          const r = Math.round(6 + imp * 22);
          ctx.strokeStyle = palette.outer; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = palette.core; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), Math.round(r * 0.65), 0, Math.PI * 2); ctx.stroke();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 7. SLASH COMBO (Dragon Claw, Air Slash, X-Scissor, Night Slash)
  _fxSlashCombo(endX, endY, dir, palette, onHit, sig) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const duration = sig.duration || 520;
      const t0 = performance.now();
      let hit = false;

      const lines = sig.cross
        ? [
            { x1: ex - 16, y1: ey - 16, x2: ex + 16, y2: ey + 16 },
            { x1: ex + 16, y1: ey - 16, x2: ex - 16, y2: ey + 16 },
          ]
        : Array.from({ length: sig.slashes || 3 }, (_, i) => ({
            x1: ex - (14 - i * 7) * dir,
            y1: ey - 16 + i * 3,
            x2: ex + (14 + i * 7) * dir,
            y2: ey + 16 + i * 3,
          }));

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (!hit && p >= 0.25) { hit = true; onHit(); }
        const cut = Math.min(p / 0.5, 1);
        ctx.globalAlpha = p > 0.65 ? Math.max(0, (1 - p) / 0.35) : 1;

        for (const l of lines) {
          const cx = Math.round(l.x1 + (l.x2 - l.x1) * cut);
          const cy = Math.round(l.y1 + (l.y2 - l.y1) * cut);
          ctx.strokeStyle = palette.outline; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
          ctx.strokeStyle = palette.outer; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
          ctx.strokeStyle = palette.core; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(cx, cy); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 8. MULTI PUNCH (Close Combat, Mach Punch, Meteor Mash, Outrage)
  _fxMultiPunch(endX, endY, dir, palette, onHit, sig) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const hits = sig.hits || 4;
      const duration = sig.duration || 760;
      const t0 = performance.now();
      let mainHit = false;

      const punches = Array.from({ length: hits }, (_, i) => ({
        tStart: (i / hits) * 0.65,
        ox: (Math.random() - 0.5) * 20,
        oy: (Math.random() - 0.5) * 20,
      }));

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const pu of punches) {
          const lp = (p - pu.tStart) / 0.35;
          if (lp < 0 || lp > 1) continue;
          if (!mainHit && lp >= 0.3) { mainHit = true; onHit(); }
          const x = Math.round(ex + pu.ox - (1 - lp) * 14 * dir);
          const y = Math.round(ey + pu.oy);
          const r = Math.round(4 + Math.sin(lp * Math.PI) * 6);

          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(x, y, Math.max(1, Math.round(r * 0.5)), 0, Math.PI * 2); ctx.fill();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 9. BOLT SKY (Thunder - Relâmpago vertical do céu)
  _fxBoltSky(endX, endY, palette, onHit, duration = 640) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const t0 = performance.now();
      let hit = false, fc = 0;

      const makeBolt = () => {
        const pts = [{ x: ex + Math.round((Math.random() - 0.5) * 10), y: 0 }];
        for (let i = 1; i < 8; i++) {
          pts.push({ x: Math.round(ex + (Math.random() - 0.5) * 18), y: Math.round((ey * i) / 8) });
        }
        pts.push({ x: ex, y: ey });
        return pts;
      };
      let pts = makeBolt();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!hit && p >= 0.15) { hit = true; onHit(); }

        if (p < 0.8) {
          if (fc++ % 3 === 0) pts = makeBolt();
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
          ctx.fillStyle = palette.outer; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;  ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
        }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 10. BOLT ARC (Thunderbolt / Discharge - Raio horizontal do atacante ao alvo)
  _fxBoltArc(startX, startY, endX, endY, palette, onHit, duration = 620) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = Math.round(startX / s), sy = Math.round(startY / s);
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const t0 = performance.now();
      let hit = false, fc = 0;

      const makeArc = () => {
        const pts = [{ x: sx, y: sy }];
        for (let i = 1; i < 9; i++) {
          const t = i / 9;
          pts.push({
            x: Math.round(sx + (ex - sx) * t),
            y: Math.round(sy + (ey - sy) * t + (Math.random() - 0.5) * 16),
          });
        }
        pts.push({ x: ex, y: ey });
        return pts;
      };
      let pts = makeArc();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!hit && p >= 0.2) { hit = true; onHit(); }

        if (p < 0.82) {
          if (fc++ % 2 === 0) pts = makeArc();
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
          ctx.fillStyle = palette.core; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill();
        }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 11. QUAKE (Earthquake, Earth Power, Frenzy Plant - Pilares de rocha/raízes brotando do solo)
  _fxQuake(startX, floorY, endX, palette, onHit, duration = 900) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, ex = endX / s, fy = Math.round(floorY / s);
      const t0 = performance.now();
      let hit = false;

      const pillars = [-14, -7, 0, 7, 14].map((ox, i) => ({
        x: Math.round(ex + ox),
        maxH: 18 + (2 - Math.abs(i - 2)) * 6,
      }));

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const waveX = sx + (ex - sx) * Math.min(p / 0.4, 1);
        ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(Math.round(sx), fy); ctx.lineTo(Math.round(waveX), fy); ctx.stroke();

        if (p >= 0.35) {
          if (!hit) { hit = true; onHit(); }
          const ep = (p - 0.35) / 0.65;
          const rise = Math.sin(Math.min(ep * 1.2, 1) * Math.PI);
          for (const pl of pillars) {
            const h = Math.max(2, Math.round(pl.maxH * rise));
            ctx.fillStyle = palette.outline;
            ctx.beginPath(); ctx.moveTo(pl.x - 4, fy); ctx.lineTo(pl.x, fy - h - 2); ctx.lineTo(pl.x + 4, fy); ctx.fill();
            ctx.fillStyle = palette.mid;
            ctx.beginPath(); ctx.moveTo(pl.x - 2, fy); ctx.lineTo(pl.x, fy - h); ctx.lineTo(pl.x + 2, fy); ctx.fill();
          }
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 12. ROCK BARRAGE (Stone Edge, Rock Slide, Draco Meteor)
  _fxRockBarrage(endX, endY, floorY, palette, onHit, duration = 800) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), ey = Math.round(endY / s);
      const t0 = performance.now();
      let hit = false;

      const rocks = [-14, -7, 0, 7, 14].map((ox, i) => ({
        x: ex + ox,
        startY: ey - 32 - (i % 2) * 8,
        targetY: ey + (i % 3) * 4,
        delay: i * 0.08,
      }));

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (const rk of rocks) {
          const lp = Math.max(0, Math.min((p - rk.delay) / 0.55, 1));
          if (lp <= 0) continue;
          const y = Math.round(rk.startY + (rk.targetY - rk.startY) * (lp * lp));
          if (lp >= 0.9 && !hit) { hit = true; onHit(); }

          ctx.fillStyle = palette.outline; ctx.fillRect(rk.x - 4, y - 4, 8, 8);
          ctx.fillStyle = palette.outer;   ctx.fillRect(rk.x - 3, y - 3, 6, 6);
          ctx.fillStyle = palette.core;    ctx.fillRect(rk.x - 2, y - 2, 2, 2);
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 13. PSYCHIC PULSE & ENERGY ORB (Psychic, Dragon Pulse, Shadow Ball, Aura Sphere)
  _fxPsychicPulse(startX, startY, endX, endY, palette, onHit, duration = 800) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let i = 0; i < 4; i++) {
          const lp = Math.max(0, Math.min((p - i * 0.12) / 0.65, 1));
          if (lp <= 0) continue;
          const cx = Math.round(sx + (ex - sx) * lp);
          const cy = Math.round(sy + (ey - sy) * lp);
          const r = Math.round(4 + lp * 12);

          if (lp >= 0.92 && !hit) { hit = true; onHit(); }
          ctx.strokeStyle = palette.outline; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = palette.mid; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  _fxEnergyOrb(startX, startY, endX, endY, palette, onHit, duration = 740) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const sx = startX / s, sy = startY / s, ex = endX / s, ey = endY / s;
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const travel = Math.min(p / 0.65, 1);
        const cx = Math.round(sx + (ex - sx) * (travel * travel));
        const cy = Math.round(sy + (ey - sy) * (travel * travel) - Math.sin(travel * Math.PI) * 7);

        if (travel < 1) {
          const r = 8 + Math.sin(p * 30) * 1.5;
          ctx.fillStyle = palette.outline; ctx.beginPath(); ctx.arc(cx, cy, Math.round(r * 1.3), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.outer;   ctx.beginPath(); ctx.arc(cx, cy, Math.round(r), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = palette.core;    ctx.beginPath(); ctx.arc(cx, cy, Math.round(r * 0.45), 0, Math.PI * 2); ctx.fill();
        } else {
          if (!hit) { hit = true; onHit(); }
          const exp = (p - 0.65) / 0.35;
          const r = Math.round(8 + exp * 18);
          ctx.strokeStyle = palette.mid; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(Math.round(ex), Math.round(ey), r, 0, Math.PI * 2); ctx.stroke();
        }

        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
  }

  // 14. VORTEX STORM & STATUS BUFF (Blizzard, Hurricane, Swords Dance, Protect)
  _fxVortexStorm(endX, endY, floorY, palette, onHit, duration = 950) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const ex = Math.round(endX / s), fy = Math.round(floorY / s);
      const t0 = performance.now();
      let hit = false;

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!hit && p >= 0.3) { hit = true; onHit(); }

        for (let i = 0; i < 16; i++) {
          const hNorm = i / 16;
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

  _fxStatusBuff(centerX, floorY, palette, mode = 'buff', duration = 740) {
    return new Promise((resolve) => {
      const ctx = this.ctx, s = this.pixelScale;
      const cx = Math.round(centerX / s), fy = Math.round(floorY / s);
      const t0 = performance.now();

      const frame = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (mode === 'shield') {
          ctx.strokeStyle = palette.core; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, fy - 16, Math.round(14 + Math.sin(p * Math.PI) * 4), 0, Math.PI * 2); ctx.stroke();
        } else {
          const color = mode === 'heal' ? '#4ade80' : palette.mid;
          for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8 + p * 8;
            const x = Math.round(cx + Math.cos(a) * 14);
            const y = Math.round(fy - 6 - ((p * 30 + i * 4) % 28));
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
