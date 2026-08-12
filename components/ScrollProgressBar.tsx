'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ScrollProgressBar.module.css';

gsap.registerPlugin(ScrollTrigger);

/* Indicador de progresso de scroll da página inteira — fixo, sempre visível,
   fora do fluxo das sections. Adaptado do componente "scroll-progress-bar"
   (shadcn/Tailwind + framer-motion) pra arquitetura deste projeto:

   - Sem Tailwind/shadcn: o projeto inteiro usa CSS Modules, não faz sentido
     instalar um sistema de classe utilitária só por causa de um componente.
   - Sem framer-motion: o valor é 100% derivado do scroll (não tem física de
     mola nem transição própria), então uma lib de animação não agrega nada
     aqui — GSAP ScrollTrigger já é a ferramenta de scroll do resto do site
     (Section2, Section4, Section7, HeroCoverPin), então reaproveita o mesmo
     padrão em vez de trazer uma segunda lib de animação pro bundle.
   - `hsl(var(--primary))` do original não existe neste design system — usa
     var(--brand-blue) (ver app/globals.css). */

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Position = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';

const POSITION_CLASS: Record<Position, string> = {
  'top-right': styles.posTopRight,
  'bottom-right': styles.posBottomRight,
  'top-left': styles.posTopLeft,
  'bottom-left': styles.posBottomLeft,
};

interface ScrollProgressBarProps {
  type?: 'circle' | 'bar';
  position?: Position;
  color?: string;
  strokeSize?: number;
  showPercentage?: boolean;
}

export default function ScrollProgressBar({
  type = 'circle',
  position = 'bottom-right',
  color = 'var(--brand-blue, #1447e6)',
  strokeSize = 2,
  showPercentage = false,
}: ScrollProgressBarProps) {
  const barRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    /* start:0, end:'max' — acompanha o scroll da página inteira (documento),
       não uma section específica. Sem pin, só leitura de progresso. */
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress;
        setPercentage(Math.round(p * 100));
        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
        }
      },
    });

    return () => st.kill();
  }, []);

  if (type === 'bar') {
    return (
      <div
        className={styles.barTrack}
        style={{ height: strokeSize + 2 }}
        aria-hidden="true"
      >
        <span
          ref={barRef}
          className={styles.barFill}
          style={{ backgroundColor: color, width: 0 }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.circleWrap} ${POSITION_CLASS[position]}`}
      style={{ opacity: percentage > 0 ? 1 : 0 }}
      aria-hidden="true"
    >
      <svg width="52" height="52" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth={strokeSize}
          className={styles.track}
        />
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={strokeSize}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          transform="rotate(-90 50 50)"
        />
      </svg>
      {showPercentage && (
        <span className={styles.percentage}>{percentage}%</span>
      )}
    </div>
  );
}
