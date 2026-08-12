import HeroCoverPin from '@/components/HeroCoverPin';
import Section2 from '@/components/Section2';
import Section4 from '@/components/Section4';
import Section5 from '@/components/Section5';
import Section6 from '@/components/Section6';
import Section7 from '@/components/Section7';
import Footer from '@/components/Footer';
import { ShinyButton } from '@/components/ui/shiny-button';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './page.module.css';


export default function Home() {
  return (
    <>
      <main>
        {/* HeroCoverPin prende a hero no topo por ~1 tela de scroll enquanto
            a Section2 (irmã seguinte, fluxo normal) sobe por cima dela —
            efeito de "puxar a segunda section cobrindo a primeira". */}
        <HeroCoverPin>
          <section className={styles.hero}>
            {/* Campo de estrelas — atrás do vídeo, combina com as estrelas
                do próprio vídeo e preenche as barras pretas do
                object-fit:contain (ver comentário completo no CSS). */}
            <div className={styles.starfield} aria-hidden="true" />

            {/* Vídeo do robô animando sobre a Terra — é o fundo principal
                da hero agora (substituiu o frame-sequence do robô e o
                fundo de linhas). Fica atrás do heroFade e do texto.

                Duas fontes, mesmo breakpoint do layout desktop (ver
                page.module.css): o browser escolhe UMA na carga (a
                primeira cujo media bate), nunca baixa as duas. */}
            <video
              className={styles.heroVideo}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            >
              <source
                src="/videos/robot-earth.mp4"
                media="(min-width: 1100px) and (min-aspect-ratio: 3/2)"
              />
              <source src="/videos/robot-earth-mobile.mp4" />
            </video>

            {/* Vinheta que funde a borda do vídeo no campo de estrelas atrás
                — ver .heroVideoFade no CSS. */}
            <div className={styles.heroVideoFade} aria-hidden="true" />

            {/* Escurece a base da hero até o preto — sem isto o corte pro
                preto sólido da Section2 fica seco. */}
            <div className={styles.heroFade} aria-hidden="true" />

            {/* Headline — desktop: esquerda | mobile: topo.
                className vai pro ScrollReveal (não pro filho): .content é
                item do flex da .hero (order:1), então quem precisa das
                propriedades de flex é o próprio elemento que o
                ScrollReveal renderiza, não um wrapper extra por dentro. */}
            <ScrollReveal className={styles.content} direction="left" delay={0}>
              <h1 className={styles.headline}>
                <span>Um clique pra clonar.</span>
                <span className={styles.headlineEcho}>Outro pra traduzir</span>
              </h1>
            </ScrollReveal>

            {/* Mobile: abaixo do robô | Desktop: direita, verticalmente centralizada */}
            <ScrollReveal className={styles.subheadline} direction="left" delay={150}>
              Clone qualquer funil de vendas validado e traduza pra português,
              espanhol ou inglês sem criar do zero, sem traduzir na mão.
            </ScrollReveal>

            {/* Wrapper de posicionamento — ShinyButton não recebe position:absolute diretamente.
                blurHole: ProgressiveBlur recorta um buraco no blur fixo bem em cima
                deste botão (em vez de esconder a faixa toda) — sem isso o CTA no
                fim da hero (mobile) caía dentro da faixa de 200px do blur e saía
                borrado. */}
            <ScrollReveal className={styles.ctaWrapper} direction="left" delay={300} blurHole>
              <ShinyButton>
                Clonar meu primeiro funil →
              </ShinyButton>
            </ScrollReveal>

            {/* .hint já tem sua própria entrada (@keyframes hint-in no CSS,
                display:none no mobile / block no desktop) — envolver com
                ScrollReveal duplicaria a animação de entrada à toa. */}
            <p className={styles.hint}>mova o cursor</p>
          </section>
        </HeroCoverPin>

        {/* ── Section 2 — "Como funciona" + "A diferença": vídeo de fundo
            com progresso preso ao scroll (GSAP ScrollTrigger), os dois
            blocos de texto em crossfade dentro da mesma section pinada ── */}
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
