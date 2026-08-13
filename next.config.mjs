/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Site 100% estático (sem rotas de API, sem server actions) — "export"
     faz o `next build` gerar uma pasta `out/` com HTML/CSS/JS puros,
     prontos pra subir em qualquer hospedagem (Hostinger, cPanel, etc.),
     não só Vercel. */
  output: 'export',
};

export default nextConfig;
