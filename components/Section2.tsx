'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Section2.module.css';

gsap.registerPlugin(ScrollTrigger);

/* Ponto do scroll (0–1) em que o painel 1 termina de sumir e o painel 2
   termina de aparecer, e a largura da faixa de transição em torno dele.
   Fora da faixa [SWITCH-FADE/2, SWITCH+FADE/2] cada painel fica 100%
   opaco ou 100% invisível — só dentro dela os dois se misturam. */
const SWITCH = 0.52;
const FADE = 0.16;

/* Os astronautas acompanham só o painel 1 ("Como funciona"). Sobem e
   desaparecem nos primeiros ASTRO_END% do scroll — bem antes do meio da
   troca de painéis (SWITCH=0.52) — pra já estarem fora de cena quando "A
   diferença" assume. RISE_PX é o quanto sobem (em px) até sumirem. */
const ASTRO_END = 0.4;
/* Precisa ser grande o bastante pra empurrar o astronauta pra fora da
   faixa visível da section (que corta com overflow:hidden) — é isso que
   faz ele "sumir" de verdade, sem fade. */
const RISE_PX = 420;

export default function Section2() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  const astro1Ref = useRef<HTMLDivElement>(null);
  const astro2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* ── Troca painel 1 ⇄ painel 2 conforme o progresso do scroll ──────
       Os dois painéis ocupam a mesma célula de grid (ver .panel no CSS)
       e o crossfade é só opacidade — nada de layout mudando de tamanho. */
    const updatePanels = (progress: number) => {
      const half = FADE / 2;
      const localRaw = (progress - (SWITCH - half)) / FADE;
      const local = gsap.utils.clamp(0, 1, localRaw);
      const p1 = panel1Ref.current;
      const p2 = panel2Ref.current;
      if (p1) {
        p1.style.opacity = String(1 - local);
        p1.style.pointerEvents = local > 0.5 ? 'none' : 'auto';
      }
      if (p2) {
        p2.style.opacity = String(local);
        p2.style.pointerEvents = local > 0.5 ? 'auto' : 'none';
      }

      // Astronautas: só sobem com o scroll, sem perder opacidade — o
      // "sumir" acontece de verdade, por clipping (a section tem
      // overflow:hidden), não por fade. Depois que a subida encosta no
      // teto (progress > ASTRO_END), o wrapper para de subir, mas a
      // flutuação contínua (bob) do filho .astronautImg via CSS
      // @keyframes nunca para — é um elemento diferente, sempre animando,
      // então "parado" aqui só quer dizer "parado de subir".
      const astroT = gsap.utils.clamp(0, 1, progress / ASTRO_END);
      const rise = astroT * RISE_PX;
      for (const el of [astro1Ref.current, astro2Ref.current]) {
        if (!el) continue;
        el.style.transform = `translateY(${-rise}px)`;
      }
    };
    updatePanels(0);

    /* ── GSAP ScrollTrigger — pin + troca de painéis via scroll ─────
       Tudo que cria pin/ScrollTrigger mora dentro de um gsap.context()
       escopado a esta section. Isso importa porque o React Strict Mode
       roda o efeito, desmonta e remonta de novo em dev — e um cleanup
       ingênuo (só ScrollTrigger.getAll().forEach(kill), como estava
       antes) corre o risco de matar o pin no meio de uma corrida e deixar
       o pin-spacer com uma altura corrompida (chegamos a ver
       padding-bottom: 27508px e a própria section zerada). ctx.revert()
       desfaz exatamente o que foi criado aqui — pin, pin-spacer, estilos
       inline — de forma atômica, e nunca mexe em ScrollTriggers de outras
       sections (o kill() antigo matava TODOS, inclusive os delas). */
    const gCtx = gsap.context(() => {
      // Torna o conteúdo visível imediatamente (sem atraso de scroll)
      if (contentRef.current) {
        gsap.set(contentRef.current, { opacity: 1, y: 0 });
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=320%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => updatePanels(self.progress),
      });
    }, sectionRef);

    return () => {
      gCtx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Fundo cinematográfico — vídeo do funil, em loop contínuo (igual ao
          vídeo da hero, ver app/page.tsx). pointer-events:none tira
          qualquer chance de interação de clique. */}
      <video
        className={styles.video}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/section2.mp4" type="video/mp4" />
      </video>

      {/* Conteúdo que aparece sobre a section.
          .content continua inset:0 + grid-center (é assim que fica
          centralizado sem usar transform — o GSAP acima já controla
          transform/opacity nesse mesmo elemento via gsap.set, e um
          transform em CSS entraria em conflito com o inline style do
          GSAP). Os dois painéis ocupam a mesma célula de grid — o
          crossfade entre eles é só opacidade, controlado pelo progresso
          do scroll dentro da section pinada. */}
      <div ref={contentRef} className={styles.content}>
        <div ref={panel1Ref} className={styles.panel}>
          {/* Astronautas — filhos do próprio card, ancorados nos seus
              cantos reais (não do viewport): assim eles ficam grudados na
              borda do painel em qualquer largura de tela, do mobile ao
              desktop, sem precisar calcular a posição do card à parte.
              Wrapper externo (ref): sobe/desvanece com o scroll, via JS
              (updatePanels acima). Wrapper interno .astronautImg: flutuação
              contínua por CSS @keyframes. Os dois nunca mexem no mesmo
              transform inline. */}
          <div ref={astro1Ref} className={`${styles.astronaut} ${styles.astronautBL}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/astronaut.webp" alt="" aria-hidden="true" className={styles.astronautImg} />
          </div>
          <div ref={astro2Ref} className={`${styles.astronaut} ${styles.astronautTR}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/astronaut.webp" alt="" aria-hidden="true" className={styles.astronautImg} />
          </div>

          <p className={styles.eyebrow}>Como funciona</p>
          <h2 className={styles.headline}>
            Um clique e o funil é seu. No ar, pronto pra vender.
          </h2>
          <p className={styles.body}>
            Escolhe um funil que já fatura e clica. Pronto, ele cai na sua
            conta com domínio e hospedagem já configurados. Nada de servidor,
            plugin ou gambiarra. Quer vender em outro mercado? Mais um clique e
            o mesmo funil roda em espanhol ou inglês. A parte técnica é
            problema nosso. A venda é sua.
          </p>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepLabel}>Clique 1</span>
              <span className={styles.stepAction}>Clonar</span>
            </div>
            <div className={styles.stepDivider} aria-hidden="true" />
            <div className={styles.step}>
              <span className={styles.stepLabel}>Clique 2</span>
              <span className={styles.stepAction}>Traduzir</span>
            </div>
          </div>
        </div>

        <div ref={panel2Ref} className={`${styles.panel} ${styles.panel2}`}>
          {/* Mesmos cantos/flutuação dos astronautas do painel 1 (classes
              genéricas, não amarradas a "astronaut") — aqui sem subida por
              scroll, porque não há uma segunda janela de progresso definida
              pra isso neste painel: só flutuam paradas nos cantos enquanto
              "A diferença" está em cena. */}
          <div className={`${styles.astronaut} ${styles.astronautBL}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/translate-icon.webp" alt="" aria-hidden="true" className={styles.astronautImg} />
          </div>
          <div className={`${styles.astronaut} ${styles.astronautTR}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/translate-icon.webp" alt="" aria-hidden="true" className={styles.astronautImg} />
          </div>

          <p className={styles.eyebrow}>A diferença</p>
          <h2 className={styles.headline}>
            Traduzir não é trocar palavra.
            <br />
            É manter o que faz vender.
          </h2>
          <p className={styles.body}>
            Tradução literal quebra funil: o gancho perde o tempo, a oferta
            perde o ritmo, o CTA perde a força. O ClonaJá não troca palavra
            por palavra. Ele adapta o funil pro novo idioma mantendo
            estrutura, gatilhos e conversão. O resultado é a mesma oferta
            vendendo no Brasil, na Colômbia ou nos Estados Unidos.
          </p>
        </div>
      </div>
    </section>
  );
}
