import React from 'react'
import { LABELS } from './DistributionCharts'

const QUALITY_LABELS = {
  '-1': 'Dårlig',
  '0': 'Middels',
  '1': 'Godt formulert',
}

export default function ClaimView({ claim, selectedUserId, onVote }) {
  const [voteValue, setVoteValue] = React.useState(0)
  const [claimQuality, setClaimQuality] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedUserId) return
    setSubmitting(true)
    setError(null)
    try {
      await onVote({
        user_id: selectedUserId,
        claim_id: claim.id,
        vote_value: voteValue,
        claim_quality: claimQuality,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Kunne ikke lagre stemme')
    } finally {
      setSubmitting(false)
    }
  }

  const canVote = !!selectedUserId

  return (
    <div style={styles.container}>
      <div style={styles.claim}>
        <h2 style={styles.title}>{claim.title}</h2>
        {claim.description && (
          <p style={styles.description}>{claim.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <label style={styles.label}>Din mening</label>
          <div style={styles.scale}>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={voteValue}
              onChange={(e) => setVoteValue(parseInt(e.target.value, 10))}
              disabled={!canVote}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              <strong>{LABELS[String(voteValue)]}</strong>
            </div>
          </div>
        </div>

        <div style={{ ...styles.section, marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <label style={styles.label}>Påstandskvalitet (hvordan er den formulert?)</label>
          <div style={styles.scale}>
            <input
              type="range"
              min="-1"
              max="1"
              step="1"
              value={claimQuality}
              onChange={(e) => setClaimQuality(parseInt(e.target.value, 10))}
              disabled={!canVote}
              style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              <strong>{QUALITY_LABELS[String(claimQuality)]}</strong>
            </div>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={!canVote || submitting}
          style={styles.button}
        >
          {submitting ? 'Lagrer…' : 'Stem'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
  },
  claim: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  description: {
    margin: '0.5rem 0 0',
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
  },
  form: {
    marginBottom: 0,
  },
  section: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  scale: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  error: {
    color: '#f85149',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
  },
  button: {
    padding: '0.6rem 1.25rem',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'var(--color-accent)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    marginTop: '1rem',
  },
}
