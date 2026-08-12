'use client';

import { useEffect, useState } from 'react';

/* Degradê de blur progressivo fixo na base da viewport (8 camadas
   empilhadas, cada uma com backdrop-filter + mask-image em faixas que se
   sobrepõem, ficando mais forte perto da borda de baixo). Tudo em style
   inline de propósito: nada de classe CSS que dependa de Tailwind/PostCSS
   processarem `mask-image`/`backdrop-filter` corretamente.

   "use client" por causa do listener de scroll abaixo. Dois problemas
   diferentes de sobreposição, duas soluções diferentes:

   1) Footer: os ícones sociais no fim da página caem dentro da faixa de
      200px do blur — aqui a solução é simplesmente esconder o blur
      inteiro (opacity) enquanto o footer estiver na tela.

   2) CTA da hero (mobile): o botão "Clonar meu primeiro funil" também cai
      nessa faixa, mas esconder o blur inteiro ali não faz sentido (ele
      cobre a largura toda da tela, e o resto da hero — vídeo/starfield —
      não precisa de blur, então sumir com tudo tira um efeito que
      poderia continuar visível). Em vez disso, a faixa ganha um "buraco"
      recortado via clip-path exatamente no retângulo do botão (marcado
      com data-blur-hole, ver ScrollReveal's blurHole prop): o blur
      continua ali, só não é desenhado por cima do botão. */
const BAND_HEIGHT = 200;
const HOLE_PADDING = 10;

const LAYERS: { blur: number; stops: string }[] = [
  { blur: 0.25, stops: 'transparent 0%, black 12.5%, black 25%, transparent 37.5%' },
  { blur: 0.5, stops: 'transparent 12.5%, black 25%, black 37.5%, transparent 50%' },
  { blur: 1, stops: 'transparent 25%, black 37.5%, black 50%, transparent 62.5%' },
  { blur: 2, stops: 'transparent 37.5%, black 50%, black 62.5%, transparent 75%' },
  { blur: 4, stops: 'transparent 50%, black 62.5%, black 75%, transparent 87.5%' },
  { blur: 8, stops: 'transparent 62.5%, black 75%, black 87.5%, transparent 100%' },
  { blur: 16, stops: 'transparent 75%, black 87.5%, black 100%' },
  { blur: 32, stops: 'transparent 87.5%, black 100%' },
];

export default function ProgressiveBlur() {
  const [footerHide, setFooterHide] = useState(false);
  const [holeClip, setHoleClip] = useState<string | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const check = () => {
      rafId = null;
      const viewportH = window.innerHeight;
      const viewportW = window.innerWidth;
      const bandTop = viewportH - BAND_HEIGHT;

      const footer = document.querySelector('footer');
      if (footer) {
        const r = footer.getBoundingClientRect();
        setFooterHide(r.bottom > bandTop && r.top < viewportH);
      }

      const holeEl = document.querySelector('[data-blur-hole]');
      if (holeEl) {
        const r = holeEl.getBoundingClientRect();
        const overlaps =
          r.bottom > bandTop && r.top < viewportH && r.right > 0 && r.left < viewportW && r.width > 0;

        if (overlaps) {
          const left = Math.max(0, r.left - HOLE_PADDING);
          const right = Math.min(viewportW, r.right + HOLE_PADDING);
          const top = Math.max(0, r.top - bandTop - HOLE_PADDING);
          const bottom = Math.min(BAND_HEIGHT, r.bottom - bandTop + HOLE_PADDING);

          setHoleClip(
            `polygon(0px 0px, 0px ${BAND_HEIGHT}px, ${left}px ${BAND_HEIGHT}px, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px ${BAND_HEIGHT}px, ${viewportW}px ${BAND_HEIGHT}px, ${viewportW}px 0px)`,
          );
        } else {
          setHoleClip(null);
        }
      } else {
        setHoleClip(null);
      }
    };

    const onScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(check);
    };

    check(); // estado inicial — página pode já carregar com CTA/footer sobrepondo
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${BAND_HEIGHT}px`,
        zIndex: 999,
        pointerEvents: 'none',
        opacity: footerHide ? 0 : 1,
        transition: 'opacity 300ms ease',
        clipPath: holeClip ?? 'none',
        WebkitClipPath: holeClip ?? 'none',
      }}
    >
      {LAYERS.map((layer, i) => {
        const mask = `linear-gradient(to bottom, ${layer.stops})`;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
}
