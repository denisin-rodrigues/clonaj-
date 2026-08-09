'use client';

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
      <div className={styles.header}>
        <h2 className={styles.headline}>
          Sem complicação. Sem taxa sobre resultado.
        </h2>
        <p className={styles.subheadline}>
          Assinatura fixa. Clone quantos funis quiser, em qualquer mercado.
        </p>
        <p className={styles.note}>
          Clone ativo = funil publicado e no ar. Arquive e libere a vaga pra
          outro quando quiser.
        </p>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
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
        ))}
      </div>
    </section>
  );
}
