import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export const LABELS = {
  '-2': 'Helt uenig',
  '-1': 'Delvis uenig',
  '0': 'Nøytral',
  '1': 'Delvis enig',
  '2': 'Helt enig',
}

export default function DistributionCharts({ distribution }) {
  const voteData = [-2, -1, 0, 1, 2].map((v) => ({
    name: LABELS[String(v)],
    value: distribution.vote_distribution[v] ?? 0,
  }))

  const QUALITY_LABELS = {
    '-1': 'Dårlig',
    '0': 'Middels',
    '1': 'God',
  }

  const qualityData = [-1, 0, 1].map((v) => ({
    name: QUALITY_LABELS[String(v)],
    value: distribution.claim_quality_distribution[v] ?? 0,
  }))

  const COLORS = ['#f85149', '#d29922', '#8b9eb5', '#3fb950', '#4a90d9']

  return (
    <div style={styles.grid}>
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>Stemmefordeling</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={voteData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {voteData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>Kvalitetsvurdering (-1 til 1)</h3>
        <h5 style={styles.chartTitle}>Hva folk synes om kvaliteten på påstanden slik den er formulert.</h5>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={qualityData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  chartBox: {
    minHeight: 200,
  },
  chartTitle: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
}
