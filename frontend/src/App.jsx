import React, { useState, useEffect, useCallback } from 'react'
import UserDropdown from './components/UserDropdown'
import ClaimView from './components/ClaimView'
import { getUsers, getClaims, getDistribution, castVote } from './api'

export default function App() {
  const [users, setUsers] = useState([])
  const [claims, setClaims] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedClaimId, setSelectedClaimId] = useState(null)
  const [distribution, setDistribution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInitial = useCallback(async () => {
    try {
      setError(null)
      const [usersData, claimsData] = await Promise.all([
        getUsers(),
        getClaims(),
      ])
      setUsers(usersData)
      setClaims(claimsData)
      if (claimsData.length > 0 && !selectedClaimId) {
        setSelectedClaimId(claimsData[0].id)
      }
    } catch (err) {
      setError(err.message || 'Kunne ikke laste data')
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
    fetchInitial()
  }, [fetchInitial])

  useEffect(() => {
    fetchDistribution()
  }, [fetchDistribution])

  const handleVote = async (vote) => {
    await castVote(vote)
    await fetchDistribution()
  }

  const selectedClaim = claims.find((c) => c.id === selectedClaimId)

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.muted}>Laster…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={styles.error}>{error}</p>
        <p style={styles.muted}>Sørg for at backend kjører på localhost:8000</p>
      </div>
    )
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Nyansert Demokrati</h1>
        <p style={styles.tagline}>
          Fordi vi fortjener et demokrati som er like nyansert som folkene det består av.
        </p>
      </header>

      <main style={styles.main} className="main-grid">
        <aside style={styles.sidebar}>
          <UserDropdown
            users={users}
            selectedUserId={selectedUserId}
            onSelect={setSelectedUserId}
          />

          <div style={styles.claimList}>
            <label style={styles.label}>Velg påstand</label>
            <select
              value={selectedClaimId ?? ''}
              onChange={(e) => setSelectedClaimId(Number(e.target.value))}
              style={styles.select}
            >
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title.slice(0, 50)}
                  {c.title.length > 50 ? '…' : ''}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <section style={styles.content}>
          {selectedClaim ? (
            <ClaimView
              claim={selectedClaim}
              distribution={distribution}
              selectedUserId={selectedUserId}
              onVote={handleVote}
            />
          ) : (
            <p style={styles.muted}>Ingen påstander å vise</p>
          )}
        </section>
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
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
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
  main: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '2rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
  },
  claimList: {
    marginTop: '0.5rem',
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
  content: {
    minWidth: 0,
  },
  muted: {
    color: 'var(--color-text-muted)',
  },
  error: {
    color: '#f85149',
    marginBottom: '0.5rem',
  },
}
