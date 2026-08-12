'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import styles from './GlobeIcon3D.module.css';

/* Ícone 3D decorativo: um mini-planeta girando continuamente — substitui o
   ícone estático (iconify "global-bold-duotone") no card "Tradução com
   conversão preservada" da Section4.

   Antes era um globo-ícone (esfera lisa + anéis de arame, estilo duotone).
   Trocado por um planeta de verdade: textura de oceano+continentes gerada
   em canvas (equiretangular), camada de nuvens girando em velocidade
   própria (leve paralaxe) e halo de atmosfera (esfera maior, BackSide,
   blend aditivo) — a mesma linguagem visual do vídeo da Terra no hero,
   só que em miniatura. */
export default function GlobeIcon3D({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 10);
    camera.position.set(0, 0.15, 2.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // Sem isto, ferramentas externas que tiram screenshot do canvas em um
      // momento arbitrário (fora do loop de render) capturam o buffer já
      // limpo pelo double-buffering — dá um quadrado preto em vez do ícone.
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    /* Duas luzes de lado opostos (key + fill) em vez de só uma — sem a
       fill a esfera lisa ficava com metade escura demais e lia "chata"
       num objeto tão pequeno. Fill em branco neutro (era azulado) pra não
       reintroduzir cor na versão preto-e-branco do globo. */
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(1.4, 1.2, 1.8);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-1.6, -0.6, 1.2);
    scene.add(ambient, key, fill);

    const GLOW_WHITE = 0xffffff;

    /* ---- Textura procedural do planeta (equiretangular 512×256) ----
       Oceano em gradiente + "continentes" como blobs irregulares (várias
       elipses sobrepostas com jitter) + calotas polares claras. Nada de
       asset externo — gerado uma vez, no mount. */
    const makePlanetTexture = () => {
      const w = 512;
      const h = 256;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;

      const ocean = ctx.createLinearGradient(0, 0, 0, h);
      ocean.addColorStop(0, '#050505');
      ocean.addColorStop(0.5, '#141414');
      ocean.addColorStop(1, '#050505');
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, w, h);

      const blobCluster = (cx: number, cy: number, n: number, spread: number, size: number) => {
        for (let i = 0; i < n; i++) {
          const x = cx + (Math.random() - 0.5) * spread;
          const y = cy + (Math.random() - 0.5) * spread * 0.6;
          const r = size * (0.5 + Math.random() * 0.7);
          ctx.beginPath();
          ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.3), Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      ctx.fillStyle = '#e4e5ea';
      // "continentes": alguns clusters espalhados em longitudes/latitudes variadas
      blobCluster(90, 110, 7, 90, 22);
      blobCluster(230, 90, 6, 80, 20);
      blobCluster(230, 170, 5, 70, 18);
      blobCluster(370, 120, 6, 85, 20);
      blobCluster(460, 80, 4, 60, 16);

      // sombra sutil de relevo por cima dos continentes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      blobCluster(95, 115, 4, 50, 12);
      blobCluster(235, 95, 3, 45, 10);
      blobCluster(375, 125, 3, 45, 10);

      // calotas polares
      const capGrad = (y0: number, y1: number) => {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        return g;
      };
      ctx.fillStyle = capGrad(0, 34);
      ctx.fillRect(0, 0, w, 34);
      ctx.fillStyle = capGrad(h, h - 30);
      ctx.fillRect(0, h - 30, w, 30);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    /* Nuvens: canvas separado, fundo transparente, blobs brancos difusos.
       Fica numa esfera um pouco maior, girando em velocidade própria —
       dá profundidade/paralaxe em vez do planeta girar como bloco único. */
    const makeCloudTexture = () => {
      const w = 512;
      const h = 256;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 26; i++) {
        const x = Math.random() * w;
        const y = 30 + Math.random() * (h - 60);
        const r = 14 + Math.random() * 26;
        ctx.globalAlpha = 0.25 + Math.random() * 0.35;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.45, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const globe = new THREE.Group();
    scene.add(globe);

    /* Câmera a z=2.7 com fov=28° só enxerga ±0.67 de meia-altura na
       profundidade do globo (2.7·tan(14°)) — raio 0.58 cabe com folga
       (sem anéis agora, dá pra esfera ser um pouco maior que antes). */
    const RADIUS = 0.58;

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 40, 28),
      new THREE.MeshStandardMaterial({ map: makePlanetTexture(), roughness: 0.75, metalness: 0.04 }),
    );
    globe.add(planet);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.015, 32, 22),
      new THREE.MeshStandardMaterial({
        map: makeCloudTexture(),
        transparent: true,
        depthWrite: false,
        roughness: 0.9,
      }),
    );
    globe.add(clouds);

    /* Halo de atmosfera: esfera maior, só o lado de dentro (BackSide) com
       blend aditivo — clássico truque barato de "fresnel falso" que dá o
       contorno brilhante contra o fundo, agora branco/neutro em vez de
       azul pra manter o globo preto-e-branco. */
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.14, 32, 22),
      new THREE.MeshBasicMaterial({
        color: GLOW_WHITE,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    globe.add(atmosphere);

    const render = () => renderer.render(scene, camera);

    let tlPlanet: gsap.core.Tween | null = null;
    let tlClouds: gsap.core.Tween | null = null;
    let io: IntersectionObserver | null = null;

    const play = () => {
      if (tlPlanet) return;
      tlPlanet = gsap.to(globe.rotation, {
        y: `+=${Math.PI * 2}`,
        duration: 10,
        ease: 'none',
        repeat: -1,
        onUpdate: render,
      });
      /* Nuvens giram mais rápido e em sentido levemente diferente —
         paralaxe sutil, não é só um planeta rígido girando inteiro. */
      tlClouds = gsap.to(clouds.rotation, {
        y: `+=${Math.PI * 2}`,
        duration: 7,
        ease: 'none',
        repeat: -1,
      });
    };
    const stop = () => {
      tlPlanet?.kill();
      tlClouds?.kill();
      tlPlanet = null;
      tlClouds = null;
    };

    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    /* ResizeObserver em vez de clientWidth no mount — ver o mesmo comentário
       no FolderIcon3D: o CSS Module às vezes ainda não tinha aplicado a
       largura final da .icon nesse tick. */
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      const w = box?.width || host.clientWidth || 28;
      const h = box?.height || host.clientHeight || 28;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    });
    ro.observe(host);

    return () => {
      ro.disconnect();
      io?.disconnect();
      tlPlanet?.kill();
      tlClouds?.kill();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => {
              const mat = m as THREE.MeshStandardMaterial;
              mat.map?.dispose();
              mat.dispose();
            });
          } else {
            const mat = obj.material as THREE.MeshStandardMaterial;
            mat.map?.dispose();
            mat.dispose();
          }
        }
      });
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={`${styles.host} ${className ?? ''}`} />;
}
