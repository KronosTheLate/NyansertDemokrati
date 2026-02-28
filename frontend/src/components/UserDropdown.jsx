import React from 'react'

export default function UserDropdown({ users, selectedUserId, onSelect, disabled }) {
  return (
    <div style={styles.container}>
      <label htmlFor="user-select" style={styles.label}>
        Velg deg selv
      </label>
      <select
        id="user-select"
        value={selectedUserId ?? ''}
        onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
        style={styles.select}
      >
        <option value="">-- Velg bruker --</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  )
}

const styles = {
  container: {
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
    maxWidth: 280,
    padding: '0.6rem 0.75rem',
    fontSize: '1rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    color: 'var(--color-text)',
    cursor: 'pointer',
  },
}
