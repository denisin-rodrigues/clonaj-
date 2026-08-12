'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: string;
  className?: string;
  once?: boolean;
  threshold?: number;
  /* Marca o wrapper com data-blur-hole — ProgressiveBlur (fixed, base da
     viewport) usa isso pra recortar um buraco no próprio blur bem em cima
     deste elemento, em vez de esconder a faixa toda. Ver ProgressiveBlur.tsx. */
  blurHole?: boolean;
}

/* Curva de easing pedida (mesma família de easeOutQuad usada em libs de
   scroll-reveal conhecidas) — entra rápido, desacelera suave no final. */
const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

/* O nome da direção é de ONDE o elemento entra, não pra onde ele vai —
   mesma convenção do Animate.css (fadeInLeft = entra vindo da esquerda,
   desliza pra direita até a posição final). */
function hiddenTransform(direction: Direction, distance: string): string {
  switch (direction) {
    case 'up':
      return `translateY(${distance})`;
    case 'down':
      return `translateY(-${distance})`;
    case 'left':
      return `translateX(-${distance})`;
    case 'right':
      return `translateX(${distance})`;
    case 'none':
    default:
      return 'none';
  }
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 700,
  distance = '40px',
  className,
  once = true,
  threshold = 0.15,
  blurHole = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate(0, 0)' : hiddenTransform(direction, distance),
    transition: `opacity ${duration}ms ${EASE} ${delay}ms, transform ${duration}ms ${EASE} ${delay}ms`,
    willChange: 'opacity, transform',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-blur-hole={blurHole ? 'true' : undefined}
    >
      {children}
    </div>
  );
}
