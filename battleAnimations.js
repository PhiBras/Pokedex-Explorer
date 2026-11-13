/**
 * BattleAnimator - Motor de Animações de Ataque 2D Pixel Art (Estilo GBA/DS)
 * Renderiza efeitos em baixa resolução (pixel grid 4x) com camadas sobrepostas (metaballs),
 * tremores de impacto, flash de dano e sincronização com barra de HP.
 */

const TYPE_CONFIGS = {
  FOGO: {
    archetype: 'beam',
    palette: { outline: '#7f1d1d', outer: '#ea580c', mid: '#facc15', core: '#fef9c3' },
  },
  FIRE: {
    archetype: 'beam',
    palette: { outline: '#7f1d1d', outer: '#ea580c', mid: '#facc15', core: '#fef9c3' },
  },
  AGUA: {
    archetype: 'beam',
    palette: { outline: '#1e3a8a', outer: '#0284c7', mid: '#38bdf8', core: '#e0f2fe' },
  },
  WATER: {
    archetype: 'beam',
    palette: { outline: '#1e3a8a', outer: '#0284c7', mid: '#38bdf8', core: '#e0f2fe' },
  },
  PLANTA: {
    archetype: 'beam',
    palette: { outline: '#14532d', outer: '#16a34a', mid: '#84cc16', core: '#fef08a' },
  },
  GRASS: {
    archetype: 'beam',
    palette: { outline: '#14532d', outer: '#16a34a', mid: '#84cc16', core: '#fef08a' },
  },
  ELETRICO: {
    archetype: 'bolt',
    palette: { outline: '#713f12', outer: '#eab308', mid: '#fef08a', core: '#ffffff' },
  },
  ELECTRIC: {
    archetype: 'bolt',
    palette: { outline: '#713f12', outer: '#eab308', mid: '#fef08a', core: '#ffffff' },
  },
  VOADOR: {
    archetype: 'slash',
    palette: { outline: '#1e293b', outer: '#64748b', mid: '#cbd5e1', core: '#ffffff' },
  },
  FLYING: {
    archetype: 'slash',
    palette: { outline: '#1e293b', outer: '#64748b', mid: '#cbd5e1', core: '#ffffff' },
  },
  DRAGAO: {
    archetype: 'beam',
    palette: { outline: '#312e81', outer: '#4f46e5', mid: '#06b6d4', core: '#ecfeff' },
  },
  DRAGON: {
    archetype: 'beam',
    palette: { outline: '#312e81', outer: '#4f46e5', mid: '#06b6d4', core: '#ecfeff' },
  },
  GELO: {
    archetype: 'beam',
    palette: { outline: '#164e63', outer: '#06b6d4', mid: '#a5f3fc', core: '#ffffff' },
  },
  ICE: {
    archetype: 'beam',
    palette: { outline: '#164e63', outer: '#06b6d4', mid: '#a5f3fc', core: '#ffffff' },
  },
  VENENO: {
    archetype: 'projectile',
    palette: { outline: '#3b0764', outer: '#7e22ce', mid: '#c084fc', core: '#f3e8ff' },
  },
  POISON: {
    archetype: 'projectile',
    palette: { outline: '#3b0764', outer: '#7e22ce', mid: '#c084fc', core: '#f3e8ff' },
  },
  FANTASMA: {
    archetype: 'projectile',
    palette: { outline: '#1e1b4b', outer: '#4338ca', mid: '#818cf8', core: '#e0e7ff' },
  },
  GHOST: {
    archetype: 'projectile',
    palette: { outline: '#1e1b4b', outer: '#4338ca', mid: '#818cf8', core: '#e0e7ff' },
  },
  PSIQUICO: {
    archetype: 'projectile',
    palette: { outline: '#831843', outer: '#db2777', mid: '#f472b6', core: '#fce7f3' },
  },
  PSYCHIC: {
    archetype: 'projectile',
    palette: { outline: '#831843', outer: '#db2777', mid: '#f472b6', core: '#fce7f3' },
  },
  SOMBRIO: {
    archetype: 'slash',
    palette: { outline: '#09090b', outer: '#27272a', mid: '#71717a', core: '#e4e4e7' },
  },
  DARK: {
    archetype: 'slash',
    palette: { outline: '#09090b', outer: '#27272a', mid: '#71717a', core: '#e4e4e7' },
  },
  ACO: {
    archetype: 'slash',
    palette: { outline: '#1e293b', outer: '#475569', mid: '#94a3b8', core: '#f8fafc' },
  },
  STEEL: {
    archetype: 'slash',
    palette: { outline: '#1e293b', outer: '#475569', mid: '#94a3b8', core: '#f8fafc' },
  },
  PEDRA: {
    archetype: 'projectile',
    palette: { outline: '#451a03', outer: '#78350f', mid: '#b45309', core: '#fde68a' },
  },
  ROCK: {
    archetype: 'projectile',
    palette: { outline: '#451a03', outer: '#78350f', mid: '#b45309', core: '#fde68a' },
  },
  TERRA: {
    archetype: 'projectile',
    palette: { outline: '#422006', outer: '#854d0e', mid: '#ca8a04', core: '#fef08a' },
  },
  GROUND: {
    archetype: 'projectile',
    palette: { outline: '#422006', outer: '#854d0e', mid: '#ca8a04', core: '#fef08a' },
  },
  LUTADOR: {
    archetype: 'slash',
    palette: { outline: '#7f1d1d', outer: '#b91c1c', mid: '#f87171', core: '#fee2e2' },
  },
  FIGHTING: {
    archetype: 'slash',
    palette: { outline: '#7f1d1d', outer: '#b91c1c', mid: '#f87171', core: '#fee2e2' },
  },
  INSETO: {
    archetype: 'slash',
    palette: { outline: '#365314', outer: '#65a30d', mid: '#a3e635', core: '#ecfccb' },
  },
  BUG: {
    archetype: 'slash',
    palette: { outline: '#365314', outer: '#65a30d', mid: '#a3e635', core: '#ecfccb' },
  },
  FADA: {
    archetype: 'projectile',
    palette: { outline: '#831843', outer: '#ec4899', mid: '#f9a8d4', core: '#ffffff' },
  },
  FAIRY: {
    archetype: 'projectile',
    palette: { outline: '#831843', outer: '#ec4899', mid: '#f9a8d4', core: '#ffffff' },
  },
  NORMAL: {
    archetype: 'slash',
    palette: { outline: '#3f3f46', outer: '#71717a', mid: '#d4d4d8', core: '#ffffff' },
  },
};

