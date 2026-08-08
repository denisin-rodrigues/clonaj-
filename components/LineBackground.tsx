'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
 * Fundo de linhas grandes e fluidas, geradas por matemática num shader.
 *
 * O visual são iso-linhas de um campo escalar f(x, y, t): pinta-se onde
 * fract(f) passa perto de um limiar. Distorcer o domínio de f com ruído fbm
 * faz as linhas ondularem organicamente (sem pinstripe reto). Duas camadas de
 * frequências diferentes dão profundidade. Tudo num único quad full-screen —
 * custo de GPU desprezível.
 *
 * O robô é preservado por duas coisas juntas:
 *  1. o shader escurece o centro (fade radial aspecto-correto);
 *  2. o elemento usa mix-blend-mode: screen (no CSS), então o preto do centro
 *     não altera o robô — só as linhas azuis das bordas somam luz.
 * ------------------------------------------------------------------------ */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.02; a *= 0.5; }
  return s;
}

// intensidade da banda perto de cada iso-linha inteira de 'field'
float band(float field, float w) {
  float g = fract(field);
  float d = min(g, 1.0 - g);
  return smoothstep(w, 0.0, d);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.05;

  // distorção orgânica do domínio
  float warp = fbm(p * 1.2 + vec2(t, t * 0.6)) * 1.7;

  // conjunto principal — linhas grandes e fluidas (poucas, com bons vãos)
  float f1 = p.x * 2.8 + warp * 2.4 + sin(p.y * 1.4 + t * 1.6) * 0.5;
  float l1 = band(f1, 0.10);

  // conjunto secundário — ainda maior e mais lento, dá profundidade
  float f2 = p.x * 1.5 - warp * 1.6 + t * 1.1;
  float l2 = band(f2, 0.16);

  float inten = l1 * 0.7 + l2 * 0.4;

  vec3 base = vec3(0.008, 0.016, 0.050);
  vec3 blue = vec3(0.078, 0.278, 0.902); // #1447E6
  vec3 col = base + blue * inten;
  col += blue * inten * inten * 0.5;      // glow aditivo

  // Distribuição vertical: claro em cima e embaixo, escuro no meio.
  // Bate com a referência (luz no topo/base) e mantém calma a faixa central
  // onde ficam a headline (esquerda) e a subheadline (direita).
  float vband = clamp(0.12 + smoothstep(0.34, 0.0, uv.y) + smoothstep(0.66, 1.0, uv.y), 0.0, 1.0);
  col *= vband;

  // Fade radial central — protege o robô, aspecto-correto.
  vec2 c = uv - 0.5;
  c.x *= aspect;
  col *= smoothstep(0.14, 0.52, length(c));

  gl_FragColor = vec4(col, 1.0);
}
`;

/** DPR acima de 2 não agrega nitidez visível e custa fill-rate. */
const MAX_DPR = 2;

export default function LineBackground({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      // Sem WebGL: simplesmente não há fundo (o robô sobre preto continua ok).
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // As linhas sempre fluem. Sob prefers-reduced-motion o fluxo fica mais
    // lento e gentil (não congelado) — motion ambiente suave, não bloqueante.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeScale = reduce ? 0.6 : 1.0;

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * dpr, h * dpr);
      renderer.render(scene, camera); // repinta já com o novo tamanho
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      uniforms.uTime.value = ((performance.now() - start) / 1000) * timeScale;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
