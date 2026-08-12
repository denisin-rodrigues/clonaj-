'use client';

import { useEffect, useRef } from 'react';
import styles from './AmbientStars.module.css';

/* Campo de estrelinhas ambiente — pontinhos de luz subindo devagar e
   piscando (twinkle), atrás do conteúdo da section. Referência visual que
   o usuário mandou (hero de outro site, fundo escuro com pontinhos de luz
   "passando em movimento" atrás do logo) — a marca/cor da referência não
   importa, só a técnica: canvas com poucas dezenas de partículas leves,
   nada de física de gravidade/vento (não é confete, é campo de estrelas
   ambiente, então só sobe devagar + pulsa brilho).

   Canvas em vez de 40+ divs: menos custo de layout/paint pra essa
   quantidade de partículas (ver skill ambient-section-particles). */

type Star = {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  driftSpeed: number; // px/s, subindo
  twinkleSpeed: number; // rad/s
  twinklePhase: number;
  hue: 'white' | 'blue';
};

const COUNT_PER_AREA = 1 / 9000; // ~1 estrela a cada 9000px² de canvas
const COUNT_MIN = 22;
const COUNT_MAX = 60;
const MAX_DPR = 2;

type AmbientStarsProps = {
  /** 'mixed' (padrão, maioria branca + um pouco de azul) ou 'blue' (todas azuis). */
  hue?: 'mixed' | 'blue';
  /** Se true, todas nascem perto da base e sobem pra dentro da section —
      em vez de já espalhadas por toda altura desde o primeiro frame. */
  spawnFromBottom?: boolean;
  /** Se true, a camada de estrelas fica ACIMA do resto do conteúdo da
      section (inline z-index, sobrepõe o z-index:1 do .header/.grid) —
      pedido pontual pra elas passarem por cima do vídeo da logo. Default
      false: fica atrás de tudo (ver .host no CSS module). */
  onTop?: boolean;
};

export default function AmbientStars({
  hue = 'mixed',
  spawnFromBottom = false,
  onTop = false,
}: AmbientStarsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Sem gate de prefers-reduced-motion aqui de propósito — mesmo caso já
       resolvido no anel da Section7 (ver Section7.module.css): é uma
       animação pequena e contida (não é parallax nem motion de tela
       cheia), e o usuário já bateu nesse exato sintoma antes ("não tem
       movimento") causado pelo SO tratando como reduced-motion. */

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    const makeStar = (w: number, h: number): Star => ({
      x: Math.random() * w,
      // spawnFromBottom: nasce logo abaixo/na borda de baixo (h a h*1.3),
      // pra já entrar em cena subindo — em vez de espalhada aleatoriamente
      // por toda altura desde o primeiro frame.
      y: spawnFromBottom ? h + Math.random() * h * 0.3 : Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      baseAlpha: 0.18 + Math.random() * 0.5,
      // 3–10px/s original lia como "parado" — rápido demais de ignorar,
      // devagar demais de notar. Subida bem mais clara agora.
      driftSpeed: 22 + Math.random() * 38,
      twinkleSpeed: 0.6 + Math.random() * 1.4,
      twinklePhase: Math.random() * Math.PI * 2,
      hue: hue === 'blue' || Math.random() >= 0.72 ? 'blue' : 'white',
    });

    const seedStars = (w: number, h: number) => {
      const count = Math.round(
        Math.min(COUNT_MAX, Math.max(COUNT_MIN, w * h * COUNT_PER_AREA)),
      );
      stars = Array.from({ length: count }, () => makeStar(w, h));
    };

    let rafId: number | null = null;
    let lastT = 0;

    const frame = (t: number) => {
      const dtMs = Math.min(t - lastT, 80); // clampa saltos (aba em bg, resize, etc.)
      lastT = t;
      const dt = dtMs / 1000;

      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.y -= s.driftSpeed * dt;
        if (s.y < -6) {
          s.y = height + 6;
          s.x = Math.random() * width;
        }
        const twinkle = 0.5 + 0.5 * Math.sin(t * 0.001 * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * (0.35 + 0.65 * twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        if (s.hue === 'white') {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        } else {
          // Azul mais vívido + halo (shadowBlur) — "mais brilhoso",
          // pedido explícito, em vez do azul apagado de antes.
          ctx.shadowBlur = s.r * 5;
          ctx.shadowColor = `rgba(130,170,255,${Math.min(alpha * 1.4, 0.9)})`;
          ctx.fillStyle = `rgba(150,190,255,${Math.min(alpha * 1.3, 1)})`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(frame);
    };

    const play = () => {
      if (rafId !== null) return;
      lastT = performance.now();
      rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      width = box?.width || host.clientWidth || 0;
      height = box?.height || host.clientHeight || 0;
      if (width <= 0 || height <= 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars(width, height);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(host);

    const handleVisibility = () => {
      if (document.hidden) stop();
      else play();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      ro.disconnect();
      io?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={styles.host}
      style={onTop ? { zIndex: 2 } : undefined}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
