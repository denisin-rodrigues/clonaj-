import styles from "./Navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.nav}>
      {/* Logo + nome */}
      <div className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-icon.png"
          alt=""
          aria-hidden="true"
          className={styles.logoIcon}
        />
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