function normalizeType(rawType) {
  if (!rawType) return 'NORMAL';
  return String(rawType)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function injectStylesOnce() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pixel-battle-fx-styles')) return;

  const style = document.createElement('style');
  style.id = 'pixel-battle-fx-styles';
  style.textContent = `
    @keyframes pbfx-lunge {
      0%   { transform: translateX(0) scale(1, 1); }
      20%  { transform: translateX(calc(var(--pbfx-dir, 1) * -7px)) scale(.96, .94); }
      65%  { transform: translateX(calc(var(--pbfx-dir, 1) * 34px)) scale(1.02, 1); }
      100% { transform: translateX(0); }
    }

    @keyframes pbfx-windup {
      0%, 100% { transform: translateX(0) scale(1, 1); }
      30%      { transform: translateX(calc(var(--pbfx-dir, 1) * -7px)) scale(.97, .94); }
      70%      { transform: translateX(calc(var(--pbfx-dir, 1) * -3px)) scale(.99, .97); }
    }

    @keyframes pbfx-recoil {
      0%, 100% { transform: translateX(0); }
      30%      { transform: translateX(calc(var(--pbfx-dir, 1) * -16px)) scale(.98, .97); }
      65%      { transform: translateX(calc(var(--pbfx-dir, 1) * -8px)); }
    }

    @keyframes pbfx-hit-shake {
      0%   { transform: translateX(0); filter: brightness(1.12); }
      20%  { transform: translateX(calc(var(--pbfx-dir, 1) * 8px)); filter: brightness(1.28) saturate(0.9); }
      40%  { transform: translateX(calc(var(--pbfx-dir, 1) * -6px)); filter: brightness(1); }
      60%  { transform: translateX(calc(var(--pbfx-dir, 1) * 4px)); filter: brightness(1.18); }
      80%  { transform: translateX(calc(var(--pbfx-dir, 1) * -2px)); filter: brightness(1); }
      100% { transform: translateX(0); filter: brightness(1); }
    }

    @keyframes pbfx-arena-shake {
      0%, 100% { transform: translate(0, 0); }
      20%      { transform: translate(-4px, 3px); }
      40%      { transform: translate(4px, -3px); }
      60%      { transform: translate(-3px, -2px); }
      80%      { transform: translate(3px, 2px); }
    }

    .pbfx-anim-windup {
      animation: pbfx-windup 0.26s steps(3, end) both;
    }

    .sprite-stage.pbfx-rig-charge,
    .sprite-stage.pbfx-anim-windup,
    .sprite-stage.pbfx-anim-lunge,
    .sprite-stage.pbfx-anim-recoil {
      filter: drop-shadow(0 0 10px var(--pbfx-glow, #ff9500));
    }

    .pbfx-anim-lunge {
      animation: pbfx-lunge 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .pbfx-anim-recoil {
      animation: pbfx-recoil 0.22s steps(3, end);
    }

    .pbfx-anim-hit, .sprite-stage.pbfx-anim-hit {
      animation: pbfx-hit-shake 0.38s steps(2, end);
    }

    @keyframes pbfx-ko {
      0%, 12%, 24%, 36% { opacity: 1; filter: brightness(1); }
      18%, 30%          { opacity: .25; filter: brightness(2.4); }
      100%               { opacity: 0; transform: translateY(48px); filter: brightness(.2); }
    }

    .pbfx-anim-ko {
      animation: pbfx-ko 0.9s steps(6, end) forwards;
    }

    .pbfx-ko-complete {
      opacity: 0;
      transform: translateY(48px);
      pointer-events: none;
    }

    .pbfx-arena-shake {
      animation: pbfx-arena-shake 0.28s steps(2, end);
    }
  `;
  document.head.appendChild(style);
}

