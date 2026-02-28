import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export async function getUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function getClaims() {
  const { data } = await api.get('/claims')
  return data
}

export async function getDistribution(claimId) {
  const { data } = await api.get(`/claims/${claimId}/distribution`)
  return data
}

export async function castVote(vote) {
  const { data } = await api.post('/votes', vote)
  return data
}
