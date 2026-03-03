import React, { useState, useEffect, useCallback } from 'react'
import DistributionCharts from '../components/DistributionCharts'
import { getClaims, getDistribution } from '../api'

export default function DistributionPage() {
  const [claims, setClaims] = useState([])
  const [selectedClaimId, setSelectedClaimId] = useState(null)
  const [distribution, setDistribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClaims = useCallback(async () => {
    try {
      setError(null)
      const claimsData = await getClaims()
      setClaims(claimsData)
      if (claimsData.length > 0 && !selectedClaimId) {
        setSelectedClaimId(claimsData[0].id)
      }
    } catch (err) {
      setError(err.message || 'Kunne ikke laste påstander')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDistribution = useCallback(async () => {
    if (!selectedClaimId) return
    try {
      const data = await getDistribution(selectedClaimId)
      setDistribution(data)
    } catch (err) {
      setDistribution(null)
    }
  }, [selectedClaimId])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  useEffect(() => {
    fetchDistribution()
  }, [fetchDistribution])

  const selectedClaim = claims.find((c) => c.id === selectedClaimId)

  if (loading) {
    return <p style={styles.muted}>Laster…</p>
  }

  if (error) {
    return (
      <div>
        <p style={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.claimList}>
        <label style={styles.label}>Velg påstand</label>
        <select
          value={selectedClaimId ?? ''}
          onChange={(e) => setSelectedClaimId(Number(e.target.value))}
          style={styles.select}
        >
          {claims.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedClaim && (
        <div style={styles.chartSection}>
          <div style={styles.claimHeader}>
            <h2 style={styles.claimTitle}>{selectedClaim.title}</h2>
            {selectedClaim.description && (
              <p style={styles.claimDesc}>{selectedClaim.description}</p>
            )}
          </div>
          {distribution ? (
            <DistributionCharts distribution={distribution} />
          ) : (
            <p style={styles.muted}>Ingen data å vise ennå</p>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 600,
  },
  claimList: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--color-text-muted)',
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    fontSize: '0.95rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
  chartSection: {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
  },
  claimHeader: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
  },
  claimTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  claimDesc: {
    margin: '0.5rem 0 0',
    color: 'var(--color-text-muted)',
    fontSize: '0.95rem',
  },
  muted: {
    color: 'var(--color-text-muted)',
  },
  error: {
    color: '#f85149',
  },
}
