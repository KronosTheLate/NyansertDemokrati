import React from 'react'
import { LABELS } from './DistributionCharts'

const QUALITY_LABELS = {
  '-1': 'Dårlig',
  '0': 'Middels',
  '1': 'Godt formulert',
}

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
        {claim.title.length > 80 ? claim.title.slice(0, 80) + '…' : claim.title}
      </div>

      <div style={styles.controls}>
        <div style={styles.sliderGroup}>
          <label style={styles.sliderHeading}>Din mening</label>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min="-2"
              max="2"
              step="1"
              value={voteValue}
              onChange={(e) => handleOpinionChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="claim-slider"
              style={styles.slider}
            />
            <span style={styles.sliderLabel}>{LABELS[String(voteValue)]}</span>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.sliderGroup}>
          <label style={styles.sliderHeading}>Påstandskvalitet</label>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min="-1"
              max="1"
              step="1"
              value={claimQuality}
              onChange={(e) => handleQualityChange(parseInt(e.target.value, 10))}
              disabled={disabled}
              className="claim-slider"
              style={{ ...styles.slider, accentColor: 'var(--color-accent)' }}
            />
            <span style={{ ...styles.sliderLabel, minWidth: '110px' }}>{QUALITY_LABELS[String(claimQuality)]}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    marginBottom: '0.5rem',
  },
  claimTitle: {
    fontSize: '0.95rem',
    color: 'var(--color-text)',
    lineHeight: 1.3,
    fontWeight: 500,
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '0.25rem',
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: '1 1 200px',
  },
  sliderHeading: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  slider: {
    flex: 1,
    cursor: 'pointer',
  },
  sliderLabel: {
    fontSize: '0.85rem',
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    minWidth: '90px',
    textAlign: 'left',
  },
  divider: {
    width: '1px',
    alignSelf: 'stretch',
    background: 'var(--color-border)',
    margin: '0 0.5rem',
  },
}
