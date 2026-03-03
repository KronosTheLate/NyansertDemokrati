import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={styles.container}>
      <div style={styles.cardGrid}>
        <Link to="/stem" style={styles.card} className="card">
          <span style={styles.cardIcon}>✋</span>
          <h2 style={styles.cardTitle}>Stem</h2>
          <p style={styles.cardDesc}>
            Si hva du mener om påstandene.
          </p>
        </Link>
        <Link to="/fordeling" style={styles.card} className="card">
          <span style={styles.cardIcon}>📊</span>
          <h2 style={styles.cardTitle}>Fordeling</h2>
          <p style={styles.cardDesc}>
            Se hvordan meningene fordeler seg på hver påstand.
          </p>
        </Link>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 0',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: 560,
  },
  card: {
    display: 'block',
    padding: '2rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.2s, transform 0.15s',
  },
  cardIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  cardDesc: {
    margin: '0.75rem 0 0',
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
}
