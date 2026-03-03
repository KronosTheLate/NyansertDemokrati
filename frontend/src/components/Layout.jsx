import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <Link to="/" style={styles.logoLink}>
          <h1 style={styles.logo}>Nyansert Demokrati</h1>
        </Link>
        {isHome && (
          <p style={styles.tagline}>
            Fordi vi fortjener et demokrati som er like nyansert som folkene det består av.
          </p>
        )}
        {!isHome && (
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink} className="nav-link">Hjem</Link>
            <Link to="/stem" style={styles.navLink} className="nav-link">Stem</Link>
            <Link to="/påstander" style={styles.navLink} className="nav-link">Påstander</Link>
          </nav>
        )}
      </header>

      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    maxWidth: 900,
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  logoLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  logo: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  tagline: {
    margin: '0.5rem 0 0',
    color: 'var(--color-text-muted)',
    fontSize: '1rem',
  },
  nav: {
    marginTop: '0.75rem',
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  main: {
    minWidth: 0,
  },
}
