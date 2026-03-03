import React, { useState, useEffect, useCallback } from 'react'
import UserDropdown from '../components/UserDropdown'
import ClaimRow from '../components/ClaimRow'
import { getUsers, getClaims, getMyVotes, castVote } from '../api'

const DEFAULT_VOTE = { vote_value: 0, claim_quality: true }

function votesEqual(a, b) {
  if (!a && !b) return true
  if (!a) a = DEFAULT_VOTE
  if (!b) b = DEFAULT_VOTE
  return a.vote_value === b.vote_value && a.claim_quality === b.claim_quality
}

export default function VotingPage() {
  const [users, setUsers] = useState([])
  const [claims, setClaims] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [savedVotesMap, setSavedVotesMap] = useState({})
  const [draftVotesMap, setDraftVotesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)

  const fetchInitial = useCallback(async () => {
    try {
      setError(null)
      const [usersData, claimsData] = await Promise.all([
        getUsers(),
        getClaims(),
      ])
      setUsers(usersData)
      setClaims(claimsData)
    } catch (err) {
      setError(err.message || 'Kunne ikke laste data')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVotes = useCallback(async () => {
    if (!selectedUserId) {
      setSavedVotesMap({})
      setDraftVotesMap({})
      return
    }
    try {
      const votes = await getMyVotes(selectedUserId)
      const map = {}
      votes.forEach((v) => {
        map[v.claim_id] = { vote_value: v.vote_value, claim_quality: v.claim_quality }
      })
      setSavedVotesMap(map)
      setDraftVotesMap(map)
    } catch (err) {
      setSavedVotesMap({})
      setDraftVotesMap({})
    }
  }, [selectedUserId])

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  const handleDraftChange = (claimId, voteValue, claimQuality) => {
    setDraftVotesMap((prev) => ({
      ...prev,
      [claimId]: { vote_value: voteValue, claim_quality: claimQuality },
    }))
    setSaveError(null)
  }

  const getChangedClaims = () => {
    return claims.filter((claim) => {
      const saved = savedVotesMap[claim.id]
      const draft = draftVotesMap[claim.id]
      return !votesEqual(saved, draft)
    })
  }

  const hasChanges = getChangedClaims().length > 0

  const handleSave = async () => {
    if (!hasChanges || !selectedUserId) return
    const changed = getChangedClaims()
    setSaving(true)
    setSaveError(null)
    try {
      for (const claim of changed) {
        const draft = draftVotesMap[claim.id] ?? DEFAULT_VOTE
        await castVote({
          user_id: selectedUserId,
          claim_id: claim.id,
          vote_value: draft.vote_value,
          claim_quality: draft.claim_quality,
        })
      }
      await fetchVotes()
    } catch (err) {
      setSaveError(err.response?.data?.detail || err.message || 'Kunne ikke lagre')
    } finally {
      setSaving(false)
    }
  }

  const getVoteForClaim = (claimId) => {
    const v = draftVotesMap[claimId]
    return {
      voteValue: v?.vote_value ?? 0,
      claimQuality: v?.claim_quality ?? true,
    }
  }

  if (loading) {
    return <p style={styles.muted}>Laster…</p>
  }

  if (error) {
    return (
      <div>
        <p style={styles.error}>{error}</p>
        <p style={styles.muted}>Sørg for at backend kjører.</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <UserDropdown
        users={users}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
      />

      {!selectedUserId ? (
        <p style={styles.muted}>Velg deg selv for å stemme.</p>
      ) : (
        <div style={styles.claimList}>
          <h2 style={styles.sectionTitle}>Dine stemmer</h2>
          {claims.map((claim) => {
            const { voteValue, claimQuality } = getVoteForClaim(claim.id)
            return (
              <ClaimRow
                key={claim.id}
                claim={claim}
                voteValue={voteValue}
                claimQuality={claimQuality}
                onChange={handleDraftChange}
                disabled={saving}
              />
            )
          })}

          {hasChanges && (
            <div style={styles.saveSection}>
              {saveError && <p style={styles.saveError}>{saveError}</p>}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving ? 'Lagrer…' : 'Lagre'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 680,
  },
  claimList: {
    marginTop: '1.5rem',
  },
  sectionTitle: {
    margin: '0 0 1rem',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  saveSection: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border)',
  },
  saveButton: {
    padding: '0.6rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'var(--color-accent)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
  },
  saveError: {
    color: '#f85149',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  muted: {
    color: 'var(--color-text-muted)',
    marginTop: '1rem',
  },
  error: {
    color: '#f85149',
    marginBottom: '0.5rem',
  },
}
