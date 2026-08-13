import ScrollReveal from './ScrollReveal';
import styles from './Section4.module.css';

type Feature = {
  icon: string;
  title: string;
  body: string;
  tag?: string;
  featured?: boolean;
};

/* Ícones trocados dos 3D (FolderIcon3D/GlobeIcon3D) e dos iconify duotone
   pra imagens estáticas coloridas — pedido explícito do usuário. Os
   componentes 3D continuam no repo (não usados aqui), caso voltem a fazer
   sentido em outro lugar. */
const FEATURES: Feature[] = [
  {
    icon: '/images/icon-folder.png',
    title: 'Swipe file de funis validados',
    body: 'Biblioteca de funis testados com tráfego pago real. Filtre por nicho, ticket e mercado. Você começa do ponto que outros levaram meses pra chegar.',
    tag: 'Explorar',
    featured: true,
  },
  {
    icon: '/images/icon-globo-terra.png',
    title: 'Tradução com conversão preservada',
    body: 'PT-BR, espanhol e inglês sem quebrar os gatilhos que fazem a oferta vender.',
  },
  {
    icon: '/images/icon-ponteiro.png',
    title: 'Clone com 1 clique',
    body: 'Funil completo, domínio e hospedagem prontos na sua conta.',
  },
  {
    icon: '/images/icon-ia.png',
    title: 'IA que traduz adaptando a copy',
    body: 'Nada de tradução literal. A IA reescreve a copy do funil pro novo idioma mantendo os gatilhos, o ritmo e a persuasão que fazem a oferta vender.',
  },
];

/* Reveal por scroll agora vem do ScrollReveal (IntersectionObserver, sem
   GSAP) — antes esta section tinha sua própria animação via
   ScrollTrigger fazendo exatamente a mesma coisa (fade+slide no header e
   nos cards). Consolidado num componente reutilizável só. */
export default function Section4() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <ScrollReveal direction="up" delay={0}>
          <h2 className={styles.headline}>
            <span>Tudo que você precisa pra</span>
            <span>clonar, traduzir e escalar</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={150}>
          <p className={styles.subheadline}>
            Pare de criar funil do zero. Comece do que já provou que converte.
          </p>
        </ScrollReveal>
      </div>

      <div className={styles.grid}>
        {FEATURES.map((f, i) => (
          /* cardFeaturedSpan (grid-column:1/-1) precisa estar aqui, na
             div que o ScrollReveal renderiza — ela é o item de grid de
             verdade; o <article> lá dentro não é filho direto do grid. */
          <ScrollReveal
            key={f.title}
            direction="up"
            delay={i * 150}
            className={f.featured ? styles.cardFeaturedSpan : undefined}
          >
            {/* height:100% ("h-full") — o item do grid (este ScrollReveal)
                estica pra altura da linha por padrão (grid stretch), o
                card por dentro precisa preencher isso de volta. */}
            <article
              className={`${styles.card} ${f.featured ? styles.cardFeatured : ''}`}
              style={{ height: '100%' }}
            >
              <img
                src={f.icon}
                alt=""
                aria-hidden="true"
                className={`${styles.icon} ${styles.iconAnimated}`}
                style={{ animationDelay: `${i * -0.8}s` }}
                width={f.featured ? 40 : 28}
                height={f.featured ? 40 : 28}
                loading="lazy"
              />
              {/* Agrupa título+corpo — no card featured (desktop, flex-row)
                  título e corpo são irmãos DIRETOS do article e brigavam
                  por espaço horizontal como itens de flex separados,
                  encolhendo os dois numa coluna estreita. Com esse wrapper
                  só ele vira item do flex-row (flex:1) e título/corpo
                  empilham normalmente por dentro. */}
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardBody}>{f.body}</p>
              </div>
              {f.tag ? <span className={styles.cardTag}>{f.tag}</span> : null}
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
