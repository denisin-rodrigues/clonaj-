"use client";

import type React from "react";

/* CTA primária — versão limpa.
 *
 * A versão anterior (shiny CTA) empilhava uma borda cônica animada, um
 * ::after quadrado (width:100% + aspect-ratio:1) que girava, e uma grade de
 * pontos mascarada. O quadrado giratório, recortado pelo overflow:hidden,
 * fazia as arestas retas varrerem o interior do botão no hover — as "bordas
 * quadradas" que apareciam. Trocado por um preenchimento sólido da paleta do
 * site com hover discreto (elevação leve + brilho), sem geometria giratória.
 */
const CSS = `
.shiny-cta {
  --cta-from: var(--brand-blue);
  --cta-to: var(--brand-blue-strong);
  --cta-ring: rgb(var(--brand-blue-soft-rgb) / 0.55);

  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.95rem 1.9rem;
  border: 1px solid var(--cta-ring);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;

  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #ffffff;

  background: linear-gradient(180deg, var(--cta-from), var(--cta-to));

  /* rimlight branco no topo (vidro) + sombra azul suave de elevação */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 2px 10px rgb(var(--brand-blue-rgb) / 0.30);

  transition:
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 200ms ease,
    filter 200ms ease;
}

.shiny-cta:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    0 6px 22px rgb(var(--brand-blue-rgb) / 0.45);
}

.shiny-cta:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

.shiny-cta:focus-visible {
  outline: 2px solid var(--brand-blue-soft);
  outline-offset: 3px;
}

.shiny-cta span {
  display: inline-flex;
  align-items: center;
}

/* Sob prefers-reduced-motion, o hover não desloca — só muda cor/sombra. */
@media (prefers-reduced-motion: reduce) {
  .shiny-cta {
    transition: box-shadow 200ms ease, filter 200ms ease;
  }
  .shiny-cta:hover,
  .shiny-cta:active {
    transform: none;
  }
}
`;

interface ShinyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ShinyButton({ children, onClick, className = "" }: ShinyButtonProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button className={`shiny-cta${className ? ` ${className}` : ""}`} onClick={onClick}>
        <span>{children}</span>
      </button>
    </>
  );
}
