'use client';

import { useEffect, useRef } from 'react';
import styles from './InteractiveRobot.module.css';

/* ---------------------------------------------------------------------------
 * Dados reais da sequência, medidos diretamente em /frames:
 *
 *   120 arquivos  ·  ezgif-frame-001.jpg .. ezgif-frame-120.jpg  ·  JPG
 *   todos 1920x1080, numeração contígua, sem buracos
 *
 * O robô ocupa apenas x [0.30 .. 0.70] e y [0.126 .. 1.0] do quadro — os
 * outros ~60% da largura são preto puro. SAFE_BOX é essa região útil com uma
 * margem de folga: em vez de fazer "contain" do quadro inteiro (o que jogaria
 * metade da tela fora em padding invisível), fazemos contain DA SAFE BOX e
 * desenhamos a imagem completa em volta. O preto que sobra transborda para
 * fora da viewport e se funde com o fundo da página.
 * ------------------------------------------------------------------------ */

const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;

const SAFE_BOX = { x: 0.27, y: 0.06, w: 0.46, h: 0.94 } as const;

/** Quantos frames podem ser baixados em paralelo. */
const LOAD_CONCURRENCY = 8;

/** Deslocamento em px antes de decidir se um gesto de toque é horizontal. */
const AXIS_LOCK_PX = 8;

/** Um swipe da largura total da hero percorre este múltiplo da sequência. */
const TOUCH_GAIN = 1.15;

/** Acima do DPR 2 o custo de preenchimento cresce sem ganho visível aqui. */
const MAX_DPR = 2;

/**
 * O fundo dos frames não é preto absoluto — o gradiente do render chega às
 * bordas com luminância ~4/255 e sobe para ~16 perto do robô. Enquanto a
 * imagem sangra para fora da viewport isso não aparece, mas com zoom menor o
 * quadro cabe inteiro na tela e o retângulo fica visível como uma caixa mais
 * clara sobre o preto da página — exatamente o "card" que não pode existir.
 *
 * Estas faixas dissolvem as bordas do quadro em preto puro. Larguras em
 * fração do tamanho desenhado, mantidas bem longe do robô, que ocupa
 * x [0.30, 0.70] e começa em y 0.126.
 */
const EDGE_FADE_X = 0.18;
const EDGE_FADE_Y = 0.11;

/**
 * A base tem faixa própria e mais curta: ali ela não esconde uma borda de
 * fundo, ela dissolve o próprio robô, que vem cortado na borda inferior do
 * frame. É o que permite centralizar verticalmente sem que o corte pareça
 * uma fatia — as pernas somem na sombra em vez de terminarem numa linha reta.
 */
const EDGE_FADE_BOTTOM = 0.22;

/**
 * Número de paradas usadas para desenhar as faixas com uma curva suave.
 *
 * Um gradiente de duas paradas cai com inclinação constante e trava de vez
 * ao chegar em zero. Essa quebra de derivada é justamente o que o olho
 * detecta (bandas de Mach): não se enxerga a borda da imagem, enxerga-se a
 * borda do fade. A curva smoothstep abaixo chega nas duas pontas com
 * derivada zero, e aí a transição perde começo e fim visíveis.
 */
const FADE_STOPS = 10;

