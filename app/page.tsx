import InteractiveRobot from '@/components/InteractiveRobot';
import LineBackground from '@/components/LineBackground';
import { ShinyButton } from '@/components/ui/shiny-button';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <section className={styles.hero}>
        <InteractiveRobot className={styles.robot} />

        {/* Fundo Three.js de linhas fluidas. Fica ACIMA do canvas do robô mas
            com mix-blend-mode: screen — só soma luz sobre o preto, nunca cobre
            o robô. O fade central (no shader) mantém o miolo limpo. */}
        <LineBackground className={styles.bgFx} />

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
    </main>
  );
}
