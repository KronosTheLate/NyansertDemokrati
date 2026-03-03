import React from 'react'
import { LABELS } from './DistributionCharts'

export default function ClaimView({ claim, selectedUserId, onVote }) {
  const [voteValue, setVoteValue] = React.useState(0)
  const [claimQuality, setClaimQuality] = React.useState(true)
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
            {[-2, -1, 0, 1, 2].map((v) => (
              <label key={v} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="vote"
                  value={v}
                  checked={voteValue === v}
                  onChange={() => setVoteValue(v)}
                  disabled={!canVote}
                  style={styles.radio}
                />
                <span style={styles.radioText}>{LABELS[String(v)]}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Er påstanden godt formulert?</label>
          <div style={styles.qualityRow}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="quality"
                checked={claimQuality === true}
                onChange={() => setClaimQuality(true)}
                disabled={!canVote}
                style={styles.radio}
              />
              <span style={styles.radioText}>Ja</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="quality"
                checked={claimQuality === false}
                onChange={() => setClaimQuality(false)}
                disabled={!canVote}
                style={styles.radio}
              />
              <span style={styles.radioText}>Nei</span>
            </label>
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
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
  },
  scale: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  qualityRow: {
    display: 'flex',
    gap: '1rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  radio: {
    accentColor: 'var(--color-accent)',
  },
  radioText: {
    whiteSpace: 'nowrap',
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
  },
}
