import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.nav}>
      {/* Logo + nome */}
      <div className={styles.brand}>
        <svg
          className={styles.logoIcon}
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente azul→violeta da logo. O azul é o token da marca; a
                ponta violeta é da própria arte. */}
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-blue)" />
              <stop offset="100%" stopColor="#4a1ae8" />
            </linearGradient>
          </defs>
          {/* Dois quadrados arredondados sobrepostos na diagonal */}
          <rect x="8" y="8" width="250" height="250" rx="46" fill="url(#logoGrad)" />
          <rect x="142" y="142" width="250" height="250" rx="46" fill="url(#logoGrad)" />
          {/* Dois recortes pretos diagonais */}
          <rect x="84" y="84" width="100" height="100" rx="22" fill="#000000" />
          <rect x="200" y="200" width="100" height="100" rx="22" fill="#000000" />
        </svg>
        <span className={styles.logoName}>clonajá</span>
      </div>

      {/* Divisória vertical entre logo e botão */}
      <span className={styles.divider} aria-hidden="true" />

      {/* Botão CTA da nav */}
      <a href="#clonar" className={styles.ctaBtn}>
        Clona agora
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </nav>
  );
}