const defaultFrameSrc = (index: number) =>
  `/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/**
 * Ordem de carregamento: primeiro o frame de repouso, depois os vizinhos
 * imediatos, abrindo em leque para os dois lados. Assim a hero fica utilizável
 * no instante em que o primeiro arquivo chega, em vez de esperar os 120.
 */
function buildLoadOrder(total: number, from: number): number[] {
  const order = [from];
  const reach = Math.max(from, total - 1 - from);
  for (let d = 1; d <= reach; d++) {
    if (from - d >= 0) order.push(from - d);
    if (from + d < total) order.push(from + d);
  }
  return order;
}

/**
 * Converte a posição horizontal normalizada do pointer no índice de frame
 * desejado.  `nx` vai de 0 (borda esquerda da hero) a 1 (borda direita);
 * o retorno é um float entre `first` e `last` — a interpolação suaviza depois.
 *
 * Hoje o mapeamento é linear, como especificado. É aqui que se molda a
 * *sensação* do controle, e há mais de uma resposta defensável:
 *
 *   · linear          — 1:1 com o cursor, previsível, é o padrão atual
 *   · ease-in-out     — mais resolução no centro, extremos mais "pesados"
 *   · zona morta      — um trecho neutro no centro antes de reagir
 *   · faixa reduzida  — usar só um sub-intervalo monotônico da sequência
 *
 * Ver a nota sobre o arco de movimento no final deste arquivo.
 */
function mapPointerToFrame(nx: number, first: number, last: number): number {
  return first + nx * (last - first);
}

export type InteractiveRobotProps = {
  /** Total de frames disponíveis. Detectado na pasta: 120. */
  totalFrames?: number;
  /** Monta a URL de um frame a partir do índice 0-based. */
  frameSrc?: (index: number) => string;
  /** Fator de interpolação por quadro a 60fps. Faixa útil: 0.07 – 0.15. */
  smoothing?: number;
  /** 0.5 centraliza o robô; 0.58 desloca levemente para a direita. */
  alignX?: number;
  /** 0.5 centraliza na vertical; menor sobe, maior desce. */
  alignY?: number;
  /** Escala do robô na hero. 1 = encosta nas bordas; menor = mais respiro. */
  zoom?: number;
  /** Sub-intervalo da sequência usado pelo cursor. Padrão: tudo. */
  frameRange?: readonly [number, number];
  /** Frame de repouso quando não há interação. Padrão: centro da faixa. */
  restFrame?: number;
  /** Overlay discreto com os números da animação. */
  debug?: boolean;
  className?: string;
};

export default function InteractiveRobot({
  totalFrames = 120,
  frameSrc = defaultFrameSrc,
  smoothing = 0.1,
  alignX = 0.5,
  alignY = 0.5,
  zoom = 0.72,
  frameRange,
  restFrame,
  debug = false,
  className,
}: InteractiveRobotProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debugRef = useRef<HTMLPreElement | null>(null);

  // Extraímos números primitivos do prop de faixa para que o array literal
  // não invalide o efeito a cada render.
  const rangeStart = frameRange ? frameRange[0] : 0;
  const rangeEnd = frameRange ? frameRange[1] : totalFrames - 1;
  const rest = restFrame ?? (rangeStart + rangeEnd) / 2;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    /* -------------------------------------------------------------------
     * Estado da animação — tudo em variáveis locais do efeito.
     * Nada disso passa por setState: um movimento de mouse nunca provoca
     * re-render do React, apenas um drawImage.
     * ----------------------------------------------------------------- */
    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    let loadedCount = 0;
    let failedCount = 0;

    let target = rest;
    let current = rest;
    let pointerNorm = (rest - rangeStart) / (rangeEnd - rangeStart || 1);

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let hostLeft = 0;
    let hostWidth = 1;

    // Enquadramento efetivo. As props são o padrão; se o CSS do host definir
    // --robot-align-x / --robot-align-y / --robot-zoom, esses valores vencem.
    // É o que permite mudar a composição por media query — o robô encosta na
    // direita no desktop e volta ao centro no mobile sem nenhum JS de
    // breakpoint, e o resize já recalcula tudo.
    let effAlignX = alignX;
    let effAlignY = alignY;
    let effZoom = zoom;

    // Geometria do quadro e as faixas de dissolução. Só dependem do tamanho
    // da hero, não do frame atual, então são recalculadas no resize e
    // reaproveitadas em todo desenho.
    let layout = { dx: 0, dy: 0, dw: 0, dh: 0 };
    let bandX = 0;
    let bandY = 0;
    let bandB = 0;
    let fadeLeft: CanvasGradient | null = null;
    let fadeRight: CanvasGradient | null = null;
    let fadeTop: CanvasGradient | null = null;
    let fadeBottom: CanvasGradient | null = null;

    let rafId = 0;
    let running = false;
    let lastT = 0;
    let dirty = true;
    let lastDrawn = -1;
    let painted = false;
    let cancelled = false;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = motionQuery.matches;

    /* ---------------------------- dimensionamento ---------------------- */

    const measure = () => {
      const rect = host.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      hostLeft = rect.left;
      hostWidth = rect.width || 1;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      const estilo = getComputedStyle(host);
      const varNum = (nome: string, padrao: number) => {
        const n = Number.parseFloat(estilo.getPropertyValue(nome));
        return Number.isFinite(n) ? n : padrao;
      };
      effAlignX = varNum('--robot-align-x', alignX);
      effAlignY = varNum('--robot-align-y', alignY);
      effZoom = varNum('--robot-zoom', zoom);

      const bw = Math.max(1, Math.round(cssW * dpr));
      const bh = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      // Redefinir o tamanho do backing store zera o estado do contexto,
      // então a transform e o filtro precisam ser reaplicados sempre.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      computeLayout();
      markDirty();
    };

    // Arrow, não `function`: uma declaração içada faria o TypeScript
    // descartar o estreitamento de `ctx` para não-nulo feito lá em cima.
    // `measure()` só é invocada bem depois, então a ordem não é problema.
    const computeLayout = () => {
      // contain da SAFE BOX, não do quadro inteiro, com um fator de respiro:
      // zoom 1 encosta o robô nas bordas da hero, valores menores abrem
      // espaço negativo em volta sem mudar o enquadramento.
      const scale =
        Math.min(
          cssW / (SAFE_BOX.w * FRAME_WIDTH),
          cssH / (SAFE_BOX.h * FRAME_HEIGHT),
        ) * effZoom;

      const dw = FRAME_WIDTH * scale;
      const dh = FRAME_HEIGHT * scale;
      const dx = cssW * effAlignX - (SAFE_BOX.x + SAFE_BOX.w / 2) * dw;
      const dy = cssH * effAlignY - (SAFE_BOX.y + SAFE_BOX.h / 2) * dh;
      layout = { dx, dy, dw, dh };

      bandX = dw * EDGE_FADE_X;
      bandY = dh * EDGE_FADE_Y;
      bandB = dh * EDGE_FADE_BOTTOM;

      const faixa = (x0: number, y0: number, x1: number, y1: number) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        for (let i = 0; i <= FADE_STOPS; i++) {
          const t = i / FADE_STOPS;
          const alpha = 1 - t * t * (3 - 2 * t); // smoothstep invertido
          g.addColorStop(t, `rgba(0,0,0,${alpha.toFixed(4)})`);
        }
        return g;
      };
      fadeLeft = faixa(dx, 0, dx + bandX, 0);
      fadeRight = faixa(dx + dw, 0, dx + dw - bandX, 0);
      fadeTop = faixa(0, dy, 0, dy + bandY);
      fadeBottom = faixa(0, dy + dh, 0, dy + dh - bandB);
    };

    /* -------------------------------- desenho -------------------------- */

    /** Frame carregado mais próximo do índice pedido, ou -1 se nenhum ainda. */
    const nearestLoaded = (index: number): number => {
      if (images[index]) return index;
      for (let d = 1; d < totalFrames; d++) {
        const lo = index - d;
        const hi = index + d;
        if (lo >= 0 && images[lo]) return lo;
        if (hi < totalFrames && images[hi]) return hi;
      }
      return -1;
    };

    const draw = (frameFloat: number): number => {
      const want = clamp(Math.round(frameFloat), 0, totalFrames - 1);
      const index = nearestLoaded(want);
      if (index < 0) return -1;

      const { dx, dy, dw, dh } = layout;

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(images[index]!, dx, dy, dw, dh);

      // Dissolve as quatro bordas no preto da página: as três primeiras
      // escondem o limite do fundo do render, a de baixo dissolve o próprio
      // corte do robô.
      if (fadeLeft) {
        ctx.fillStyle = fadeLeft;
        ctx.fillRect(dx, dy, bandX, dh);
        ctx.fillStyle = fadeRight!;
        ctx.fillRect(dx + dw - bandX, dy, bandX, dh);
        ctx.fillStyle = fadeTop!;
        ctx.fillRect(dx, dy, dw, bandY);
        ctx.fillStyle = fadeBottom!;
        ctx.fillRect(dx, dy + dh - bandB, dw, bandB);
      }
      return index;
    };

    const writeDebug = () => {
      const el = debugRef.current;
      if (!el) return;
      el.textContent =
        `frames:   ${totalFrames}  (faixa ${rangeStart}–${rangeEnd})\n` +
        `loaded:   ${loadedCount}/${totalFrames}` +
        (failedCount ? `   FALHAS: ${failedCount}` : '') +
        '\n' +
        `target:   ${target.toFixed(2)}\n` +
        `current:  ${current.toFixed(2)}\n` +
        `pointer:  ${pointerNorm.toFixed(2)}\n` +
        `canvas:   ${canvas.width}x${canvas.height} @${dpr}x` +
        (reduced ? '\nreduced-motion: ON (rastreia sem inércia)' : '');
    };

    /* ------------------------------ loop rAF --------------------------- */

    const step = (t: number) => {
      const dt = lastT ? Math.min(t - lastT, 100) : 1000 / 60;
      lastT = t;

      if (reduced) {
        // prefers-reduced-motion mira em movimento involuntário: autoplay,
        // parallax, transições que acontecem sozinhas. Uma resposta 1:1 ao
        // input do próprio usuário não é disso — quem ele controla, ele para.
        // O que precisa sair é a inércia, o trecho que segue se movendo
        // depois que o cursor já parou. Então aqui o frame cola no alvo:
        // nada se move sem input direto, e para no instante em que o
        // cursor para.
        //
        // Para o comportamento estrito (robô imóvel no frame de repouso,
        // ignorando o pointer), troque esta linha por:
        //   current = target = rest;
        current = target;
      } else {
        // Suavização exponencial normalizada pelo tempo decorrido: mantém a
        // mesma inércia percebida em telas de 60, 120 ou 144Hz.
        const alpha = 1 - Math.pow(1 - smoothing, dt / (1000 / 60));
        current += (target - current) * alpha;
        if (Math.abs(target - current) < 0.002) current = target;
      }

      const want = clamp(Math.round(current), 0, totalFrames - 1);
      if (dirty || want !== lastDrawn) {
        const drawn = draw(current);
        if (drawn >= 0) {
          lastDrawn = want;
          if (!painted) {
            painted = true;
            canvas.style.opacity = '1';
          }
        }
        dirty = false;
      }

      if (debug) writeDebug();

      if (current !== target || dirty) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastT = 0;
      }
    };

    function ensureLoop() {
      if (running || cancelled) return;
      running = true;
      lastT = 0;
      rafId = requestAnimationFrame(step);
    }

    function markDirty() {
      dirty = true;
      ensureLoop();
    }

    /* ------------------------------- pointer --------------------------- */

    const drag = {
      active: false,
      id: -1,
      startX: 0,
      startY: 0,
      startFrame: 0,
      locked: false,
      horizontal: false,
    };

    const setTargetFromClientX = (clientX: number) => {
      const nx = clamp((clientX - hostLeft) / hostWidth, 0, 1);
      pointerNorm = nx;
      target = clamp(
        mapPointerToFrame(nx, rangeStart, rangeEnd),
        Math.min(rangeStart, rangeEnd),
        Math.max(rangeStart, rangeEnd),
      );
      ensureLoop();
    };

    const releaseToRest = () => {
      target = rest;
      ensureLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        setTargetFromClientX(e.clientX);
        return;
      }

      if (!drag.active || e.pointerId !== drag.id) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.locked) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        drag.locked = true;
        drag.horizontal = Math.abs(dx) > Math.abs(dy);
        if (!drag.horizontal) {
          // Gesto vertical: soltamos o controle e deixamos a página rolar.
          drag.active = false;
          return;
        }
      }

      const span = rangeEnd - rangeStart;
      const lo = Math.min(rangeStart, rangeEnd);
      const hi = Math.max(rangeStart, rangeEnd);
      target = clamp(
        drag.startFrame + (dx / hostWidth) * span * TOUCH_GAIN,
        lo,
        hi,
      );
      pointerNorm = span ? clamp((target - rangeStart) / span, 0, 1) : 0;
      ensureLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      drag.active = true;
      drag.id = e.pointerId;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.startFrame = current; // continua de onde está, sem salto
      drag.locked = false;
      drag.horizontal = false;
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      if (e.pointerId !== drag.id) return;
      drag.active = false;
      drag.locked = false;
      releaseToRest();
    };

    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      releaseToRest();
    };

    const onMotionPreferenceChange = () => {
      reduced = motionQuery.matches;
      markDirty();
    };

    /* ----------------------------- carregamento ------------------------ */

    const order = buildLoadOrder(totalFrames, clamp(Math.round(rest), 0, totalFrames - 1));
    let queue = 0;

    const loadOne = async (index: number) => {
      const src = frameSrc(index);
      const img = new Image();
      img.decoding = 'async';

      // Os handlers precisam existir antes do src, senão uma resposta vinda
      // do cache pode completar antes de estarmos escutando.
      const settled = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('resposta inválida ou 404'));
      });
      img.src = src;

      try {
        // O portão é o onload, nunca o decode().
        //
        // decode() parece a escolha óbvia — ele promete o bitmap já
        // rasterizado antes do primeiro drawImage. Mas ele é atrelado ao
        // pipeline de renderização: com o documento oculto ou com o
        // compositor ocioso, ele rejeita com EncodingError ou, pior,
        // simplesmente nunca assenta. Como o pool aqui tem largura fixa,
        // bastariam LOAD_CONCURRENCY promessas penduradas para travar o
        // carregamento inteiro de forma permanente.
        //
        // onload sempre assenta e já garante que os bytes chegaram.
        await settled;
        if (img.naturalWidth === 0) throw new Error('imagem vazia');
      } catch (err) {
        if (!cancelled) {
          failedCount++;
          console.error(`[InteractiveRobot] frame ${index} falhou: ${src}`, err);
        }
        return;
      }

      if (cancelled) return;
      images[index] = img;
      loadedCount++;
      markDirty();

      // Dica de pré-rasterização, disparada e esquecida: se o browser
      // colaborar, o primeiro drawImage não paga a decodificação síncrona.
      // Se travar ou rejeitar, ninguém fica esperando.
      if (typeof img.decode === 'function') {
        void img.decode().catch(() => undefined);
      }
    };

    const runWorker = async () => {
      while (!cancelled && queue < order.length) {
        await loadOne(order[queue++]);
      }
    };

    for (let i = 0; i < LOAD_CONCURRENCY; i++) void runWorker();

    /* ------------------------------- ligação --------------------------- */

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(host);
    // O ResizeObserver não dispara quando só o devicePixelRatio muda
    // (arrastar a janela para outro monitor), por isso o listener extra.
    window.addEventListener('resize', measure);

    host.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerdown', onPointerDown, { passive: true });
    host.addEventListener('pointerup', onPointerEnd, { passive: true });
    host.addEventListener('pointercancel', onPointerEnd, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave, { passive: true });
    motionQuery.addEventListener('change', onMotionPreferenceChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointerup', onPointerEnd);
      host.removeEventListener('pointercancel', onPointerEnd);
      host.removeEventListener('pointerleave', onPointerLeave);
      motionQuery.removeEventListener('change', onMotionPreferenceChange);
      // Solta as referências para o GC recuperar os bitmaps decodificados.
      for (let i = 0; i < images.length; i++) images[i] = null;
    };
  }, [
    totalFrames,
    frameSrc,
    smoothing,
    alignX,
    alignY,
    zoom,
    rangeStart,
    rangeEnd,
    rest,
    debug,
  ]);

  return (
    <div ref={hostRef} className={[styles.host, className].filter(Boolean).join(' ')}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.overlay} data-marquee-slot />
      {debug ? <pre ref={debugRef} className={styles.debug} /> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * NOTA SOBRE O ARCO DE MOVIMENTO
 *
 * A sequência não é uma varredura contínua da esquerda para a direita — é uma
 * animação de "olhar em volta" com mais de uma ida e volta. Medindo a
 * diferença de pixels de cada frame contra o frame 1:
 *
 *     frame   1   30   41   70   85  100  114  120
 *     pose  frente  ←  frente frente frente  ←  frente  →
 *
 * ou seja: ~1–8 frontal, pico virado por volta de 30, volta ao frontal em
 * ~41 e ~70–85, novo pico virado em ~100, e o trecho final ~114–120 vira
 * para o outro lado.
 *
 * Consequência prática: com o mapeamento linear sobre os 120 frames, um
 * único movimento do cursor de ponta a ponta faz a cabeça virar, voltar,
 * virar de novo e voltar. Funciona e é fluido, mas lê como "scrub de vídeo",
 * não como "o robô está me seguindo".
 *
 * Para a sensação de rastreamento, vale restringir a `frameRange` a um trecho
 * monotônico. Candidatos medidos: [8, 30], [41, 30], [85, 100], [100, 114].
 * O overlay de debug mostra `current` em tempo real — abrir com debug ligado
 * e varrer o cursor é a forma mais rápida de escolher o trecho definitivo.
 * ------------------------------------------------------------------------ */