class ArticulatedRig {
  constructor(spriteEl, dir = 1) {
    if (!spriteEl || spriteEl.tagName !== 'IMG' || !spriteEl.parentElement) {
      throw new Error('ArticulatedRig: um elemento IMG anexado é obrigatório.');
    }

    this.dir = dir < 0 ? -1 : 1;
    this._animations = new Set();
    this._poseToken = 0;
    this._spriteToken = 0;
    this.onSpriteError = null;
    this.root = document.createElement('div');
    this.root.className = 'articulated-rig';

    this.base = this._createJoint('rig-joint-base');
    this.torso = this._createJoint('rig-joint-torso');
    this.head = this._createJoint('rig-joint-head');
    this.baseImage = spriteEl;
    this.torsoImage = this._createLayer();
    this.headImage = this._createLayer();

    spriteEl.classList.add('rig-layer-image', 'rig-layer-base');
    this.base.appendChild(this.torso);
    this.torso.append(this.torsoImage, this.head);
    this.head.appendChild(this.headImage);
    this.root.appendChild(this.base);
    spriteEl.parentElement.replaceChild(this.root, spriteEl);
    this.base.insertBefore(spriteEl, this.torso);
    this.setSprite(spriteEl.getAttribute('src') || spriteEl.src);
  }

  _createJoint(className) {
    const joint = document.createElement('div');
    joint.className = className;
    return joint;
  }

  _createLayer() {
    const image = document.createElement('img');
    image.className = 'sprite-image rig-layer-image';
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.draggable = false;
    return image;
  }

  _cancelAnimations() {
    for (const animation of this._animations) animation.cancel();
    this._animations.clear();
  }

