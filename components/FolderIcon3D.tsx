'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import styles from './FolderIcon3D.module.css';

/* Ícone 3D decorativo: uma pastinha que abre (aba tipo alçapão, articulada
   na base) e recebe uma folha por cima — substitui o ícone estático
   (iconify) só no card em destaque da Section4.

   Câmera quase de frente (não de cima): é o que faz o conjunto ler como uma
   pasta vista de frente, com uma abinha, em vez de formas confusas vistas
   de cima. A folha desliza de cima pra dentro enquanto a aba abre pra
   frente/baixo tipo alçapão, e no fim a aba volta quase fechada deixando só
   uma tira clara da folha à mostra no topo — mesma linguagem visual do
   ícone duotone que este componente substitui. */
export default function FolderIcon3D({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 10);
    camera.position.set(0, 0.25, 3.0);
    camera.lookAt(0, -0.02, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // Sem isto, ferramentas externas que tiram screenshot do canvas em um
      // momento arbitrário (fora do loop de render) capturam o buffer já
      // limpo pelo double-buffering — dá um quadrado preto/em branco em vez
      // do ícone. Baixo custo pra um canvas deste tamanho.
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(1.4, 1.8, 2.2);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-1.2, -0.6, 1.5);
    scene.add(ambient, key, fill);

    /* Preto e branco de propósito, igual ao ícone iconify que este
       componente substitui (agora também monocromático): corpo/orelha num
       cinza CLARO/quase branco (sempre visível, é o que dá a silhueta de
       pasta), aba num PRETO por cima (é a parte que anima). Cores
       parecidas demais (tentativa anterior com azuis) faziam tudo virar um
       bloco só quando a aba cobria o corpo — esse contraste resolve isso
       mesmo com a aba fechada. */
    const INK_BOLD = 0x161616;
    const INK_SOFT = 0xd9dade;
    const TILT = -0.34; // inclinação mais forte: sem isso a abertura em X não separa visualmente do corpo

    /* Corpo da pasta — painel de trás + "orelha" no canto sup. esquerdo,
       silhueta clássica de pasta de arquivo. Mais ALTO que a aba de
       propósito: a borda de cima fica sempre visível por trás da aba. */
    const body = new THREE.Group();
    body.rotation.x = TILT;
    scene.add(body);

    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.1, 0.05),
      new THREE.MeshStandardMaterial({ color: INK_SOFT, roughness: 0.55, metalness: 0.02 }),
    );
    backPanel.position.set(0, -0.02, -0.1);
    body.add(backPanel);

    const tab = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.22, 0.05),
      new THREE.MeshStandardMaterial({ color: INK_SOFT, roughness: 0.55, metalness: 0.02 }),
    );
    tab.position.set(-0.38, 0.64, -0.1);
    body.add(tab);

    /* Folha — desliza de cima pra dentro da pasta, atrás da aba. */
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 1.25, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xfbfcff, roughness: 0.9 }),
    );
    paper.rotation.x = TILT;
    scene.add(paper);

    const linesGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.64 - i * 0.13, 0.08, 0.012),
        new THREE.MeshBasicMaterial({ color: 0xc6c8cf }),
      );
      line.position.set(-0.06, 0.34 - i * 0.25, 0.02);
      linesGroup.add(line);
    }
    paper.add(linesGroup);

    const PAPER_HIDDEN = { y: 1.5, z: -0.05 };
    const PAPER_IN = { y: -0.08, z: 0.04 };
    paper.position.set(0, PAPER_HIDDEN.y, PAPER_HIDDEN.z);

    /* Aba da frente — hinge na base, abre tipo alçapão (gira pra frente/
       baixo, na direção da câmera). Mais BAIXA e mais ESTREITA que o corpo
       de propósito: a "orelha" e uma tira do painel de trás ficam sempre
       visíveis por cima dela, mesmo fechada — é o que dá o contorno de
       pasta em vez de um retângulo liso. */
    const flapPivot = new THREE.Group();
    flapPivot.position.set(0, -0.57, 0.14);
    flapPivot.rotation.x = TILT;
    scene.add(flapPivot);

    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.86, 0.05),
      new THREE.MeshStandardMaterial({ color: INK_BOLD, roughness: 0.45, metalness: 0.04 }),
    );
    flap.position.set(0, 0.43, 0);
    flapPivot.add(flap);

    const CLOSED = 0; // em pé, cobrindo a parte de baixo da pasta
    const OPEN = 1.25; // tomba pra frente/baixo tipo alçapão
    const REST = 0.16; // volta quase fechada, a folha aparece por cima
    flapPivot.rotation.x = TILT + CLOSED;

    const render = () => renderer.render(scene, camera);

    let tl: gsap.core.Timeline | null = null;
    let io: IntersectionObserver | null = null;
    let playing = false;

    const play = () => {
      if (playing) return;
      playing = true;
      tl = gsap
        .timeline({ repeat: -1, repeatDelay: 1.3, onUpdate: render })
        .set(flapPivot.rotation, { x: TILT + CLOSED })
        .set(paper.position, { y: PAPER_HIDDEN.y, z: PAPER_HIDDEN.z })
        .to(flapPivot.rotation, { x: TILT + OPEN, duration: 0.65, ease: 'power2.out' }, 0.1)
        .to(paper.position, { y: PAPER_IN.y, z: PAPER_IN.z, duration: 0.6, ease: 'power2.in' }, 0.5)
        .to(flapPivot.rotation, { x: TILT + REST, duration: 0.6, ease: 'power2.inOut' }, 1.1);
    };
    const stop = () => {
      playing = false;
      tl?.kill();
      tl = null;
    };

    /* Loop pequeno e decorativo (ícone de ~40px) — toca mesmo sob
       prefers-reduced-motion, que aqui é reservado pros efeitos grandes
       (pin da hero cobrindo a section, scroll-jack da Section2). */
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else stop();
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    /* ResizeObserver em vez de ler clientWidth uma vez no mount: o CSS
       Module às vezes ainda não tinha aplicado a largura final da .icon
       nesse tick (visto em dev: canvas nascendo com proporção errada).
       O ResizeObserver dispara já com o box real, e continua acompanhando
       depois (troca de breakpoint, ou QA manual redimensionando via JS). */
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      const w = box?.width || host.clientWidth || 44;
      const h = box?.height || host.clientHeight || 44;
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
      tl?.kill();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={`${styles.host} ${className ?? ''}`} />;
}
