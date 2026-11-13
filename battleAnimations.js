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
      0%   { transform: translateX(0); }
      25%  { transform: translateX(calc(var(--pbfx-dir, 1) * -6px)); }
      55%  { transform: translateX(calc(var(--pbfx-dir, 1) * 20px)); }
      100% { transform: translateX(0); }
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

    .pbfx-anim-lunge, .sprite-stage.pbfx-anim-lunge {
      animation: pbfx-lunge 0.36s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .pbfx-anim-hit, .sprite-stage.pbfx-anim-hit {
      animation: pbfx-hit-shake 0.38s steps(2, end);
    }

    .pbfx-arena-shake {
      animation: pbfx-arena-shake 0.28s steps(2, end);
    }
  `;
  document.head.appendChild(style);
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
    this.isPlaying = false;
    this._runId = 0;
    this._activeAttacker = null;
    this._activeTarget = null;

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
      element.classList.remove('pbfx-anim-lunge', 'pbfx-anim-hit');
      element.style.removeProperty('--pbfx-dir');
    });
    this.arenaEl.classList.remove('pbfx-arena-shake');
    this._activeAttacker = null;
    this._activeTarget = null;
  }

  cancel() {
    this._runId++;
    this.isPlaying = false;
    this._clearTransientEffects();
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

  _triggerLunge(attackerEl, dir) {
    attackerEl.style.setProperty('--pbfx-dir', String(dir));
    attackerEl.classList.remove('pbfx-anim-lunge');
    void attackerEl.offsetWidth; // força reflow para reiniciar animação
    attackerEl.classList.add('pbfx-anim-lunge');
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
   * @param {HTMLElement} params.attackerEl Elemento HTML/IMG do Pokémon atacante
   * @param {HTMLElement} params.targetEl Elemento HTML/IMG do Pokémon defensor
   * @param {string} [params.moveType='FOGO'] Tipo do golpe (ex: 'FOGO', 'ÁGUA', 'VOADOR', 'ELÉTRICO')
   * @param {'beam'|'slash'|'bolt'|'projectile'} [params.archetype] Sobrescreve estilo visual se desejado
   * @param {Function} [params.onImpact] Callback executado no exato frame em que o golpe acerta (reduzir HP aqui)
   */
  async playAttack({ attackerEl, targetEl, moveType = 'FOGO', archetype, onImpact }) {
    if (!attackerEl || !targetEl) return;

    this.cancel();
    const runId = this._runId;
    const isCurrent = () => runId === this._runId;
    this.resize();
    this.isPlaying = true;
    this._activeAttacker = attackerEl;
    this._activeTarget = targetEl;

    const normalized = normalizeType(moveType);
    const config = TYPE_CONFIGS[normalized] || TYPE_CONFIGS.NORMAL;
    const effectType = archetype || config.archetype;
    const palette = config.palette;

    const { startX, startY, endX, endY, dir } = this._getAnchorPoints(attackerEl, targetEl);

    try {
      if (attackerEl !== targetEl) this._triggerLunge(attackerEl, dir);
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (!isCurrent()) return;

      const handleImpact = () => {
        if (isCurrent() && typeof onImpact === 'function') {
          this._triggerHitReaction(targetEl, dir, onImpact);
        }
      };

      if (effectType === 'bolt') {
        await this._renderBolt(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      } else if (effectType === 'slash') {
        await this._renderSlash(endX, endY, dir, palette, handleImpact, isCurrent);
      } else if (effectType === 'projectile') {
        await this._renderProjectile(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      } else {
        await this._renderBeam(startX, startY, endX, endY, palette, handleImpact, isCurrent);
      }
    } finally {
      if (isCurrent()) {
        this._clearTransientEffects();
        this.isPlaying = false;
      }
    }
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
  window.BattleAnimator = BattleAnimator;
}