  _animate(element, keyframes, options) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = element.animate(keyframes, {
      fill: 'forwards',
      ...options,
      duration: reducedMotion ? Math.min(options.duration, 45) : options.duration,
    });
    animation.finished.catch(() => {});
    this._animations.add(animation);
    return animation;
  }

  async _playPose(poses, options) {
    const token = ++this._poseToken;
    this._cancelAnimations();
    const animations = poses.map(({ element, keyframes, delay = 0 }) =>
      this._animate(element, keyframes, { ...options, delay })
    );
    await Promise.all(animations.map((animation) => animation.finished.catch(() => {})));
    return token === this._poseToken;
  }

  setSprite(src) {
    if (!src) throw new Error('ArticulatedRig.setSprite: src é obrigatório.');
    this._poseToken++;
    this._cancelAnimations();
    this.root.style.removeProperty('opacity');
    this.root.style.removeProperty('transform');
    const token = ++this._spriteToken;
    [this.baseImage, this.torsoImage, this.headImage].forEach((image) => {
      image.onerror = () => {
        if (token === this._spriteToken) this.onSpriteError?.(src);
      };
      image.src = src;
    });
  }

  startIdle() {
    this._poseToken++;
    this._cancelAnimations();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const easing = 'cubic-bezier(.45, 0, .55, 1)';
    [
      [this.base, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.97)' }], 1500, 0],
      [this.torso, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${2 * this.dir}deg)` }], 2200, 110],
      [this.head, [{ transform: 'rotate(0deg) scaleX(1)' }, { transform: `rotate(${-3 * this.dir}deg) scaleX(1.03)` }], 2200, 230],
    ].forEach(([element, keyframes, duration, delay]) => {
      this._animate(element, keyframes, {
        duration,
        delay,
        direction: 'alternate',
        easing,
        iterations: Infinity,
        fill: 'both',
      });
    });
  }

  async playWindup() {
    const dir = this.dir;
    return this._playPose([
      { element: this.base, keyframes: [
        { transform: 'translateX(0) scaleX(1) scaleY(1)' },
        { transform: `translateX(${-4 * dir}px) scaleX(1.06) scaleY(.9)` },
      ] },
      { element: this.torso, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${-14 * dir}deg)` },
      ] },
      { element: this.head, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${-10 * dir}deg)` },
      ] },
    ], { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' });
  }

  async playStrike(archetype) {
    const dir = this.dir;
    const windupBase = `translateX(${-4 * dir}px) scaleX(1.06) scaleY(.9)`;
    const windupTorso = `rotate(${-14 * dir}deg)`;
    const windupHead = `rotate(${-10 * dir}deg)`;

    if (archetype === 'slash') {
      return this._playPose([
        { element: this.base, keyframes: [
          { transform: windupBase },
          { transform: `translateX(${45 * dir}px) scaleX(1) scaleY(1.02)` },
          { transform: `translateX(${38 * dir}px) scaleX(1) scaleY(1)` },
          { transform: 'translateX(0) scaleX(1) scaleY(1)' },
        ] },
        { element: this.torso, keyframes: [
          { transform: windupTorso },
          { transform: `rotate(${24 * dir}deg)` },
          { transform: `rotate(${10 * dir}deg)` },
          { transform: 'rotate(0deg)' },
        ] },
        { element: this.head, keyframes: [
          { transform: windupHead },
          { transform: `rotate(${18 * dir}deg)` },
          { transform: `rotate(${8 * dir}deg)` },
          { transform: 'rotate(0deg)' },
        ] },
      ], { duration: 430, easing: 'cubic-bezier(.18, .75, .2, 1)' });
    }

    return this._playPose([
      { element: this.base, keyframes: [
        { transform: windupBase },
        { transform: `translateX(${-10 * dir}px) scaleX(1.02) scaleY(.96)` },
        { transform: 'translateX(0) scaleX(1) scaleY(1)' },
      ] },
      { element: this.torso, keyframes: [
        { transform: windupTorso },
        { transform: `rotate(${16 * dir}deg)` },
        { transform: `rotate(${-8 * dir}deg)` },
        { transform: 'rotate(0deg)' },
      ] },
      { element: this.head, keyframes: [
        { transform: windupHead },
        { transform: `translateX(${6 * dir}px) rotate(${5 * dir}deg) scaleX(1.08)` },
        { transform: `translateX(${-7 * dir}px) rotate(${-8 * dir}deg) scaleX(.98)` },
        { transform: 'translateX(0) rotate(0deg) scaleX(1)' },
      ] },
    ], { duration: 420, easing: 'cubic-bezier(.2, .8, .2, 1)' });
  }

  async playHit() {
    const dir = this.dir;
    const completed = await this._playPose([
      { element: this.base, keyframes: [
        { transform: 'translateX(0) scaleY(1)' },
        { transform: `translateX(${-12 * dir}px) scaleY(.97)` },
        { transform: `translateX(${-4 * dir}px) scaleY(1)` },
        { transform: 'translateX(0) scaleY(1)' },
      ] },
      { element: this.torso, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${18 * dir}deg)` },
        { transform: `rotate(${-5 * dir}deg)` },
        { transform: 'rotate(0deg)' },
      ] },
      { element: this.head, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${22 * dir}deg)` },
        { transform: `rotate(${-10 * dir}deg)` },
        { transform: 'rotate(0deg)' },
      ] },
    ], { duration: 380, easing: 'cubic-bezier(.2, .75, .3, 1)' });
    if (completed) this.startIdle();
  }

  async playKO() {
    const dir = this.dir;
    await this._playPose([
      { element: this.base, keyframes: [
        { transform: 'translateY(0) scaleY(1)' },
        { transform: 'translateY(16px) scaleY(.82)' },
        { transform: 'translateY(36px) scaleY(.62)' },
      ] },
      { element: this.torso, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${28 * dir}deg)` },
        { transform: `rotate(${45 * dir}deg)` },
      ] },
      { element: this.head, keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: `rotate(${36 * dir}deg)` },
        { transform: `rotate(${58 * dir}deg)` },
      ] },
      { element: this.root, keyframes: [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: .25, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(20px)' },
        { opacity: 0, transform: 'translateY(48px)' },
      ] },
    ], { duration: 900, easing: 'steps(6, end)' });
  }
}

