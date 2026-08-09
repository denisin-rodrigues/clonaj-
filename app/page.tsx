import InteractiveRobot from '@/components/InteractiveRobot';
import LineBackground from '@/components/LineBackground';
import Section2 from '@/components/Section2';
import Section4 from '@/components/Section4';
import Section5 from '@/components/Section5';
import Section6 from '@/components/Section6';
import Section7 from '@/components/Section7';
import Footer from '@/components/Footer';
import { ShinyButton } from '@/components/ui/shiny-button';
import styles from './page.module.css';


export default function Home() {
  return (
    <>
      <main>
        <section className={styles.hero}>
          <div className={styles.robotSlot}>
            <InteractiveRobot className={styles.robot} />
          </div>

          {/* Fundo Three.js de linhas fluidas. Fica ACIMA do canvas do robô mas
              com mix-blend-mode: screen — só soma luz sobre o preto, nunca cobre
              o robô. O fade central (no shader) mantém o miolo limpo. */}
          <LineBackground className={styles.bgFx} />

          {/* Escurece a base da hero até o preto — sem isto as linhas azuis
              cortam de forma seca contra o preto sólido da Section2. */}
          <div className={styles.heroFade} aria-hidden="true" />

          {/* Headline — desktop: esquerda | mobile: topo */}
          <div className={styles.content}>
            <h1 className={styles.headline}>
              <span>Um clique pra clonar.</span>
              <span className={styles.headlineEcho}>Outro pra traduzir</span>
            </h1>
          </div>

          {/* Mobile: abaixo do robô | Desktop: direita, verticalmente centralizada */}
          <p className={styles.subheadline}>
            Clone qualquer funil de vendas validado e traduza pra português,
            espanhol ou inglês sem criar do zero, sem traduzir na mão.
          </p>

          {/* Wrapper de posicionamento — ShinyButton não recebe position:absolute diretamente */}
          <div className={styles.ctaWrapper}>
            <ShinyButton>
              Clonar meu primeiro funil →
            </ShinyButton>
          </div>

          <p className={styles.hint}>mova o cursor</p>
        </section>

        {/* ── Section 2 — "Como funciona" + "A diferença": canvas scrubbing
            com GSAP ScrollTrigger, os dois blocos de texto em crossfade
            dentro da mesma section pinada ── */}
        <Section2 />

        {/* ── Section 4 — Grid de funcionalidades ── */}
        <Section4 />

        {/* ── Section 5 — Pricing ── */}
        <Section5 />

        {/* ── Section 6 — FAQ ── */}
        <Section6 />

        {/* ── Section 7 — CTA final ── */}
        <Section7 />
      </main>

      <Footer />
    </>
  );
}
