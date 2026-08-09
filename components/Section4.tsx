'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Section4.module.css';

gsap.registerPlugin(ScrollTrigger);

const ICON = (name: string) =>
  `https://api.iconify.design/${name}.svg?color=%23ffffff`;

type Feature = {
  icon: string;
  title: string;
  body: string;
  tag?: string;
  featured?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: 'solar:folder-with-files-bold-duotone',
    title: 'Swipe file de funis validados',
    body: 'Biblioteca de funis testados com tráfego pago real. Filtre por nicho, ticket e mercado. Você começa do ponto que outros levaram meses pra chegar.',
    tag: 'Explorar',
    featured: true,
  },
  {
    icon: 'solar:global-bold-duotone',
    title: 'Tradução com conversão preservada',
    body: 'PT-BR, espanhol e inglês sem quebrar os gatilhos que fazem a oferta vender.',
  },
  {
    icon: 'solar:copy-bold-duotone',
    title: 'Clone com 1 clique',
    body: 'Funil completo, domínio e hospedagem prontos na sua conta.',
  },
  {
    icon: 'solar:magic-stick-3-bold-duotone',
    title: 'IA que traduz adaptando a copy',
    body: 'Nada de tradução literal. A IA reescreve a copy do funil pro novo idioma mantendo os gatilhos, o ritmo e a persuasão que fazem a oferta vender.',
  },
];

export default function Section4() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll(`.${styles.card}`);
      const header = sectionRef.current?.querySelectorAll(`.${styles.headerReveal}`);
      if (header?.length) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          },
        );
      }
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <h2 className={`${styles.headline} ${styles.headerReveal}`}>
          <span>Tudo que você precisa pra</span>
          <span>clonar, traduzir e escalar</span>
        </h2>
        <p className={`${styles.subheadline} ${styles.headerReveal}`}>
          Pare de criar funil do zero. Comece do que já provou que converte.
        </p>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={`${styles.card} ${f.featured ? styles.cardFeatured : ''}`}
          >
            <img
              src={ICON(f.icon)}
              alt=""
              aria-hidden="true"
              className={styles.icon}
              width={28}
              height={28}
              loading="lazy"
            />
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardBody}>{f.body}</p>
            {f.tag ? <span className={styles.cardTag}>{f.tag}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
