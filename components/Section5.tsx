'use client';

import AmbientStars from './AmbientStars';
import ScrollReveal from './ScrollReveal';
import styles from './Section5.module.css';

const CHECK =
  'https://api.iconify.design/solar:check-circle-bold-duotone.svg?color=%236e8cf5';

const PLANS = [
  {
    name: 'Starter',
    blurb: 'Pra quem está começando a clonar e validar ofertas.',
    price: '47',
    features: [
      '3 clones ativos',
      'Hospedagem e domínio interno',
      'Tradução pra inglês e espanhol',
    ],
    cta: 'Assinar Starter',
    href: 'https://pay.growsoft.io/checkout?product=ua8spw',
    featured: false,
  },
  {
    name: 'Premium',
    blurb: 'Pra quem quer escalar com ofertas já validadas.',
    price: '97',
    features: [
      '6 clones ativos',
      'Hospedagem e domínio interno',
      'Tradução pra inglês e espanhol',
      'Swipe file com ofertas escaladas',
    ],
    cta: 'Assinar Premium',
    href: 'https://pay.growsoft.io/checkout?product=ua8spw&plan=2',
    featured: true,
  },
  {
    name: 'Diamond',
    blurb: 'Pra quem opera em volume e quer suporte de perto.',
    price: '147',
    features: [
      'Clones ativos ilimitados',
      'Hospedagem e domínio interno',
      'Tradução pra inglês e espanhol',
      'Swipe file com ofertas escaladas',
      'Suporte prioritário',
    ],
    cta: 'Assinar Diamond',
    href: 'https://pay.growsoft.io/checkout?product=ua8spw&plan=3',
    featured: false,
  },
] as const;

export default function Section5() {
  return (
    <section id="precos" className={styles.section}>
      {/* Campo de estrelinhas ambiente — azuis, por cima do vídeo da logo
          (onTop) pra passarem visivelmente sobre ele em vez de ficar
          escondidas atrás. */}
      <AmbientStars hue="blue" onTop />

      <div className={styles.header}>
        {/* Marca animada — vídeo com fundo preto; mix-blend-mode:screen
            "derrete" o preto no fundo quase-preto da section (ver .section
            acima), sobrando só o brilho do logo. Pequeno de propósito (é
            um selo decorativo acima do título, não um herói). */}
        <video
          className={styles.logoMark}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src="/videos/logo-mark.mp4" type="video/mp4" />
        </video>
        <ScrollReveal direction="up" delay={0}>
          <h2 className={styles.headline}>
            Sem complicação. Sem taxa sobre resultado.
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={150}>
          <p className={styles.subheadline}>
            Assinatura fixa. Clone quantos funis quiser, em qualquer mercado.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={300}>
          <p className={styles.note}>
            Clone ativo = funil publicado e no ar. Arquive e libere a vaga pra
            outro quando quiser.
          </p>
        </ScrollReveal>
      </div>

      <div className={styles.grid}>
        {/* .card/.cardFeatured ficam no elemento interno, não no
            ScrollReveal — .cardFeatured tem seu próprio transform:scale,
            que brigaria com o transform inline do reveal se estivesse no
            mesmo elemento (o style inline sempre vence a classe CSS). */}
        {PLANS.map((plan, i) => (
          <ScrollReveal key={plan.name} direction="up" delay={350 + i * 150} duration={800}>
            <div
              className={`${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
            >
              {plan.featured ? (
                <span className={styles.badge}>Mais popular</span>
              ) : null}

              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planBlurb}>{plan.blurb}</p>

              <p className={styles.price}>
                <span className={styles.priceCurrency}>R$</span>
                {plan.price}
                <span className={styles.pricePeriod}>/mês</span>
              </p>

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f}>
                    <img src={CHECK} alt="" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.cta} ${plan.featured ? styles.ctaFeatured : ''}`}
              >
                {plan.cta}
              </a>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
