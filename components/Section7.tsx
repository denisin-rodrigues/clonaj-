import { ShinyButton } from '@/components/ui/shiny-button';
import styles from './Section7.module.css';

/* Section7 — CTA final, agora com um "orbit" de integrações no lugar da
   imagem de fundo (portal). O layout replica o padrão de card popularizado
   por bibliotecas como shadcn/tailark (dois anéis concêntricos de ícones
   convergindo pro hub central) — mas com as integrações REAIS do ClonaJá
   (mesma lista da FAQ em Section6), não os logos genéricos de ferramentas
   de dev do componente de referência. Mostrar Gemini/Replit/VSCodium aqui
   seria uma claim de integração falsa. */

type Integration =
  | { label: string; kind: 'icon'; icon: string }
  | { label: string; kind: 'mono'; letter: string; color: string }
  | { label: string; kind: 'image'; src: string };

const OUTER: Integration[] = [
  { label: 'Funil', kind: 'image', src: '/images/funil-icon.png' },
  { label: 'Monetização', kind: 'image', src: '/images/icon-dolar.png' },
  { label: 'Multi-mercado', kind: 'image', src: '/images/icon-globo.png' },
];

const INNER: Integration[] = [
  { label: 'Meta Ads', kind: 'icon', icon: 'logos:meta-icon' },
  { label: 'Espanhol', kind: 'image', src: '/images/icon-espanha.png' },
  { label: 'Inglês', kind: 'image', src: '/images/icon-eua.png' },
];

function IntegrationBadge({ item, slot }: { item: Integration; slot: string }) {
  return (
    <div className={slot}>
      <div className={styles.badge} title={item.label}>
        {item.kind === 'icon' ? (
          <img
            src={`https://api.iconify.design/${item.icon}.svg`}
            alt={item.label}
            width={22}
            height={22}
            loading="lazy"
          />
        ) : item.kind === 'image' ? (
          <img
            src={item.src}
            alt={item.label}
            width={46}
            height={46}
            className={styles.badgeImage}
            loading="lazy"
          />
        ) : (
          <span
            className={styles.mono}
            style={{ background: item.color }}
            aria-hidden="true"
          >
            {item.letter}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Section7() {
  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.orbit} aria-hidden="true">
          <div className={styles.glow1} />
          <div className={styles.glow2} />

          <div className={styles.ringOuter}>
            <IntegrationBadge item={OUTER[0]} slot={styles.posOuterLeft} />
            <IntegrationBadge item={OUTER[1]} slot={styles.posOuterTop} />
            <IntegrationBadge item={OUTER[2]} slot={styles.posOuterRight} />
          </div>

          <div className={styles.ringInner}>
            <IntegrationBadge item={INNER[0]} slot={styles.posInnerTop} />
            <IntegrationBadge item={INNER[1]} slot={styles.posInnerLeft} />
            <IntegrationBadge item={INNER[2]} slot={styles.posInnerRight} />
          </div>

          <div className={styles.hubWrap}>
            <div className={styles.hub}>
              <img src="/images/logo-icon.png" alt="" width={30} height={30} />
            </div>
          </div>
        </div>

        <div className={styles.text}>
          <h2 className={styles.headline}>
            <span>Pare de criar.</span>
            <span>Comece a clonar.</span>
          </h2>
          <p className={styles.subheadline}>
            Um funil validado, em três mercados, no ar hoje.
          </p>

          <ShinyButton>Clonar meu primeiro funil →</ShinyButton>

          <p className={styles.microcopy}>Sem fidelidade · Cancele quando quiser</p>
        </div>
      </div>
    </section>
  );
}
