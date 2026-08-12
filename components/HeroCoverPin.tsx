'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Transição hero → Section2: a hero fica presa no topo (pin) enquanto a
   Section2 sobe por cima — mas em vez de um "cobrir" estático, os dois
   lados reagem ao progresso do scroll:

   - a hero recua (leve zoom-out) e escurece, como se a câmera se afastasse
     e ela fosse "empurrada pro fundo";
   - a Section2 chega com um zoom-in sutil e cantos arredondados que
     desarredondam e assentam a 1:1 exatamente quando termina de cobrir —
     como uma folha se acomodando por cima, não um recorte que aparece.

   Tudo num ÚNICO ScrollTrigger (pin + onUpdate lendo self.progress), igual
   ao padrão já usado em Section2.tsx — dois ScrollTriggers separados no
   mesmo elemento (um só de pin, outro só de scrub) não se mantinham
   sincronizados direito. */
export default function HeroCoverPin({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gCtx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      /* .hero em si (filho único do wrapper) — nunca aplicar transform no
         PRÓPRIO wrapper, é ele que o GSAP pina (mistura pin + transform no
         mesmo elemento é a receita clássica de bug documentada no projeto). */
      const heroEl = wrapper.firstElementChild as HTMLElement | null;
      const section2El = wrapper.nextElementSibling as HTMLElement | null;

      const HERO_SCALE_END = 0.9;
      const HERO_OPACITY_END = 0.45;
      const S2_SCALE_START = 1.045;
      const S2_RADIUS_START = 48;

      if (heroEl) {
        gsap.set(heroEl, { transformOrigin: '50% 50%', scale: 1, opacity: 1 });
      }
      if (section2El) {
        /* Estado inicial: já "pronta pra assentar" — zoom-in leve e cantos
           arredondados. .section já tem overflow:hidden (Section2.module.css),
           então o border-radius recorta o canvas/conteúdo de verdade. */
        gsap.set(section2El, {
          borderRadius: S2_RADIUS_START,
          scale: S2_SCALE_START,
          transformOrigin: '50% 0%',
        });
      }

      const obj = { p: 0 };
      gsap.to(obj, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: '+=100%',
          scrub: 0.6,
          /* O pulo do gato: pinSpacing:false não reserva espaço extra de
             scroll pro pin. Sem isto, o GSAP empurraria a Section2 pra baixo
             (spacer) pra "esperar" a hero acabar de ficar presa — exatamente
             o oposto do efeito pedido. Com false, a Section2 (próxima irmã
             no fluxo normal) já começa a subir imediatamente, e por vir
             DEPOIS no DOM ela é pintada por cima da hero (presa, embaixo). */
          pin: wrapper,
          pinSpacing: false,
        },
        onUpdate: () => {
          const p = obj.p;
          if (heroEl) {
            gsap.set(heroEl, {
              scale: 1 - (1 - HERO_SCALE_END) * p,
              opacity: 1 - (1 - HERO_OPACITY_END) * p,
            });
          }
          if (section2El) {
            gsap.set(section2El, {
              scale: S2_SCALE_START - (S2_SCALE_START - 1) * p,
              borderRadius: S2_RADIUS_START * (1 - p),
            });
          }
        },
      });
    }, wrapperRef);

    return () => gCtx.revert();
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
