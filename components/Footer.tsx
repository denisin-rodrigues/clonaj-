import styles from './Footer.module.css';

const PLATFORM_LINKS = [
  { label: 'Funcionalidades', href: 'https://clonaja.com/#funcionalidades' },
  { label: 'Integrações', href: 'https://clonaja.com/#' },
  { label: 'Preços', href: 'https://clonaja.com/#precos' },
  { label: 'Como funciona', href: 'https://clonaja.com/#como-funciona' },
] as const;

const COMPANY_LINKS = [
  { label: 'Sobre', href: 'https://clonaja.com/#' },
  { label: 'Blog', href: 'https://clonaja.com/#' },
  { label: 'Contato', href: 'https://clonaja.com/#' },
  { label: 'Legal', href: 'https://clonaja.com/#' },
] as const;

const SOCIAL = [
  { label: 'Instagram', src: '/images/icon-instagram.png', href: 'https://clonaja.com/#' },
  { label: 'YouTube', icon: 'logos:youtube-icon', href: 'https://clonaja.com/#' },
  { label: 'TikTok', icon: 'logos:tiktok-icon', href: 'https://clonaja.com/#' },
] as const;

const ICON = (name: string) => `https://api.iconify.design/${name}.svg`;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-icon.png"
              alt=""
              aria-hidden="true"
              className={styles.logoIcon}
            />
            <span className={styles.logoName}>ClonaJá</span>
          </div>
          <p className={styles.tagline}>
            Clone funis validados, traduza pra qualquer mercado e publique no
            seu domínio. Clone. Traduza. Escale.
          </p>
        </div>

        <nav className={styles.column} aria-label="Plataforma">
          <h3 className={styles.columnTitle}>Plataforma</h3>
          <ul className={styles.linkList}>
            {PLATFORM_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.column} aria-label="Empresa">
          <h3 className={styles.columnTitle}>Empresa</h3>
          <ul className={styles.linkList}>
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © 2025 ClonaJá. Todos os direitos reservados.
        </p>
        <div className={styles.social}>
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className={styles.socialLink}
            >
              <img
                src={'src' in s ? s.src : ICON(s.icon)}
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
