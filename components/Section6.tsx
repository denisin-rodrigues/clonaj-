'use client';

import { useId, useState } from 'react';
import styles from './Section6.module.css';

const FAQ = [
  {
    q: 'O que é um funil validado?',
    a: 'Funil que rodou no mínimo R$5.000 em tráfego pago real e manteve conversão consistente. Não é exemplo teórico — é funil que vendeu.',
  },
  {
    q: 'A tradução perde qualidade?',
    a: 'Não. A adaptação reconstrói o funil no novo idioma mantendo estrutura, gatilhos e conversão. Não é tradução literal.',
  },
  {
    q: 'Preciso ter produto próprio?',
    a: 'Não. Funciona pra produtor e pra afiliado.',
  },
  {
    q: 'Quantos funis posso clonar?',
    a: 'Ilimitados em todos os planos.',
  },
  {
    q: 'Com o que integra?',
    a: 'Kiwify, Hotmart, Monetizze, Stripe, Meta Ads, Utmify, Typebot, ManyChat, VTurb e Lovable.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Imediato, sem multa e sem fidelidade.',
  },
] as const;

const CHEVRON =
  'https://api.iconify.design/solar:alt-arrow-down-bold.svg?color=%23ffffff';

export default function Section6() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className={styles.section}>
      <h2 className={styles.headline}>Perguntas frequentes</h2>

      <div className={styles.list}>
        {FAQ.map((item, i) => {
          const isOpen = openIndex === i;
          const panelId = `${baseId}-panel-${i}`;
          const btnId = `${baseId}-btn-${i}`;
          return (
            <div key={item.q} className={styles.item}>
              <h3 className={styles.itemHeading}>
                <button
                  id={btnId}
                  type="button"
                  className={styles.question}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <img
                    src={CHEVRON}
                    alt=""
                    aria-hidden="true"
                    className={styles.chevron}
                    data-open={isOpen}
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={styles.answerWrap}
                data-open={isOpen}
              >
                <div className={styles.answerInner}>
                  <p className={styles.answer}>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
