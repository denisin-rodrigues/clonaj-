import { ShinyButton } from '@/components/ui/shiny-button';
import styles from './Section7.module.css';

export default function Section7() {
  return (
    <section className={styles.section}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
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
    </section>
  );
}
