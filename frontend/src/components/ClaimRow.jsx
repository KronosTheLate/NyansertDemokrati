import React from 'react'
import { LABELS } from './DistributionCharts'

const OPINION_VALUES = [-2, -1, 0, 1, 2]
const COLORS = ['#e5534b', '#d29922', '#6e7681', '#3fb950', '#58a6ff']

export default function ClaimRow({ claim, voteValue, claimQuality, onChange, disabled }) {
  const handleOpinionChange = (v) => {
    if (!disabled) onChange(claim.id, v, claimQuality)
  }

  const handleQualityChange = (q) => {
    if (!disabled) onChange(claim.id, voteValue, q)
  }

  return (
    <div style={styles.row}>
      <div style={styles.claimTitle} title={claim.title}>
        {claim.title.length > 60 ? claim.title.slice(0, 60) + '…' : claim.title}
      </div>

      <div style={styles.controls}>
        <div style={styles.opinionGroup}>
          {OPINION_VALUES.map((v) => {
            const isActive = voteValue === v
            return (
              <button
                key={v}
                type="button"
                onClick={() => handleOpinionChange(v)}
                disabled={disabled}
                title={LABELS[String(v)]}
                className="claim-row-pill"
                style={{
                  ...styles.pill,
                  ...(isActive ? { ...styles.pillActive, backgroundColor: COLORS[OPINION_VALUES.indexOf(v)] } : {}),
                }}
              >
                {v}
              </button>
            )
          })}
        </div>

        <div style={styles.qualityGroup}>
          <button
            type="button"
            className="claim-row-pill"
            onClick={() => handleQualityChange(true)}
            disabled={disabled}
            style={{
              ...styles.pillSmall,
              ...(claimQuality === true ? styles.pillActiveQuality : {}),
            }}
          >
            Ja
          </button>
          <button
            type="button"
            className="claim-row-pill"
            onClick={() => handleQualityChange(false)}
            disabled={disabled}
            style={{
              ...styles.pillSmall,
              ...(claimQuality === false ? styles.pillActiveQuality : {}),
            }}
          >
            Nei
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    marginBottom: '0.5rem',
  },
  claimTitle: {
    fontSize: '0.95rem',
    color: 'var(--color-text)',
    lineHeight: 1.3,
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
  },
  opinionGroup: {
    display: 'flex',
    gap: '2px',
  },
  pill: {
    width: 28,
    height: 28,
    padding: 0,
    fontSize: '0.8rem',
    fontWeight: 600,
    border: '2px solid var(--color-border)',
    borderRadius: 4,
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  pillActive: {
    borderColor: 'transparent',
    color: '#fff',
  },
  pillSmall: {
    padding: '2px 8px',
    fontSize: '0.8rem',
    border: '2px solid var(--color-border)',
    borderRadius: 4,
    background: 'var(--color-surface-elevated)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
  },
  pillActiveQuality: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
    color: '#fff',
  },
}