class BattleAnimator {
  /**
   * @param {HTMLElement} arenaEl Elemento container da arena onde ficam os dois Pokémon
   * @param {Object} [options]
   * @param {number} [options.pixelScale=4] Tamanho do bloco de pixel (4 = estilo GBA/DS nítido)
   */
  constructor(arenaEl, options = {}) {
    if (!arenaEl) {
      throw new Error('BattleAnimator: arenaEl é obrigatório.');
    }
    this.arenaEl = arenaEl;
    this.pixelScale = options.pixelScale || 4;
    this.rigs = options.rigs || [];
    this.isPlaying = false;
    this._runId = 0;
    this._activeAttacker = null;
    this._activeTarget = null;
    this._activeKO = null;

    injectStylesOnce();
    this._setupCanvas();
  }

  _setupCanvas() {
    const computedPos = window.getComputedStyle(this.arenaEl).position;
    if (computedPos === 'static') {
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

  _clearTransientEffects() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    [this._activeAttacker, this._activeTarget].forEach((element) => {
      if (!element) return;
      element.classList.remove('pbfx-anim-windup', 'pbfx-anim-lunge', 'pbfx-anim-recoil', 'pbfx-anim-hit', 'pbfx-rig-charge');
      element.style.removeProperty('--pbfx-dir');
      element.style.removeProperty('--pbfx-glow');
    });
    this.arenaEl.classList.remove('pbfx-arena-shake');
    this._activeAttacker = null;
    this._activeTarget = null;
  }

  cancel() {
    this._runId++;
    this.isPlaying = false;
    this._clearTransientEffects();
    if (this._activeKO) this._activeKO.cancel();
    this.rigs.forEach((rig) => rig.startIdle());
  }

  _getRigFor(element) {
    return this.rigs.find((rig) => element === rig.root || element.contains(rig.root) || rig.root.contains(element));
  }

  _getAnchorPoints(attackerEl, targetEl) {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const attRect = attackerEl.getBoundingClientRect();
    const tgtRect = targetEl.getBoundingClientRect();

    const isLeftToRight = attRect.left < tgtRect.left;
    const dir = isLeftToRight ? 1 : -1;

    const startX = (attRect.left + attRect.width * (isLeftToRight ? 0.65 : 0.35)) - arenaRect.left;
    const startY = (attRect.top + attRect.height * 0.42) - arenaRect.top;
    const endX = (tgtRect.left + tgtRect.width * 0.5) - arenaRect.left;
    const endY = (tgtRect.top + tgtRect.height * 0.5) - arenaRect.top;

    return { startX, startY, endX, endY, dir };
  }

  _triggerWindUp(attackerEl, dir, glow) {
    attackerEl.style.setProperty('--pbfx-dir', String(dir));
    attackerEl.style.setProperty('--pbfx-glow', glow);
    attackerEl.classList.remove('pbfx-anim-windup');
    void attackerEl.offsetWidth;
    attackerEl.classList.add('pbfx-anim-windup');
  }

  _triggerLunge(attackerEl, dir) {
    attackerEl.style.setProperty('--pbfx-dir', String(dir));
    attackerEl.classList.remove('pbfx-anim-lunge');
    void attackerEl.offsetWidth;
    attackerEl.classList.add('pbfx-anim-lunge');
  }

  _triggerRecoil(attackerEl, dir) {
    attackerEl.style.setProperty('--pbfx-dir', String(dir));
    attackerEl.classList.remove('pbfx-anim-recoil');
    void attackerEl.offsetWidth;
    attackerEl.classList.add('pbfx-anim-recoil');
  }

  _triggerHitReaction(targetEl, dir, onImpact) {
    targetEl.style.setProperty('--pbfx-dir', String(dir));
    targetEl.classList.remove('pbfx-anim-hit');
    void targetEl.offsetWidth;
    targetEl.classList.add('pbfx-anim-hit');

    this.arenaEl.classList.remove('pbfx-arena-shake');
    void this.arenaEl.offsetWidth;
    this.arenaEl.classList.add('pbfx-arena-shake');

    if (typeof onImpact === 'function') {
      onImpact();
    }
  }

  /**
   * Executa a animação completa de ataque e retorna uma Promise ao terminar.
   *
   * @param {Object} params
   * @param {HTMLElement} params.attackerEl Contêiner visual do Pokémon atacante
   * @param {HTMLElement} params.targetEl Contêiner visual do Pokémon defensor
   * @param {string} [params.moveType='FOGO'] Tipo do golpe (ex: 'FOGO', 'ÁGUA', 'VOADOR', 'ELÉTRICO')
   * @param {'beam'|'slash'|'bolt'|'projectile'} [params.archetype] Sobrescreve estilo visual se desejado
   * @param {'physical'|'special'|'status'} [params.moveCategory] Categoria do golpe
   * @param {Function} [params.onImpact] Callback executado no exato frame em que o golpe acerta (reduzir HP aqui)
   */
  async playAttack({ attackerEl, targetEl, moveType = 'FOGO', archetype, moveCategory, onImpact }) {
    if (!attackerEl || !targetEl) return;

    this.cancel();
    const runId = this._runId;
    const isCurrent = () => runId === this._runId;
    this.resize();
    attackerEl.classList.remove('entering');
    targetEl.classList.remove('entering');
    this.isPlaying = true;
    this._activeAttacker = attackerEl;
    this._activeTarget = targetEl;
    const attackerRig = this._getRigFor(attackerEl);
    const targetRig = this._getRigFor(targetEl);

    const normalized = normalizeType(moveType);
    const config = TYPE_CONFIGS[normalized] || TYPE_CONFIGS.NORMAL;
    const configuredType = archetype || config.archetype;
    const effectType = moveCategory === 'physical'
      ? 'slash'
      : moveCategory === 'special' && configuredType === 'slash'
        ? 'projectile'
        : configuredType;
    const palette = config.palette;

    const { startX, startY, endX, endY, dir } = this._getAnchorPoints(attackerEl, targetEl);

    let targetMotion = Promise.resolve();
    let strikeMotion = Promise.resolve();
    try {
      if (attackerEl !== targetEl) {
        if (attackerRig) {
          attackerEl.style.setProperty('--pbfx-glow', palette.outer);
          attackerEl.classList.add('pbfx-rig-charge');
          await attackerRig.playWindup();
        } else {
          this._triggerWindUp(attackerEl, dir, palette.outer);
          await new Promise((resolve) => setTimeout(resolve, 260));
        }
        if (!isCurrent()) return;
        attackerEl.classList.remove('pbfx-anim-windup', 'pbfx-rig-charge');
        if (attackerRig) {
          strikeMotion = attackerRig.playStrike(effectType);
          if (effectType === 'slash') await new Promise((resolve) => setTimeout(resolve, 110));
        } else if (effectType === 'slash') {
          this._triggerLunge(attackerEl, dir);
          await new Promise((resolve) => setTimeout(resolve, 110));
        } else {
          this._triggerRecoil(attackerEl, dir);
        }
      }
      if (!isCurrent()) return;

      const handleImpact = () => {
        if (isCurrent() && typeof onImpact === 'function') {
          if (targetRig) targetMotion = targetRig.playHit();
          this._triggerHitReaction(targetEl, dir, onImpact);
        }
      };

      let effectMotion;
      if (effectType === 'bolt') {
        effectMotion = this._renderBolt(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      } else if (effectType === 'slash') {
        effectMotion = this._renderSlash(endX, endY, dir, palette, handleImpact, isCurrent);
      } else if (effectType === 'projectile') {
        effectMotion = this._renderProjectile(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      } else {
        effectMotion = this._renderBeam(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      }
      await Promise.all([effectMotion, strikeMotion]);
      await targetMotion;
    } finally {
      if (isCurrent()) {
        this._clearTransientEffects();
        this.isPlaying = false;
        if (attackerRig) attackerRig.startIdle();
      }
    }
  }

  async playKO(targetEl) {
    if (!targetEl) return;
    this.cancel();
    const targetRig = this._getRigFor(targetEl);
    if (targetRig) {
      await targetRig.playKO();
      return;
    }
    targetEl.classList.remove('pbfx-ko-complete', 'pbfx-anim-ko', 'entering', 'victorious');
    void targetEl.offsetWidth;

    await new Promise((resolve) => {
      let timer;
      let finished = false;
      const finish = (completed) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        targetEl.removeEventListener('animationend', onAnimationEnd);
        targetEl.classList.remove('pbfx-anim-ko');
        if (completed) targetEl.classList.add('pbfx-ko-complete');
        else targetEl.classList.remove('pbfx-ko-complete');
        if (this._activeKO?.targetEl === targetEl) this._activeKO = null;
        resolve();
      };
      const onAnimationEnd = (event) => {
        if (event.target === targetEl && event.animationName === 'pbfx-ko') finish(true);
      };

      this._activeKO = { targetEl, cancel: () => finish(false) };
      targetEl.addEventListener('animationend', onAnimationEnd);
      targetEl.classList.add('pbfx-anim-ko');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      timer = setTimeout(() => finish(true), reducedMotion ? 150 : 1050);
    });
  }

  // 1. FEIXE CONTÍNUO EM 4 CAMADAS (Lança-chamas, Hidro Bomba, Raio Solar, Hiper Raio)
  _renderBeam(startX, startY, endX, endY, palette, onImpact, isCurrent) {
    return new Promise((resolve) => {
      const ctx = this.ctx;
      const scale = this.pixelScale;
      const sx = startX / scale;
      const sy = startY / scale;
      const ex = endX / scale;
      const ey = endY / scale;

      const angle = Math.atan2(ey - sy, ex - sx);
      const dist = Math.hypot(ex - sx, ey - sy);
      const blobs = [];
      const sparks = [];

      const duration = 900;
      const startTime = performance.now();
      let impacted = false;

      const layers = [
        { color: palette.outline, scale: 1.38, minLife: 0.05 },
        { color: palette.outer, scale: 1.12, minLife: 0.15 },
        { color: palette.mid, scale: 0.84, minLife: 0.30 },
        { color: palette.core, scale: 0.48, minLife: 0.50 },
      ];

      const frame = (now) => {
        if (!isCurrent()) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (progress < 0.62) {
          for (let i = 0; i < 4; i++) {
            const speed = Math.max(2.5, dist / 20) * (0.9 + Math.random() * 0.25);
            const spread = (Math.random() - 0.5) * 0.13;
            blobs.push({
              x: sx,
              y: sy,
              vx: Math.cos(angle + spread) * speed,
              vy: Math.sin(angle + spread) * speed,
              r: 3 + Math.random() * 2,
              grow: 0.36,
              life: 1,
              decay: 0.036 + Math.random() * 0.015,
            });
          }
        }

        for (let i = blobs.length - 1; i >= 0; i--) {
          const b = blobs[i];
          b.x += b.vx;
          b.y += b.vy;
          b.r += b.grow;
          b.life -= b.decay;

          if (!impacted && Math.hypot(b.x - sx, b.y - sy) >= dist * 0.85) {
            impacted = true;
            onImpact();
            if (!isCurrent()) {
              ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
              resolve();
              return;
            }

            for (let k = 0; k < 20; k++) {
              const a = Math.random() * Math.PI * 2;
              const sp = 0.6 + Math.random() * 2.6;
              blobs.push({
                x: ex + (Math.random() - 0.5) * 10,
                y: ey + (Math.random() - 0.5) * 10,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                r: 5 + Math.random() * 6,
                grow: 0.14,
                life: 1,
                decay: 0.042,
              });
              sparks.push({
                x: ex,
                y: ey,
                vx: Math.cos(a) * (sp * 2.3),
                vy: Math.sin(a) * (sp * 2.3),
                life: 1,
              });
            }
          }

          if (b.life <= 0) blobs.splice(i, 1);
        }

        for (const layer of layers) {
          ctx.fillStyle = layer.color;
          for (const b of blobs) {
            if (b.life < layer.minLife) continue;
            ctx.beginPath();
            ctx.arc(
              Math.round(b.x),
              Math.round(b.y),
              Math.max(1, Math.round(b.r * layer.scale)),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        ctx.fillStyle = palette.mid;
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.045;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
          if (s.life <= 0) sparks.splice(i, 1);
        }

        if (progress < 1 || blobs.length > 0) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(frame);
    });
  }

  // 2. RELÂMPAGO PIXELADO (Choque do Trovão, Trovão)
  _renderBolt(startX, startY, endX, endY, palette, onImpact, isCurrent) {
    return new Promise((resolve) => {
      const ctx = this.ctx;
      const scale = this.pixelScale;
      const ex = Math.round(endX / scale);
      const ey = Math.round(endY / scale);
      const topY = 0;

      const duration = 520;
      const startTime = performance.now();
      let impacted = false;

      const buildZigZag = () => {
        const pts = [{ x: ex + Math.round((Math.random() - 0.5) * 8), y: topY }];
        const segments = 9;
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          pts.push({
            x: Math.round(ex + (Math.random() - 0.5) * 18),
            y: Math.round(topY + (ey - topY) * t),
          });
        }
        pts.push({ x: ex, y: ey });
        return pts;
      };

      let boltPoints = buildZigZag();
      let frameCount = 0;

      const drawStroke = (pts, width, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      };

      const frame = (now) => {
        if (!isCurrent()) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (!impacted && progress >= 0.15) {
          impacted = true;
          onImpact();
          if (!isCurrent()) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve();
            return;
          }
        }

        if (progress < 0.75) {
          if (frameCount % 3 === 0) {
            boltPoints = buildZigZag();
          }
          drawStroke(boltPoints, 5, palette.outline);
          drawStroke(boltPoints, 3, palette.outer);
          drawStroke(boltPoints, 1, palette.core);

          // Esfera elétrica no impacto
          const pulse = 6 + Math.sin(frameCount * 0.9) * 3;
          ctx.fillStyle = palette.outer;
          ctx.beginPath();
          ctx.arc(ex, ey, Math.round(pulse * 1.3), 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = palette.core;
          ctx.beginPath();
          ctx.arc(ex, ey, Math.round(pulse * 0.7), 0, Math.PI * 2);
          ctx.fill();
        }

        frameCount++;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(frame);
    });
  }

  // 3. CORTES E GARRAS FÍSICAS (Garra de Dragão, Corte Aéreo, Talho Noturno)
  _renderSlash(endX, endY, dir, palette, onImpact, isCurrent) {
    return new Promise((resolve) => {
      const ctx = this.ctx;
      const scale = this.pixelScale;
      const ex = Math.round(endX / scale);
      const ey = Math.round(endY / scale);

      const duration = 420;
      const startTime = performance.now();
      let impacted = false;

      const slashes = [
        { ox: -14 * dir, oy: -14, dx: 28 * dir, dy: 28 },
        { ox: -6 * dir, oy: -18, dx: 28 * dir, dy: 28 },
        { ox: -22 * dir, oy: -10, dx: 28 * dir, dy: 28 },
      ];

      const frame = (now) => {
        if (!isCurrent()) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (!impacted && progress >= 0.2) {
          impacted = true;
          onImpact();
          if (!isCurrent()) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve();
            return;
          }
        }

        const cutProgress = Math.min(progress / 0.55, 1);
        const alpha = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;
        ctx.globalAlpha = alpha;

        // Onda de choque circular
        const ringR = Math.round(4 + progress * 22);
        ctx.strokeStyle = palette.outer;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, ey, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // 3 marcas de garra paralelas
        for (const s of slashes) {
          const x1 = ex + s.ox;
          const y1 = ey + s.oy;
          const x2 = Math.round(x1 + s.dx * cutProgress);
          const y2 = Math.round(y1 + s.dy * cutProgress);

          ctx.strokeStyle = palette.outline;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.strokeStyle = palette.core;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(frame);
    });
  }

  // 4. ORBE / PROJÉTIL DENSO (Bola Sombria, Psíquico, Bomba de Lodo, Pedregulho)
  _renderProjectile(startX, startY, endX, endY, palette, onImpact, isCurrent) {
    return new Promise((resolve) => {
      const ctx = this.ctx;
      const scale = this.pixelScale;
      const sx = startX / scale;
      const sy = startY / scale;
      const ex = endX / scale;
      const ey = endY / scale;

      const trail = [];
      const duration = 680;
      const startTime = performance.now();
      let impacted = false;

      const frame = (now) => {
        if (!isCurrent()) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          resolve();
          return;
        }
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const travel = Math.min(progress / 0.65, 1);
        const ease = travel * travel; // acelera em direção ao alvo
        const cx = sx + (ex - sx) * ease;
        const cy = sy + (ey - sy) * ease - Math.sin(travel * Math.PI) * 8;

        if (travel < 1) {
          trail.push({ x: cx, y: cy, r: 8, life: 1 });
        } else if (!impacted) {
          impacted = true;
          onImpact();
          if (!isCurrent()) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve();
            return;
          }
          for (let i = 0; i < 16; i++) {
            const a = (Math.PI * 2 * i) / 16;
            const sp = 1.2 + Math.random() * 2;
            trail.push({
              x: ex,
              y: ey,
              vx: Math.cos(a) * sp,
              vy: Math.sin(a) * sp,
              r: 6,
              life: 1,
            });
          }
        }

        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          if (p.vx) {
            p.x += p.vx;
            p.y += p.vy;
          }
          p.life -= 0.055;
          if (p.life <= 0) trail.splice(i, 1);
        }

        const layers = [
          { color: palette.outline, mult: 1.35 },
          { color: palette.outer, mult: 1.1 },
          { color: palette.mid, mult: 0.8 },
          { color: palette.core, mult: 0.45 },
        ];

        for (const l of layers) {
          ctx.fillStyle = l.color;
          for (const p of trail) {
            const radius = Math.max(1, Math.round(p.r * p.life * l.mult));
            ctx.beginPath();
            ctx.arc(Math.round(p.x), Math.round(p.y), radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (progress < 1 || trail.length > 0) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(frame);
    });
  }
}

// Compatibilidade global caso o projeto não use ES Modules
if (typeof window !== 'undefined') {
  window.ArticulatedRig = ArticulatedRig;
  window.BattleAnimator = BattleAnimator;
}
